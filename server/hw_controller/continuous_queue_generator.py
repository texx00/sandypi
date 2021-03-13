from server.database.models import UploadedFiles
from server.database.playlist_elements import DrawingElement, ShuffleElement, TimeElement

class ContinuousQueueGenerator:
    def __init__(self, shuffle=False, interval=300):
        self.shuffle = shuffle
        self.set_interval(interval)
        self.just_started = True
        # if should not shuffle starts from the first drawing on
        # caches the list of drawings to avoid problems with newly created items
        if not self.shuffle:
            self.drawings = UploadedFiles.get_full_drawings_list()
        self._uploaded_files_generator = self._create_uploaded_files_generator()
    
    def set_interval(self, interval):
        self.interval = interval
    
    # return an element to put as a delay between drawings
    def generate_timing_element(self):
        return TimeElement(delay=self.interval, type="delay")

    # return the drawing to run
    def generate_drawing_element(self):
        if self.shuffle:
            return ShuffleElement()                     # create directly a shuffle element
        else:
            return next(self._uploaded_files_generator) # get next element from uploaded files

    # generate the next element(s) for the queue
    def generate_next_elements(self):
        if self.just_started or self.interval == 0:
            return [self.generate_drawing_element()]
        else: 
            return [self.generate_timing_element(), self.generate_drawing_element()]

    # private function to iterate over the list of cached drawings (only if is not shuffling)
    def _create_uploaded_files_generator(self):
        if not self.drawings is None:
            for dr in self.drawings:
                yield DrawingElement(drawing_id=dr.id)
        else: yield None