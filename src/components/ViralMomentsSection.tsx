import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { viralShorts, type ViralShort } from '../data/viralShorts';
import Reveal from './Reveal';

/* Trending TikToks: poster cards that open a pop-up player on the site.

   What plays in the pop-up:
   1. A self-hosted copy, if public/viral/<id>.mp4 exists. This always works,
      so it's the goal for every short (export the video from TikTok or use
      the original file, and drop it in public/viral/ named by the post ID).
   2. Otherwise TikTok's own player. From some networks TikTok refuses to
      play these posts in an embed ("Server error"), so the pop-up always
      offers "Watch on TikTok" underneath as the way out.

   Optional cover art: public/viral/<id>.jpg is used as the card background. */

const TikTokGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);
const Play = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><polygon points="5,3 13,8 5,13" /></svg>
);
const External = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" />
  </svg>
);
const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

const videoUrl = (id: string) => `https://www.tiktok.com/@soulshadesmusic/video/${id}`;
const playerUrl = (id: string) =>
  `https://www.tiktok.com/player/v1/${id}?autoplay=1&music_info=0&description=0&rel=0&native_context_menu=0&controls=1&progress_bar=1`;
const localVideo = (id: string) => `/viral/${id}.mp4`;

/** Is there a self-hosted copy? A HEAD request must come back as a video —
    dev servers and SPA hosts answer missing files with index.html. */
const hasLocalCache = new Map<string, Promise<boolean>>();
function hasLocalVideo(id: string) {
  if (!hasLocalCache.has(id)) {
    hasLocalCache.set(
      id,
      fetch(localVideo(id), { method: 'HEAD' })
        .then(r => r.ok && (r.headers.get('content-type') || '').startsWith('video'))
        .catch(() => false),
    );
  }
  return hasLocalCache.get(id)!;
}

function ShortCard({ s, onPlay }: { s: ViralShort; onPlay: () => void }) {
  const [hasCover, setHasCover] = useState(true);

  return (
    <div className="short">
      <div className="short-frame">
        <button
          type="button"
          className="short-poster"
          onClick={e => { e.currentTarget.focus(); onPlay(); }}
          aria-haspopup="dialog"
          aria-label={`Play “${s.label}” — ${s.views} views on TikTok`}
        >
          {hasCover && (
            <img
              className="short-cover"
              src={`/viral/${s.id}.jpg`}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => setHasCover(false)}
            />
          )}
          <span className="short-top"><TikTokGlyph /> TikTok</span>
          <span className="short-views">
            <span className="short-views-num">{s.views}</span>
            <span className="short-views-label">Views</span>
          </span>
          <span className="short-play"><Play /></span>
        </button>
      </div>
      <div className="short-meta">
        <p className="short-title">{s.label}</p>
        <p className="short-stats">
          <span>{s.likes} Likes</span>
          <span>{s.comments} Comments</span>
        </p>
        <a className="short-link" href={videoUrl(s.id)} target="_blank" rel="noopener noreferrer">
          Watch on TikTok <External />
        </a>
      </div>
    </div>
  );
}

/** TikTok's embed player reports its state over postMessage. It is revealed
    only once a video is actually playing (onStateChange / onCurrentTime);
    "ready" alone isn't trusted, since the player can report ready and then
    fail. Any error (onError / onPlayerError, e.g. its "Server error") hands
    straight over to the branded poster with "Play on TikTok". */
type TikTokSignal = 'playing' | 'error' | null;
function readTikTok(e: MessageEvent): TikTokSignal {
  if (!/^https:\/\/(www\.)?tiktok\.com$/.test(e.origin)) return null;
  let d: unknown = e.data;
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return null; } }
  if (!d || typeof d !== 'object') return null;
  const m = d as { type?: string; ['x-tiktok-player']?: boolean };
  if (!m['x-tiktok-player']) return null;
  if (m.type === 'onError' || m.type === 'onPlayerError') return 'error';
  if (m.type === 'onStateChange' || m.type === 'onCurrentTime') return 'playing';
  return null;
}

