export default function encodeLastfmUrlComponent(component: string) {
  return encodeURIComponent(component.replaceAll('+', '%2B'));
}
