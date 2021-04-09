
//returns true if the queue is empty
const getQueueEmpty =           state => {return state.queue.isQueueEmpty};

// returns the list of elements in the queue
const getQueueElements =        state => {return state.queue.elements};

// returns the currently used element
const getQueueCurrent =         state => {return state.queue.currentElement};

// returns the current interval between drawings for the continuous mode
const getQueueIntervalValue =   state => {return state.queue.intervalValue};

// returns true if the continuous mode is shuffle
const getQueueShuffle =         state => {return state.queue.shuffle};

// returns the progress {eta, units}
const getQueueProgress =        state => {return state.queue.status.progress};

// returns true if the feeder is paused
const getIsQueuePaused =        state => {return state.queue.status.is_paused};

export {getQueueEmpty, getQueueElements, getQueueCurrent, getQueueIntervalValue, getQueueShuffle, getQueueProgress, getIsQueuePaused};