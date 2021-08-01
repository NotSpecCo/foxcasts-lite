export function formatFileSize(numBytes?: number): string {
  return numBytes !== undefined && numBytes !== null
    ? `${(numBytes / 1000000).toFixed(2)} MB`
    : 'Unknown';
}
