
const getQueueEmpty = state => {return state.queue.isQueueEmpty};

const getQueueElements = state => {return state.queue.elements};

const getQueueDrawingId = state => {return state.queue.drawingId};

export {getQueueEmpty, getQueueElements, getQueueDrawingId};