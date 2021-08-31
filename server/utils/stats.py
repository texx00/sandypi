import json
from time import time, sleep
from threading import Lock, Thread
import os

STATS_PATH = "./server/saves/stats.json"
SLEEP_TIME = 60                                 # will keep updating the "on_time" every n seconds
INIT_DICT = {
    "last_on": 0.0,                             # last timestamp at wich the device was on [s]
    "total_length": 0.0,                        # total lenght run by the sphere [mm]
    "run_time": 0.0,                            # motors run time [s]
    "on_time": 0.0                              # total device on time [s]
}

def load_stats():
    if not os.path.isfile(STATS_PATH): 
        stats = INIT_DICT
    else: 
        with open(STATS_PATH) as f:
            stats = json.load(f) 
    return stats

def save_stats(stats):
    dataj = json.dumps(stats, indent=4)
    with open(STATS_PATH, "w") as f:
        f.write(dataj)

class StatsManager():
    def __init__(self):
        self.stats = load_stats()
        self.stats["last_on"] = time()
        self.start_time = 0
        self._mutex = Lock()
        self._th = Thread(target = self._thf)
        self._th.name = "stats_manager"
        self._th.daemon = True
        self._th.start()
    
    def drawing_started(self):
        with self._mutex:
            self.start_time = time()

    def drawing_ended(self, drawing_length):
        with self._mutex:
            if drawing_length != 0:
                self.stats["total_length"] += drawing_length
                if not self.start_time == 0:
                    self.stats["run_time"] += time() - self.start_time
            self.start_time = 0
        self._update_stats()

    def _update_stats(self):
        with self._mutex:
            t = time()
            self.stats["on_time"] += t - self.stats["last_on"]
            self.stats["last_on"] = t
            save_stats(self.stats)

    def _thf(self):
        while True:
            self._update_stats()
            sleep(SLEEP_TIME)

if __name__ == "__main__":
    sm = StatsManager()
    sm.drawing_started()
    WAIT_SECONDS = 10
    for i in range(WAIT_SECONDS):
        print(f"Waiting {WAIT_SECONDS-i} more seconds")
        sleep(1)
    sm.drawing_ended(10.4)