function ShortPlayer({ s }: { s: ViralShort }) {
  const [source, setSource] = useState<'checking' | 'local' | 'tiktok'>('checking');
  const [tiktokReady, setTiktokReady] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let live = true;
    setSource('checking');
    setTiktokReady(false);
    setGaveUp(false);
    hasLocalVideo(s.id).then(ok => { if (live) setSource(ok ? 'local' : 'tiktok'); });
    return () => { live = false; };
  }, [s.id]);

  useEffect(() => {
    if (source !== 'tiktok') return;
    let t: ReturnType<typeof setTimeout> | undefined = setTimeout(() => setGaveUp(true), 8000);
    const stopTimer = () => { if (t) { clearTimeout(t); t = undefined; } };
    const onMsg = (e: MessageEvent) => {
      const sig = readTikTok(e);
      if (sig === 'error') { stopTimer(); setTiktokReady(false); setGaveUp(true); }
      if (sig === 'playing') { stopTimer(); setTiktokReady(true); }
    };
    window.addEventListener('message', onMsg);
    return () => { window.removeEventListener('message', onMsg); stopTimer(); };
  }, [source, s.id]);

  if (source === 'local') {
    return (
      <video
        key={s.id}
        className="sp-media"
        src={localVideo(s.id)}
        poster={`/viral/${s.id}.jpg`}
        controls
        autoPlay
        playsInline
      />
    );
  }

  return (
    <>
      {source === 'tiktok' && !gaveUp && (
        <iframe
          key={s.id}
          className={`sp-media sp-tiktok-frame${tiktokReady ? ' is-ready' : ''}`}
          src={playerUrl(s.id)}
          title={`${s.label} — TikTok video`}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          aria-hidden={!tiktokReady}
          tabIndex={tiktokReady ? 0 : -1}
        />
      )}
      {(!tiktokReady || gaveUp) && (
        <div className="sp-poster">
          <span className="short-top"><TikTokGlyph /> TikTok</span>
          <div className="sp-poster-mid">
            {gaveUp ? (
              <>
                <p className="sp-poster-note">This video plays on TikTok.</p>
                <a className="sp-poster-btn" href={videoUrl(s.id)} target="_blank" rel="noopener noreferrer">
                  <Play /> Play on TikTok
                </a>
              </>
            ) : (
              <span className="sp-spinner" role="status" aria-label="Loading video" />
            )}
          </div>
          <span className="short-views">
            <span className="short-views-num">{s.views}</span>
            <span className="short-views-label">Views</span>
          </span>
        </div>
      )}
    </>
  );
}

export default function ViralMomentsSection({ subtitle = 'Moments that moved the crowd — now moving the internet.' }: { subtitle?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  // The cards aren't Radix triggers, so hand focus back to the one that opened the player.
  const opener = useRef<HTMLElement | null>(null);
  const total = viralShorts.length;
  const current = open === null ? null : viralShorts[open];
  const step = (d: number) => setOpen(i => (i === null ? i : (i + d + total) % total));

  return (
    <section className="ss-section shorts" id="viral" aria-labelledby="shorts-title">
      <div className="ss-section-label">Viral Moments</div>
      <h2 className="ss-section-title" id="shorts-title">Soul Shades <span>Trending TikToks</span></h2>
      <p className="ss-section-sub">{subtitle}</p>

      <ul className="shorts-row">
        {viralShorts.map((s, n) => (
          <Reveal as="li" key={s.id} delay={0.08 * n}>
            <ShortCard s={s} onPlay={() => { opener.current = document.activeElement as HTMLElement | null; setOpen(n); }} />
          </Reveal>
        ))}
      </ul>

      <Dialog.Root open={open !== null} onOpenChange={o => { if (!o) setOpen(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="sp-overlay" />
          <Dialog.Content
            className="sp-panel"
            aria-describedby={undefined}
            onCloseAutoFocus={e => { if (opener.current?.isConnected) { e.preventDefault(); opener.current.focus(); } }}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
              if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
            }}
          >
            {current && (
              <>
                <div className="sp-head">
                  <div className="sp-titles">
                    <Dialog.Title className="sp-title">{current.label}</Dialog.Title>
                    <p className="sp-stats">{current.views} Views · {current.likes} Likes · {current.comments} Comments</p>
                  </div>
                  <Dialog.Close className="sp-close" aria-label="Close video">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                      <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
                    </svg>
                  </Dialog.Close>
                </div>

                <div className="sp-stage">
                  <button type="button" className="sp-nav sp-nav--prev" onClick={() => step(-1)} aria-label="Previous video">
                    <Chevron dir="left" />
                  </button>
                  <div className="sp-frame">
                    <ShortPlayer s={current} />
                  </div>
                  <button type="button" className="sp-nav sp-nav--next" onClick={() => step(1)} aria-label="Next video">
                    <Chevron dir="right" />
                  </button>
                </div>

                <div className="sp-foot">
                  <span className="sp-count">{(open ?? 0) + 1} / {total}</span>
                  <a className="sp-tiktok" href={videoUrl(current.id)} target="_blank" rel="noopener noreferrer">
                    <TikTokGlyph /> Watch on TikTok <External />
                  </a>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
