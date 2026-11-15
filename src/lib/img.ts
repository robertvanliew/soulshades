import manifest from '../data/images.json';

/* Responsive images. Every photo in public/ has WebP copies at about 640 px
   and 1280 px wide, each under 100 KB (made by brand/make-webp.py; widths are
   in src/data/images.json). Pages ask for the original path and get the
   WebP versions, so the large originals only serve old links and share
   previews.

     <img {...responsive('/ss-hero.jpg', '(min-width: 901px) 62vw, 100vw')} alt="…" />  */

type Entry = [path: string, width: number];
const M = manifest as unknown as Record<string, Entry[]>;

/** The largest WebP copy of an image, or the original if there is none. */
export function webp(src: string): string {
  const e = M[src];
  return e ? e[e.length - 1][0] : src;
}

/** src, srcSet and sizes for an <img>. */
export function responsive(src: string, sizes: string) {
  const e = M[src];
  if (!e) return { src };
  return { src: e[e.length - 1][0], srcSet: e.map(([p, w]) => `${p} ${w}w`).join(', '), sizes };
}
