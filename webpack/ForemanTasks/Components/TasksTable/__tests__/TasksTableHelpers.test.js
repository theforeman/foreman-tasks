import { updateURlQuery, getDuration, getCSVurl } from '../TasksTableHelpers';

describe('updateURlQuery', () => {
  it('should use url with new query', () => {
    const history = {
      push: jest.fn(),
      location: {
        pathname:
          '/foreman_tasks/tasks/?state=stopped&result=error&page=1&per_page=20',
      },
    };
    const query = { time_mode: 'recent', per_page: 35 };
    updateURlQuery(query, history);
    const newURL =
      '?state=stopped&result=error&page=1&per_page=35&time_mode=recent';
    expect(history.push).toBeCalledWith(newURL);
  });
  it('getDuration should work', () => {
    const duration = getDuration('1/1/2000 11:00', '1/1/2000 11:25');
    expect(duration.text).toEqual('25 minutes');
    expect(duration.tooltip).toEqual(undefined);
  });
  it('getDuration should work without start date', () => {
    const duration = getDuration('', '1/1/2000 11:25');
    expect(duration.text).toEqual('N/A');
    expect(duration.tooltip).toEqual('Task was canceled');
  });
});

describe('getCSVurl', () => {
  it('should return currect url for tasks with search', () => {
    const url = '/foreman_tasks/tasks';
    const query = { state: 'stopped' };
    expect(getCSVurl(url, query)).toEqual(
      '/foreman_tasks/tasks.csv?search=%28state%3Dstopped%29'
    );
  });
  it('should return currect url for subtasks', () => {
    const url = '/foreman_tasks/tasks/some-id/sub_tasks';
    expect(getCSVurl(url, {})).toEqual(
      '/foreman_tasks/tasks/some-id/sub_tasks.csv'
    );
  });
});
