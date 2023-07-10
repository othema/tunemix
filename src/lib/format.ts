export function formatDuration(duration: string) {
  const parts = duration.split(":");
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10) || 0;
    minutes = parseInt(parts[1], 10) || 0;
    seconds = parseInt(parts[2], 10) || 0;
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10) || 0;
    seconds = parseInt(parts[1], 10) || 0;
  } else if (parts.length === 1) {
    seconds = parseInt(parts[0], 10) || 0;
  }

  return hours * 3600 + minutes * 60 + seconds;
}
