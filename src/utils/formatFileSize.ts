function formatFileSize(numBytes?: number) {
    return numBytes !== undefined && numBytes !== null
        ? (numBytes / 1000000).toFixed(2) + ' MB'
        : 'Unknown';
}

export default formatFileSize;
