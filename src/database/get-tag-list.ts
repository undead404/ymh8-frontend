import type { Logger } from '../schemata';

import getTagBySlug from './get-tag-by-slug';

export default async function getTagList(
  tagSlug: string,
  logger: Logger = console,
) {
  logger.info(`getTagList(${tagSlug})`);
  const tagList = await getTagBySlug(tagSlug);
  if (!tagList) {
    throw new Error(`List for ${tagSlug} not found`);
  }
  return tagList;
}
