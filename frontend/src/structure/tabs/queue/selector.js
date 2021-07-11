
//returns true if the queue is empty
const getQueueEmpty =           state => {return state.queue.elements.length === 0};

// returns the list of elements in the queue
const getQueueElements =        state => {return state.queue.elements};

// returns the currently used element
const getQueueCurrent =         state => {return state.queue.currentElement};

// returns the progress {eta, units}
const getQueueProgress =        state => {return state.queue.status.progress};

// returns true if the feeder is paused
const getIsQueuePaused =        state => {return state.queue.status.is_paused};

// returns true if the repeat mode is currently selected
const getQueueRepeat =          state => {return state.queue.repeat}

// returns true if the shuffle mode is currently selected
const getQueueShuffle =         state => {return state.queue.shuffle}

// returns true if the server is running, false, if is on hold
const getQueueIsRunning =       state => {return state.queue.status.is_running}

// returns the current interval value for the queue
const getIntervalValue =        state => {return state.queue.interval}

export {
    getQueueEmpty, 
    getQueueElements, 
    getQueueCurrent, 
    getQueueProgress, 
    getIsQueuePaused, 
    getQueueRepeat, 
    getQueueShuffle, 
    getQueueIsRunning, 
    getIntervalValue
};