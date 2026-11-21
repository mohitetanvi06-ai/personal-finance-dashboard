export function formatCalendarNoteDate(dateKey, options = {}) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", options);
}
