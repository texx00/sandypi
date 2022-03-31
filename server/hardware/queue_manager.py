from queue import Queue
from json import dumps
from threading import RLock, Thread
import time
from random import randrange
from dotmap import DotMap

from server.utils import settings_utils
from server.database.playlist_elements import ShuffleElement, TimeElement

TIME_CONVERSION_FACTOR = 60 * 60  # hours to seconds
QUEUE_UPDATE_INTERVAL = 30  # send the updated queue status every # seconds


class QueueStatusUpdater(Thread):
    """
    Keep updating the queue status every given seconds
    """

    def __init__(
        self, timeout, queue_manager, group=None, target=None, name=None, args=(), kwargs=None
    ):
        """
        Args:
            timeout: the interval between the calls
            queue_manager: the queue manager of which the status should be sent
        """
        super(QueueStatusUpdater, self).__init__(group=group, target=target, name=name)
        self.name = "queue_status_updater"
        self.timeout = timeout
        self.queue_manager = queue_manager
        self.setDaemon(True)

    def run(self):
        while True:
            # updates the queue status every 30 seconds but only while is drawing
            time.sleep(self.timeout)
            if self.queue_manager.is_drawing():
                self.queue_manager.send_queue_status()


class QueueManager:
    """
    This class manages the queue of elements that must be used
    Can be filled one element at a time or by a playlist
    """

    def __init__(self, app, socketio):
        """
        Args:
            * app
            * socketio istance
        """
        # uses RLock to allow recursive call of functions
        self.app = app
        self.socketio = socketio
        self._mutex = RLock()

        self.q = Queue()
        self._element = None
        # timestamp of the end of the last drawing
        # used to understand if can start a new drawing or should put a delay element in between in the case an interval is choosen
        self._last_time = 0
        # _is_force_stop is used to understand if the drawing_ended event was called because the drawing is ended or because of the stop button was used
        self._is_force_stop = False
        # play_random is "True" if the device was started with a "start a random drawing" commands
        self._started_as_play_random_drawing = False

        # queue controls status
        self._controls = DotMap()
        self._controls._repeat = False  # true -> doesn't delete the current element from the queue
        self._controls._shuffle = False  # true -> shuffle the queue
        self._controls._interval = 0.0  # pause between drawing in repeat mode

        # status timer setup (keep updating the queue status every given seconds)
        self._updater = QueueStatusUpdater(QUEUE_UPDATE_INTERVAL, self)
        self._updater.start()

    @property
    def element(self):
        """
        Returns:
            the current element being drawn
        """
        with self._mutex:
            return self._element

    @element.setter
    def element(self, element):
        """
        Set the current queue element

        Args:
            el: the element to use
        """
        with self._mutex:
            self.app.logger.info("Now running: {}".format(element))
            self._element = element

    @property
    def repeat(self):
        """
        The repeat option is used to keep a drawing in the queue.
        If the value is False, at the end of the drawing the element is removed from the feeder queue.
        If the value is True, the current drawing is put at the end of the queue

        Returns:
            True if the repeat option is enabled, False otherwise
        """
        with self._mutex:
            return self._controls._repeat

    @repeat.setter
    def repeat(self, val):
        """
        Set the "repeat" value

        Args:
            val: True if must keep the current drawing in the queue after is finished

        Raises:
            ValueError: the argument must be boolean
        """
        with self._mutex:
            if not type(val) == type(True):
                raise ValueError("The argument must be boolean")
            self._controls._repeat = val
            if val and (len(self.q.queue) > 0) and self._started_as_play_random_drawing:
                self._put_random_element_in_queue()
                self.send_queue_status()
            else:
                if self._started_as_play_random_drawing:
                    self.clear_queue()
                self.reset_random_queue()

    @property
    def shuffle(self):
        """
        The shuffle flag is used to play the elements in the queue in a random order

        Returns:
            True if the elements in the queue are played in a random order
        """
        with self._mutex:
            return self._controls._shuffle

    @shuffle.setter
    def shuffle(self, val):
        """
        Args:
            val: True to play the queue in a random order, False to follow the queue order

        Raises:
            ValueError: the argument must be boolean
        """
        with self._mutex:
            if not (type(val) == type(True)):
                raise ValueError("The argument must be boolean")
            self._controls._shuffle = val

    @property
    def interval(self):
        """
        If the waiting time between drawings is different than 0, the queue manager will wait
        the interval time before running the next element in the queue
        Returns:
            the waiting time between drawings.
        """
        with self._mutex:
            return self._controls._interval

    @interval.setter
    def interval(self, interval):
        """
        If an interval is set, a waiting time will be observed between elements

        Args:
            interval: waiting time between drawings
        """
        with self._mutex:
            self._controls._interval = interval

    def is_queue_empty(self):
        """
        Check if the queue is empty and the feeder is not running

        Returns:
            True if the queue is empty and it is not drawing, False otherwise
        """
        with self._mutex:
            return not self.is_drawing() and len(self.q.queue) == 0

    def is_paused(self):
        """
        Check if the device is paused or not

        Returns:
            True if the device is paused
        """
        with self._mutex:
            return self.app.feeder.status.paused

    def is_drawing(self):
        """
        Check if there is a drawing being done

        Returns:
            True if there is a drawing running in the feeder
        """
        with self._mutex:
            return self.app.feeder.status.running

    def pause(self):
        """
        Pause the feeder
        """
        with self._mutex:
            self.app.feeder.pause()
            self.send_queue_status()
            self.app.logger.info("Drawing paused")

    def resume(self):
        """
        Resume the feeder to the "drawing" status
        """
        with self._mutex:
            self.app.feeder.resume()
            self.send_queue_status()
            self.app.logger.info("Drawing resumed")

    def stop(self):
        """
        Stop the current element
        """
        with self._mutex:
            self._started_as_play_random_drawing = False
            self._is_force_stop = True
            self.app.feeder.stop()

    def reset_random_queue(self):
        """
        Stop the queue manager to keep on using random drawings

        This is necessary only when a manual change is done to the queue and the start command was given with the "play random drawing" button
        """
        with self._mutex:
            self._started_as_play_random_drawing = False

    def clear_queue(self):
        """
        Clear the current queue
        """
        with self._mutex:
            self.q.queue.clear()
            self.send_queue_status()

    def get_queue_len(self):
        """
        Return the queue length

        Returns:
            the queue length
        """
        with self._mutex:
            return self.q.qsize()

    def start_random_drawing(self, repeat=False):
        """
        Start playing random drawings from the full uploaded list
        Will work only if the queue is empty

        Args:
            repeat: True if should keep drawing after the current drawing is finished
                    Will set/reset the repeat flag, can be changed from the UI with the "repeat" button
        """
        with self._mutex:
            if self.is_queue_empty():
                # keep track that we started with a random drawing request
                self._started_as_play_random_drawing = True
                self.shuffle = True
                self.repeat = repeat
                self.clear_queue()
                self._put_random_element_in_queue()
                self.start_next()

    def queue_element(self, element, show_toast=True):
        """
        Add an element to the queue
        If the queue is empty, directly start the drawing

        Args:
            element: the element to add/start
            show_toast: (default) True if should show on the UI a toast that the drawing has been added to the queue
        """
        with self._mutex:
            # if the queue is empty, instead of adding the element to the queue, will start it directly
            if self.is_queue_empty():
                self._start_element(element)
                return
            self.app.logger.info("Adding {} to the queue".format(element))
            self.q.put(element)  # adding the element to the queue
            if show_toast:  # emitting the socket only if the show_toast flag is True
                self.app.semits.show_toast_on_UI("Element added to the queue")
            # refresh the queue status
            self.send_queue_status()

    def set_element_ended(self):
        """
        Set the current element as ended and start the next element if the queue is not empty
        """
        with self._mutex:
            # if the ended element was forced to stop should not set the "last_time" otherwise when a new element is started there will be a delay element first
            if self._is_force_stop:
                # avoid setting the time and reset the flag
                self._is_force_stop = False
            else:
                # the drawing was ended correctly (not stopped manually) and thus need to store the end time in case a delay element must be used
                self._last_time = time.time()
            # start the next element in the queue if necessary
            self.start_next()

    def set_new_order(self, elements):
        """
        Set the new queue order

        Args:
            elements: list of elements with the correct order
        """
        # Overwrite the queue completely thus first need to clear it completely
        with self._mutex:
            # avoid using the self.clear_queue in order not to send the status for nothing
            self.q.queue.clear()
            # fill the queue with the new elements
            for el in elements:
                if el != 0:
                    self.q.put(el)
            # now can send back the new queue status
            self.send_queue_status()

    def start_next(self, force_stop=False):
        """
        Start the next drawing in the queue

        By default will start only if not already drawing something

        Args:
            force_stop: if True, force the current drawing/element stop and start the next one

        """
        with self._mutex:
            if self.is_drawing():
                if not force_stop:
                    # if should not force the stop will exit the function
                    return
                else:
                    # will reset the last_time to 0 in order to get the next element running without a delay and stop the current drawing.
                    # Once the current drawing the next drawing should start from the feeder event manager
                    self._last_time = 0
                    self.stop()
                    return

            try:
                # should not remove the element from the queue if repeat is active. Should just add it back at the end of the queue
                # avoid putting back interval delay element thanks to the "_repeat_off" property added when the delay element is created
                if (
                    (not self._element is None)
                    and (self.repeat)
                    and (not hasattr(self._element, "_repeat_off"))
                ):
                    # check if the last element was generated by a "shuffle element"
                    # in that case must use again a shuffle element instead of the same element
                    if hasattr(self._element, "was_shuffle"):
                        self._put_random_element_in_queue()
                    else:
                        self.q.put(self._element)

                self._element = None
                # if the queue is empty should just exit because there is no next element to start
                if self.get_queue_len() == 0:
                    return

                # if the interval value is set and different than 0 may need to put a delay in between drawings
                if self.interval != 0:
                    # add the interval to the timestap of the last drawing end and check if it bigger than the current timestamp to check if need to insert a delay element
                    if self._last_time + self.interval * TIME_CONVERSION_FACTOR > time.time():
                        element = TimeElement(
                            delay=self.interval * TIME_CONVERSION_FACTOR
                            + time.time()
                            - self._last_time,
                            type="delay",
                        )
                        # set a flag on the delay element to distinguish if it was created because there is a interval set
                        # the same flag is checked when the current element is check in order to add it back to the queue if the repeat flag is set
                        element._repeat_off = True
                        # if the element is a forced delay start it directly and exit the current method
                        self._start_element(element)
                        return

                next_element = None
                # if shuffle is enabled select a random drawing from the queue otherwise uses the first element of the queue
                if self.shuffle:
                    tmp = None
                    elements = list(self.q.queue)
                    if (
                        len(elements) > 1
                    ):  # if the list is longer than 2 will pop the last element to avoid using it again
                        tmp = elements.pop(-1)
                    next_element = elements.pop(randrange(len(elements)))
                    elements.append(tmp)
                    self.set_new_order(elements)
                else:
                    next_element = self.q.queue.popleft()
                # start the choosen element
                self._start_element(next_element)
                self.app.logger.info("Starting next element: {}".format(next_element))

            except RecursionError as exception:
                self.app.logger.exception(exception)
                return
            except Exception as exception:
                self.app.logger.exception(exception)
                self.app.logger.error(
                    "An error occured while starting a new drawing from the queue:\n{}".format(
                        str(exception)
                    )
                )
                if self.get_queue_len() != 0:
                    self.start_next()

    def send_queue_status(self):
        """
        Send the queue status to the frontend
        """
        with self._mutex:
            els = [i for i in self.q.queue if not i is None]
            elements = (
                list(map(lambda x: str(x), els)) if len(els) > 0 else []
            )  # converts elements to json
            res = {
                "current_element": str(self._element),
                "elements": elements,
                "status": self.app.feeder.status.toDict(),
                "repeat": self.repeat,
                "shuffle": self.shuffle,
                "interval": self.interval,
            }
            self.app.semits.emit("queue_status", dumps(res))

    def _start_element(self, element):
        """
        Start the given element
        """
        with self._mutex:
            # check if a new element must be generated from the given element (like for a shuffle element)
            if not element is None:
                element = element.before_start(self.app)
            if not element is None:
                self.app.logger.info("Sending gcode start command")
                self.app.feeder.start_element(element)
            else:
                self.start_next()

    def _put_random_element_in_queue(self):
        """
        Queue a new random element from the full list of drawings
        """
        with self._mutex:
            # add the element to the queue without calling "queue_element" because this method is called also inside the start_next drawing and will be called twice
            self.q.put(ShuffleElement(shuffle_type="0"))

    # TODO move this method into an "startup manager" which will need to initialize queue manager and initial status

    # checks if should start drawing after the server is started and ready (can be set in the settings page)
    def check_autostart(self):
        with self._mutex:
            autostart = settings_utils.get_only_values(settings_utils.load_settings()["autostart"])

            if autostart["on_ready"]:
                self.start_random_drawing(repeat=True)
                self.repeat = True

                try:
                    if autostart["interval"]:
                        self.interval = float(autostart["interval"])
                except Exception as e:
                    self.app.logger.exception(e)
