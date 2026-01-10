export function formatDate(dateStr, format = 'full') {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  if (format === 'short') {
    return `${month}-${day}`;
  }

  return `${year}年${month}月${day}日`;
}
