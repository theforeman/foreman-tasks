import { updateURlQuery } from '../TasksTableHelpers';

describe('updateURlQuery', () => {
  it('should use url with new query', () => {
    Object.defineProperty(window, 'location', {
      value: {
        href:
          'https://localhost/foreman_tasks/tasks/?state=stopped&result=error&page=1&per_page=20',
      },
    });
    window.history.pushState = jest.fn();
    const query = { time_mode: 'recent', per_page: 35 };
    updateURlQuery(query);
    const newURL =
      'https://localhost/foreman_tasks/tasks/?state=stopped&result=error&page=1&per_page=35&time_mode=recent';
    expect(window.history.pushState).toBeCalledWith(
      { path: newURL },
      '',
      newURL
    );
  });
});
