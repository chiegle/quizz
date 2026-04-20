export function getContrastColor(hex: string) {
  if (!hex || hex === 'transparent' || hex === '#ffffff') return '#000000';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? '#000000' : '#ffffff';
}

export function getTodayString() {
  return new Date().toLocaleString("en-CA", { timeZone: "Europe/Paris" }).split(',')[0];
}
