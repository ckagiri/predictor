export const UNDOABLE = 'RA/UNDOABLE';

export const startUndoable = action => ({
  type: UNDOABLE,
  payload: { action },
});

export const UNDO = 'RA/UNDO';
export const undo = () => ({
  type: UNDO,
});

export const COMPLETE = 'RA/COMPLETE';
export const complete = () => ({
  type: COMPLETE,
});

export const START_OPTIMISTIC_MODE = 'RA/START_OPTIMISTIC_MODE';
export const startOptimisticMode = () => ({
  type: START_OPTIMISTIC_MODE,
});

export const STOP_OPTIMISTIC_MODE = 'RA/STOP_OPTIMISTIC_MODE';
export const stopOptimisticMode = () => ({
  type: STOP_OPTIMISTIC_MODE,
});
