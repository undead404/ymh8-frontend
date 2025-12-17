export default function formatWeight(weight: number) {
  if (weight >= 1e9) return `${(weight / 1e9).toFixed(2)}B`;
  if (weight >= 1e6) return `${(weight / 1e6).toFixed(2)}M`;
  if (weight >= 1e3) return `${(weight / 1e3).toFixed(2)}K`;
  return weight.toFixed(0);
}
