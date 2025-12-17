import slugify from "../utils/slugify";
import getAlbumPlaces from "./get-album-places";
import getAlbumTags from "./get-album-tags";
import getTagBySlug from "./get-tag-by-slug";

export default async function getTagList(tagSlug: string) {
  console.log(`getTagList`, tagSlug);
  const tagList = await getTagBySlug(tagSlug);
  if (!tagList) {
    throw new Error(`List for ${tagSlug} not found`);
  }
  return {
    ...tagList,
    list: await Promise.all(
      tagList.list.map(async (listItem) => {
        const [albumPlaces, albumTags] = await Promise.all([
          getAlbumPlaces(listItem),
          getAlbumTags(listItem),
        ]);
        return {
          ...listItem,
          places: albumPlaces.filter(
            ({ tagName }) => slugify(tagName) !== tagSlug
          ),
          tags: albumTags.filter(({ tagName }) => slugify(tagName) !== tagSlug),
        };
      })
    ),
  };
}
