from server.sockets_interface.socketio_callbacks import playlist_queue
from server.database.models import Playlists, UploadedFiles
from server.database.playlist_elements import DrawingElement, ShuffleElement, TimeElement

class ContinuousQueueGenerator:
    def __init__(self, shuffle=False, interval=0, playlist=0):
        self.shuffle = shuffle
        self.set_interval(interval)
        self.just_started = True
        self.playlist = playlist
        # if should not shuffle starts from the first drawing in the list
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
    
    # set the interval
    def set_interval(self, interval):
        self.interval = interval
    
    def set_shuffle(self, shuffle):
        self.shuffle = shuffle
    
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
    def generate_next_elements(self, _depth=0):
        try:
            if self.just_started or self.interval == 0:
                self.just_started = False
                return [self.generate_drawing_element()]
            else: 
                return [self.generate_timing_element(), self.generate_drawing_element()]
        except StopIteration:
            if _depth==0:   # check the depth to get only one recursion
                # when the list to run is empty restart
                self._uploaded_files_generator = self._create_uploaded_files_generator()
                return self.generate_next_elements(self, _depth=1)
            else: return None
            

        # TODO May change the queue behaviour in the next updates to show the playlist instead of single elements 

    # private function to iterate over the list of cached drawings (only if is not shuffling)
    def _create_uploaded_files_generator(self):
        if not self.elements is None:
            for el in self.elements:
                yield el