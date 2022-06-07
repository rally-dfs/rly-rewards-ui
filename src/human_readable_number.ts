const suffixes = ['k', 'm', 'b', 't'].map((r) => r.toUpperCase());

export function humanReadableNumber(value: number) {
  const maxDisplay = 1_000;

  let valueToShow = value;
  let suffixIndex = -1;

  while (valueToShow > maxDisplay && suffixIndex < suffixes.length - 1) {
    valueToShow /= maxDisplay;
    suffixIndex++;
  }

  return valueToShow.toFixed(2) + (suffixes[suffixIndex] || '');
}
