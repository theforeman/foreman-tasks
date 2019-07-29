import { updateURlQuery } from '../TasksTableHelpers';

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
});
