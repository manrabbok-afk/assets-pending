/**
 * Auto-resolves PNG/JPG/WebP assets per theme using Vite glob imports.
 * Convention: src/assets/slots/{themeId}/{symbolId}.(png|jpg|webp)
 * If a matching file exists, the corresponding ThemeSymbol gets its
 * imageUrl auto-populated so the procedural paint() is overridden.
 */
const ASSETS = import.meta.glob(
  '/src/assets/slots/**/*.{png,jpg,jpeg,webp}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>;

// Build a quick lookup: themeId/symbolId -> url
const LOOKUP: Record<string, string> = {};
for (const [path, url] of Object.entries(ASSETS)) {
  // path looks like /src/assets/slots/buffalo-king/buffalo.png
  const m = path.match(/\/slots\/([^/]+)\/([^/]+)\.(png|jpg|jpeg|webp)$/i);
  if (!m) continue;
  const [, theme, name] = m;
  LOOKUP[`${theme}/${name}`] = url;
}

/** Returns the asset URL for a given theme + symbol id, or undefined. */
export function getThemeSymbolAsset(themeId: string, symbolId: string): string | undefined {
  return LOOKUP[`${themeId}/${symbolId}`];
}
