import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { loadMarkdownEpisodes } from "./markdown-episodes.js";
export function buildEpisodeRedirectLookup(episodes) {
    return new Map(episodes.map((episode) => [episode.number, `/episodes/${episode.slug}`]));
}
export function resolveLegacyEpisodeRedirect(pathname, search, lookup) {
    const match = pathname.match(/^\/episode-(\d+)\/?$/i);
    if (!match) {
        return null;
    }
    const destination = lookup.get(Number(match[1]));
    return destination ? `${destination}${search}` : null;
}
async function ensureParentDirectory(pathname) {
    await mkdir(dirname(pathname), { recursive: true });
}
export async function loadEpisodeCatalog(options) {
    return loadMarkdownEpisodes(options.markdownEpisodesDir);
}
export async function syncEpisodeCatalog(options) {
    const episodes = await loadEpisodeCatalog(options);
    const payload = {
        importedAt: new Date().toISOString(),
        episodes
    };
    await ensureParentDirectory(options.dataFilePath);
    await writeFile(options.dataFilePath, JSON.stringify(payload, null, 2));
    return episodes;
}
