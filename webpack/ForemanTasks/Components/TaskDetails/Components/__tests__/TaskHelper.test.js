import { durationInWords } from '../TaskHelper';

describe('durationInWords', () => {
  it('should work for seconds', () => {
    expect(durationInWords('1/1/1 10:00:00', '1/1/1 10:00:01')).toEqual({
      text: '1 second',
      tooltip: '1 seconds',
    });
  });
  it('should work for minutes', () => {
    expect(durationInWords('1/1/1 10:00:00', '1/1/1 10:02:01')).toEqual({
      text: '2 minutes',
      tooltip: '121 seconds',
    });
  });
  it('should work for hours', () => {
    expect(durationInWords('1/1/1 10:00:00', '1/1/1 13:00:01')).toEqual({
      text: '3 hours',
      tooltip: '10,801 seconds',
    });
  });
});
