import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { Track } from '../catalog';
import { useCart, CartPanel, CartFab } from './CartContext';
import { usePlayer } from './PlayerContext';
import ShareModal from './ShareModal';

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);
const PlayGlyph = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><polygon points="4,2 13,8 4,14" /></svg>
);
const PauseGlyph = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
);

interface MusicStoreProps {
  catalog: Track[];
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  shareType?: 'store' | 'soul-shades';
}

export default function MusicStore({ catalog, title = "Music Store", subTitle = "Music", shareType = 'soul-shades' }: MusicStoreProps) {
  const [shareTrack, setShareTrack] = useState<Track | null>(null);
  const { cart, addToCart } = useCart();
  const { play, playingTrack, isPlaying } = usePlayer();
  const playingId = playingTrack?.id ?? null;

  return (
    <>
      <section className="catalog" id="catalog">
        <div className="section-inner">
          <div className="sec-header">
            <div className="sec-overline">
              <span className="sec-label">{subTitle}</span>
            </div>
            <h2 className="sec-title">{title}</h2>
          </div>

          {/* A numbered list on hairlines. The number doubles as the play
              control, so each row has exactly one obvious thing to press. */}
          <ol className="tl">
            {catalog.map((track, idx) => {
              const isCurrent = playingId === track.id;
              const inCart = cart.some(t => t.id === track.id);
              return (
                <li
                  key={track.id}
                  id={`track-${track.id}`}
                  className={`tl-row${isCurrent ? ' tl-row--current' : ''}`}
                >
                  <button
                    type="button"
                    className="tl-play"
                    disabled={!track.preview}
                    onClick={() => play(track)}
                    aria-label={`${isCurrent && isPlaying ? 'Pause' : 'Play'} preview of ${track.title}`}
                  >
                    <span className="tl-num" aria-hidden="true">
                      <span className="tl-num-digits">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="tl-num-icon">{isCurrent && isPlaying ? <PauseGlyph /> : <PlayGlyph />}</span>
                    </span>
                    <span className="tl-text">
                      <span className="tl-title">{track.title}</span>
                      <span className="tl-meta">
                        <span className="tl-artist">{track.artists}</span>
                        {track.album && <span>{track.album}</span>}
                        {track.year && <span>{track.year}</span>}
                        <span className="tl-meta-type">{track.tag}</span>
                      </span>
                    </span>
                  </button>

                  <span className="tl-type">{track.tag}</span>

                  <div className="tl-actions">
                    <button
                      type="button"
                      className="tl-share"
                      onClick={() => setShareTrack(track)}
                      aria-label={`Share ${track.title}`}
                    >
                      <ShareIcon />
                    </button>
                    <button
                      type="button"
                      className={`tl-buy${inCart ? ' tl-buy--added' : ''}`}
                      onClick={(e) => addToCart(e, track)}
                      aria-label={inCart ? `${track.title} is in your cart` : `Buy ${track.title}, from $3`}
                    >
                      {inCart ? (
                        <>
                          <Check size={12} strokeWidth={3} aria-hidden="true" />
                          <span>Added</span>
                        </>
                      ) : (
                        <span>Buy <span className="tl-buy-price">· From $3</span></span>
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <CartFab />
      <CartPanel />
      {shareTrack && (
        <ShareModal
          track={shareTrack}
          shareType={shareType}
          onClose={() => setShareTrack(null)}
        />
      )}
    </>
  );
}
