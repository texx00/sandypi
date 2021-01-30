
const getQueueEmpty = state => {return state.queue.isQueueEmpty};

const getQueueElements = state => {return state.queue.elements};

const getQueueCurrent = state => {return state.queue.currentElement};

export {getQueueEmpty, getQueueElements, getQueueCurrent};