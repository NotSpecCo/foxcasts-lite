import formatTime from './formatTime';

describe('formatTime', () => {
  it('should format seconds into a nicer format', () => {
    expect(formatTime(0)).toEqual('0:00');
    expect(formatTime(15)).toEqual('0:15');
    expect(formatTime(60)).toEqual('1:00');
    expect(formatTime(90)).toEqual('1:30');
    expect(formatTime(3600)).toEqual('1:00:00');
    expect(formatTime(7275)).toEqual('2:01:15');
    expect(formatTime(36000)).toEqual('10:00:00');
  });

  it('should handle negative values', () => {
    expect(formatTime(0)).toEqual('0:00');
    expect(formatTime(-15)).toEqual('-0:15');
    expect(formatTime(-60)).toEqual('-1:00');
    expect(formatTime(-90)).toEqual('-1:30');
    expect(formatTime(-3600)).toEqual('-1:00:00');
    expect(formatTime(-7275)).toEqual('-2:01:15');
    expect(formatTime(-36000)).toEqual('-10:00:00');
  });
});
