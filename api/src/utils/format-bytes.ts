export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' Bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(0) + ' Kb';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(0) + ' Mb';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(0) + ' Gb';
  }
}
