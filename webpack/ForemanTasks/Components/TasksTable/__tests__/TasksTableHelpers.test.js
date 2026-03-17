import { updateURlQuery, getDuration, getCSVurl } from '../TasksTableHelpers';

describe('updateURlQuery', () => {
  it('should use url with new query', () => {
    const history = {
      push: jest.fn(),
      location: {
        pathname: '/foreman_tasks/tasks/',
        search: '?state=stopped&result=error&page=1&per_page=20',
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
  const originalLocation = window.location;

  beforeEach(() => {
    delete window.location;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('should return correct url for subtasks', () => {
    window.location = new URL(
      'https://test.example.com/foreman_tasks/tasks/some-id/sub_tasks'
    );
    expect(getCSVurl()).toEqual('/foreman_tasks/tasks/some-id/sub_tasks.csv');
  });

  it('should append .csv to current pathname', () => {
    window.location = new URL('https://test.example.com/foreman_tasks/tasks');
    expect(getCSVurl()).toMatch(/^\/foreman_tasks\/tasks\.csv/);
  });
});
