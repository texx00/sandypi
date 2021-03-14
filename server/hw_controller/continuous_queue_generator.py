from server.sockets_interface.socketio_callbacks import playlist_queue
from server.database.models import Playlists, UploadedFiles
from server.database.playlist_elements import DrawingElement, ShuffleElement, TimeElement

class ContinuousQueueGenerator:
    def __init__(self, shuffle=False, interval=300, playlist=0):
        self.shuffle = shuffle
        self.set_interval(interval)
        self.just_started = True
        self.playlist = playlist
        # if should not shuffle starts from the first drawing on
        # caches the list of drawings to avoid problems with newly created items
        if not self.shuffle:
            if self.playlist == 0:
                drawings = UploadedFiles.get_full_drawings_list()
                self.elements = []
                for dr in drawings:
                    self.elements.append(DrawingElement(drawing_id=dr.id))
            else:
                item = Playlists.get_playlist(self.playlist)
                self.elements = item.get_elements()
                
        self._uploaded_files_generator = self._create_uploaded_files_generator()
    
    # if is running a playlist may be better to set the interval for each single playlist
    def set_interval(self, interval):
        self.interval = interval
    
    # return an element to put as a delay between drawings
    def generate_timing_element(self):
        return TimeElement(delay=self.interval, type="delay")

    # return the drawing to run
    def generate_drawing_element(self):
        if self.shuffle:
            if self.playlist != 0:
                return ShuffleElement(shuffle_type="1", playlist_id=self.playlist)
            return ShuffleElement()                     # create directly a shuffle element
        else:
            return next(self._uploaded_files_generator) # get next element from uploaded files

    # generate the next element(s) for the queue
    def generate_next_elements(self):
        try:
            if self.just_started or self.interval == 0:
                return [self.generate_drawing_element()]
            else: 
                return [self.generate_timing_element(), self.generate_drawing_element()]
        except StopIteration:
            # when the list to run is empty returns None
            return None

        # TODO should return all the elements for a playlist to fill the queue properly
        # TODO May change the queue behaviour in the next updates to show the playlist instead of single elements 

    # private function to iterate over the list of cached drawings (only if is not shuffling)
    def _create_uploaded_files_generator(self):
        if not self.elements is None:
            for el in self.elements:
                yield el