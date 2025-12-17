export default function slugify(text: string) {
  return text.replaceAll(' ', '-');
}
