import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { loadMarkdownEpisodes } from "./markdown-episodes.js";
import type { Episode, EpisodeStoreFile } from "./types.js";

export interface CatalogOptions {
  dataFilePath: string;
  markdownEpisodesDir: string;
}

export interface EpisodeRedirectTarget {
  number: number;
  slug: string;
}

export function buildEpisodeRedirectLookup(
  episodes: EpisodeRedirectTarget[]
): Map<number, string> {
  return new Map(
    episodes.map((episode) => [episode.number, `/episodes/${episode.slug}`])
  );
}

export function resolveLegacyEpisodeRedirect(
  pathname: string,
  search: string,
  lookup: Map<number, string>
): string | null {
  const match = pathname.match(/^\/episode-(\d+)\/?$/i);
  if (!match) {
    return null;
  }

  const destination = lookup.get(Number(match[1]));
  return destination ? `${destination}${search}` : null;
}

async function ensureParentDirectory(pathname: string): Promise<void> {
  await mkdir(dirname(pathname), { recursive: true });
}

export async function loadEpisodeCatalog(options: CatalogOptions): Promise<Episode[]> {
  return loadMarkdownEpisodes(options.markdownEpisodesDir);
}

export async function syncEpisodeCatalog(options: CatalogOptions): Promise<Episode[]> {
  const episodes = await loadEpisodeCatalog(options);
  const payload: EpisodeStoreFile = {
    importedAt: new Date().toISOString(),
    episodes
  };

  await ensureParentDirectory(options.dataFilePath);
  await writeFile(options.dataFilePath, JSON.stringify(payload, null, 2));

  return episodes;
}
