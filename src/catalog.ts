export type TrackTag = 'Blend' | 'Remix' | 'Original' | 'Pack' | 'Album' | 'Live';

export interface Track {
  id: number;
  title: string;
  artists: string;
  tag: TrackTag;
  preview: string;
  visible: boolean;
  order: number;
  album?: string;
  year?: string;
  r2FileName?: string;
}

// Source of truth for the Soul Shades catalog.
export const soulShadesCatalog: Track[] = [
  { id: 101, title: "Wait For Me",                                    artists: "Soul Shades",  tag: "Original", preview: "/previews/ss-wait-for-me.mp3",                         visible: true, order: 101, year: "2025", r2FileName: "Soul Shades DJ Mixes/Soul Shades, DJ DX, Julie Schatz - Wait For Me.mp3" },
  { id: 102, title: "Beyond Your Mind",                               artists: "Soul Shades",  tag: "Original", preview: "/previews/ss-beyond-your-mind.mp3",                    visible: true, order: 102, year: "2025", r2FileName: "Soul Shades DJ Mixes/Soul Shades, Julie Schatz, DJ DX - Beyond Your Mind.mp3" },
  { id: 103, title: "Buzz In London",                                 artists: "Soul Shades",  tag: "Original", preview: "/previews/ss-buzz-in-london.mp3",                      visible: true, order: 103, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Buzz In London ft. (DJ DX & Julie Schatz).wav" },
  { id: 104, title: "Always On Time x Fired Up",                      artists: "Soul Shades",  tag: "Blend",    preview: "/previews/ss-always-on-time-x-fired-up.mp3",           visible: true, order: 104, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Always on time x Fired Up by (DJ DX & Julie Schatz).mp3" },
  { id: 105, title: "Be Honest x Everything",                         artists: "Soul Shades",  tag: "Blend",    preview: "/previews/ss-be-honest-x-everything.mp3",              visible: true, order: 105, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Be honest x Everything by (DJ DX & Julie Schatz).wav" },
  { id: 106, title: "Cola x Vivrant Thing",                           artists: "Soul Shades",  tag: "Blend",    preview: "/previews/ss-cola-x-vivrant-thing.mp3",                visible: true, order: 106, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Cola x  Vivrant Thing by(DJ DX & Julie Schatz).wav" },
  { id: 107, title: "Hannah x Everybody Everybody",                   artists: "Soul Shades",  tag: "Blend",    preview: "/previews/ss-hannah-x-everybody-everybody.mp3",        visible: true, order: 107, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Hannah x Everybody Everybody by ( DJ DX & Julie Schatz).mp3" },
  { id: 108, title: "Kiss Of Life",                                   artists: "Soul Shades",  tag: "Original", preview: "/previews/ss-kiss-of-life.mp3",                        visible: true, order: 108, year: "2025", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Kiss Of Life by (DJ DX & Julie Schatz).wav" },
  { id: 109, title: "Money Talks (Dirty Cash) x RIZZ",                artists: "Soul Shades",  tag: "Blend",    preview: "/previews/ss-money-talks-x-rizz.mp3",                  visible: true, order: 109, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Money Talks (Dirty Cash) x RIZZ by (DJ DX & Julie Schatz).wav" },
  { id: 110, title: "Rock The Boat x You Are The One",                artists: "Soul Shades",  tag: "Blend",    preview: "/previews/ss-rock-the-boat-x-you-are-the-one.mp3",     visible: true, order: 110, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Rock the boat x You are the one by (DJ DX & Julie Schatz).mp3" },
  { id: 111, title: "Streets x Rapture III x Violin",                 artists: "Soul Shades",  tag: "Blend",    preview: "/previews/ss-streets-x-rapture-iii-x-violin.mp3",      visible: true, order: 111, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Streets x Rapture III x Violin by (DJ DX & Julie Schatz).wav" },
  { id: 112, title: "The Way You x Everybody x Never x Beso",         artists: "Soul Shades",  tag: "Blend",    preview: "/previews/ss-the-way-you-x-everybody-x-never-x-beso.mp3", visible: true, order: 112, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - The Way You  x Everybody  x Never x Beso by (DJ DX & Julie Schatz).wav" },
  { id: 113, title: "Unthinkable x Life Gets Hard",                   artists: "Soul Shades",  tag: "Blend",    preview: "/previews/ss-unthinkable-x-life-gets-hard.mp3",        visible: true, order: 113, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - Unthinkable x Life Gets Hard by (DJ DX & Julie Schatz).wav" },
  { id: 114, title: "Addicted x Give Me The Night",                   artists: "Soul Shades",  tag: "Remix",    preview: "/previews/ss-addicted-x-give-me-the-night.mp3",        visible: true, order: 114, year: "2024", r2FileName: "Soul Shades DJ Mixes/Soul Shades - 'Addicted' Chainsmokers x 'Give me the night' (Remix).wav" },
];

// Default export used across the app.
export const defaultCatalog: Track[] = soulShadesCatalog;

// Server-backed catalog fetch — merges any server-saved overrides (via
// api/catalog.ts) with the local defaultCatalog, matching the pattern used
// by CartContext/MusicStore. Falls back to the local catalog if the API
// is unavailable (e.g. during local dev without env vars configured).
export async function fetchCatalog(): Promise<Track[]> {
  try {
    const res = await fetch('/api/catalog');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    if (data.tracks && Array.isArray(data.tracks)) {
      const savedIds = new Set((data.tracks as Track[]).map((t: Track) => t.id));
      const merged = [
        ...data.tracks,
        ...defaultCatalog.filter(t => !savedIds.has(t.id)),
      ];
      return merged.sort((a: Track, b: Track) => a.order - b.order);
    }
  } catch { /* fall through */ }
  return [...defaultCatalog].sort((a, b) => a.order - b.order);
}
