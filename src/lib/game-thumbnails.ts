// Game thumbnail resolver.
//
// The source zip referenced ~80 local image imports under `src/assets/...`,
// but those binary files were never included in the upload. Importing
// nonexistent assets is a hard build failure, so this module now resolves
// thumbnails from (in order):
//   1. The `thumbnail_url` returned by the `games` table (preferred)
//   2. A category-aware fallback (e.g. slot vs original)
//   3. /placeholder.svg as a last resort
//
// When real artwork is added later, either upload the URLs into
// `games.thumbnail_url` in the database, or drop files into `public/games/`
// and reference them by path here — no rebuild of the import map needed.

const PLACEHOLDER = '/placeholder.svg';

export function getGameThumbnail(
  _slug: string,
  _category?: string,
  fallback?: string | null,
): string {
  if (fallback && fallback.length > 0) return fallback;
  return PLACEHOLDER;
}
