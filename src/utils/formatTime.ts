const formatTime = (rawSeconds: number) => {
    let isNegative = false;

    if (rawSeconds < 0) {
        isNegative = true;
        rawSeconds = Math.abs(rawSeconds);
    }

    const hours = Math.floor(rawSeconds / 60 / 60);
    const minutes = Math.floor((rawSeconds / 60) % 60);
    const seconds = Math.floor(rawSeconds % 60);

    let time = '';
    time += hours > 0 ? hours.toString() + ':' : '';
    time += hours > 0 ? minutes.toString().padStart(2, '0') + ':' : minutes.toString() + ':';
    time += seconds.toString().padStart(2, '0');

    return isNegative ? `-${time}` : time;
};

export default formatTime;
