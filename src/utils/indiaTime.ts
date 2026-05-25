/** IST formatting aligned with ThanePropertySearch.Web Infrastructure/IndiaTime.cs */
export function formatIndiaDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
