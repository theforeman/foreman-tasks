import { foremanUrl } from 'foremanReact/common/helpers';

export const foremanTasksApiPath = path =>
  foremanUrl(`/foreman_tasks/api/tasks/${path}`);

export const foremanTasksPath = path =>
  foremanUrl(`/foreman_tasks/tasks/${path}`);
