
const getQueueEmpty =           state => {return state.queue.isQueueEmpty};

const getQueueElements =        state => {return state.queue.elements};

const getQueueCurrent =         state => {return state.queue.currentElement};

const getQueueIntervalValue =   state => {return state.queue.intervalValue};

const getQueueShuffle =         state => {return state.queue.shuffle};

const getQueueProgress =        state => {return state.queue.status.progress};

const getIsQueuePaused =        state => {return state.queue.status.is_paused};

export {getQueueEmpty, getQueueElements, getQueueCurrent, getQueueIntervalValue, getQueueShuffle, getQueueProgress, getIsQueuePaused};