import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

/* Click-to-enlarge for an event's photos and videos. Wrap the gallery in
   <LightboxGroup>; every tile holding an <img> or <video> with data-lb and a
   <button className="lb-hit"> becomes clickable. The viewer steps through
   that group only (one event at a time) and reads captions from alt /
   aria-label, so the markup stays the single source of truth. */

type Item = { type: 'img' | 'video'; src: string; poster?: string; caption: string };

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

export default function LightboxGroup({ children, label }: { children: ReactNode; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState<number | null>(null);

  const collect = useCallback((): { list: Item[]; els: Element[] } => {
    const els = Array.from(root.current?.querySelectorAll('[data-lb]') ?? []);
    const list = els.map(el => {
      if (el instanceof HTMLVideoElement) {
        return { type: 'video' as const, src: el.currentSrc || el.getAttribute('src') || '', poster: el.poster, caption: el.getAttribute('aria-label') || '' };
      }
      const img = el as HTMLImageElement;
      return { type: 'img' as const, src: img.currentSrc || img.src, caption: img.alt };
    });
    return { list, els };
  }, []);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const hit = (e.target as HTMLElement).closest('.lb-hit');
    if (!hit) return;
    const media = hit.parentElement?.querySelector('[data-lb]');
    if (!media) return;
    const { list, els } = collect();
    const i = els.indexOf(media);
    if (i < 0) return;
    opener.current = hit as HTMLElement;
    setItems(list);
    setIndex(i);
  };

  const step = (d: number) => setIndex(i => (i === null ? i : (i + d + items.length) % items.length));
  const item = index === null ? null : items[index];

  return (
    <div ref={root} onClick={onClick}>
      {children}
      <Dialog.Root open={index !== null} onOpenChange={o => { if (!o) setIndex(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="lb-overlay" />
          <Dialog.Content
            className="lb-panel"
            aria-describedby={undefined}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
              if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
            }}
            onCloseAutoFocus={e => { if (opener.current?.isConnected) { e.preventDefault(); opener.current.focus(); } }}
          >
            <Dialog.Title className="lb-sr">{label}</Dialog.Title>
            {item && (
              <>
                <figure className="lb-figure">
                  {item.type === 'img' ? (
                    <img key={item.src} className="lb-media" src={item.src} alt={item.caption} />
                  ) : (
                    <video key={item.src} className="lb-media" src={item.src} poster={item.poster} controls autoPlay playsInline />
                  )}
                  <figcaption className="lb-caption">
                    <span>{item.caption}</span>
                    <span className="lb-count">{(index ?? 0) + 1} / {items.length}</span>
                  </figcaption>
                </figure>
                {items.length > 1 && (
                  <>
                    <button type="button" className="lb-nav lb-nav--prev" onClick={() => step(-1)} aria-label="Previous">
                      <Chevron dir="left" />
                    </button>
                    <button type="button" className="lb-nav lb-nav--next" onClick={() => step(1)} aria-label="Next">
                      <Chevron dir="right" />
                    </button>
                  </>
                )}
              </>
            )}
            <Dialog.Close className="lb-close" aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
