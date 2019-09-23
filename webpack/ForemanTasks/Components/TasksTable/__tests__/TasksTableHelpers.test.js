import { updateURlQuery, getDuration } from '../TasksTableHelpers';

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
