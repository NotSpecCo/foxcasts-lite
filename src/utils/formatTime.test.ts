import { expect } from 'chai';
import formatTime from './formatTime';

describe('formatTime', () => {
    it('should format seconds into a nicer format', () => {
        expect(formatTime(0)).equal('0:00');
        expect(formatTime(15)).equal('0:15');
        expect(formatTime(60)).equal('1:00');
        expect(formatTime(90)).equal('1:30');
        expect(formatTime(3600)).equal('1:00:00');
        expect(formatTime(7275)).equal('2:01:15');
        expect(formatTime(36000)).equal('10:00:00');
    });

    it('should handle negative values', () => {
        expect(formatTime(0)).equal('0:00');
        expect(formatTime(-15)).equal('-0:15');
        expect(formatTime(-60)).equal('-1:00');
        expect(formatTime(-90)).equal('-1:30');
        expect(formatTime(-3600)).equal('-1:00:00');
        expect(formatTime(-7275)).equal('-2:01:15');
        expect(formatTime(-36000)).equal('-10:00:00');
    });
});
