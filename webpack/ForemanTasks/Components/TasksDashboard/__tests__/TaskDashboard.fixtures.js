export const correctTime = 'H24';
export const wrongTime = 'H25';
export const parentTaskID = 7;
export const taskSummary = {
  tasksSummary: {
    running: {
      recent: 0,
      total: 3,
    },
    paused: {
      recent: 0,
      total: 54,
    },
    stopped: {
      recent: 0,
      total: 768,
      by_result: {
        success: {
          recent: 0,
          total: 532,
        },
        error: {
          recent: 0,
          total: 121,
        },
        warning: {
          recent: 0,
          total: 10,
        },
        cancelled: {
          recent: 0,
          total: 105,
        },
      },
    },
    scheduled: {
      recent: 0,
      total: 7,
    },
  },
};

export const subtaskSummary = {
  tasksSummary: {
    running: {
      recent: 0,
      total: 3,
    },
    paused: {
      recent: 0,
      total: 7,
    },
    stopped: {
      recent: 0,
      total: 0,
      by_result: {
        success: {
          recent: 0,
          total: 0,
        },
        error: {
          recent: 0,
          total: 0,
        },
        warning: {
          recent: 0,
          total: 0,
        },
        cancelled: {
          recent: 0,
          total: 0,
        },
      },
    },
    scheduled: {
      recent: 0,
      total: 7,
    },
  },
};

export const apiGetMock = async path => {
  if (path.endsWith(`/tasks/summary/${correctTime}`)) {
    return { data: taskSummary };
  } else if (
    path.endsWith(`/tasks/summary/${parentTaskID}/sub_tasks/${correctTime}`)
  ) {
    return { data: subtaskSummary };
  }

  throw new Error('wrong time');
};
