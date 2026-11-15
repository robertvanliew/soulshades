import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { AppleMusicIcon, SpotifyIcon } from './icons';
import Reveal from './Reveal';
import { responsive, webp } from '../lib/img';

const COVER = '/releases/get-up.jpg';
const AMBIENT = '/releases/get-up-ambient.jpg';
const MOTION_WEBM = '/releases/get-up-motion.webm';
const MOTION_MP4 = '/releases/get-up-motion.mp4';
// Midnight Eastern on release day.
const RELEASE = new Date('2026-12-18T00:00:00-05:00');
const SPOTIFY = 'https://open.spotify.com/artist/2GES5fSFNcx25lv9RFcQjP';
const APPLE = 'https://music.apple.com/us/artist/soul-shades/1783698611';

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    // Minutes are the smallest unit shown, so a twice-a-minute tick is enough.
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, target.getTime() - now);
  return {
    out: ms === 0,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
  };
}

const saveData = () =>
  typeof navigator !== 'undefined' &&
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/* Motion art: the still cover is always underneath (it is the image, the
   alt text, and what reduced-motion / data-saver visitors see). The video
   loads only when the card is near the screen, plays only while it is on
   screen, and fades in over the still once it is actually playing. */
function CoverArt() {
  const reduce = useReducedMotion();
  const [useVideo] = useState(() => !saveData());
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const showVideo = useVideo && !reduce;

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !showVideo) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (v.preload === 'none') v.preload = 'auto';
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    }, { rootMargin: '200px 0px' });
    io.observe(v);
    return () => io.disconnect();
  }, [showVideo]);

  return (
    <div className="nr-art">
      <img
        className="nr-cover"
        {...responsive(COVER, '(min-width: 901px) 440px, 90vw')}
        alt="Get Up by Soul Shades — cover art: a blue New York skyline under a burst of orange light"
        width={1500}
        height={1500}
        decoding="async"
      />
      {showVideo && (
        <video
          ref={videoRef}
          className={`nr-cover nr-video${playing ? ' is-playing' : ''}`}
          muted
          loop
          playsInline
          preload="none"
          poster={webp(COVER)}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
        >
          <source src={MOTION_WEBM} type="video/webm" />
          <source src={MOTION_MP4} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

export default function NewRelease() {
  const { out, days, hours, minutes } = useCountdown(RELEASE);

  return (
    <section className="nr" id="new-release" aria-labelledby="nr-title">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MusicRecording',
          name: 'Get Up',
          byArtist: { '@id': 'https://soulshadesmusic.com/#soulshades' },
          datePublished: '2026-12-18',
          image: 'https://soulshadesmusic.com/releases/get-up.jpg',
          url: 'https://soulshadesmusic.com/#new-release',
        })}</script>
      </Helmet>
      <img className="nr-ambient" src={webp(AMBIENT)} alt="" aria-hidden="true" />

      <Reveal className="nr-cover-wrap" duration={0.9}>
        <CoverArt />
      </Reveal>

      <Reveal className="nr-body" delay={0.12} duration={0.9}>
        <p className="nr-kicker">
          <span className="nr-dot" aria-hidden="true" />
          {out ? 'Out now' : 'New release · Friday, December 18'}
        </p>
        <h2 className="nr-title" id="nr-title">Get Up</h2>
        <p className="nr-sub">
          {out
            ? 'The new Soul Shades release is out now on every platform.'
            : 'The new Soul Shades release. Follow on Spotify or Apple Music to hear it the moment it drops.'}
        </p>

        {!out && (
          <dl className="nr-count" aria-label="Time until release">
            <div><dt>Days</dt><dd>{days}</dd></div>
            <div><dt>Hours</dt><dd>{String(hours).padStart(2, '0')}</dd></div>
            <div><dt>Minutes</dt><dd>{String(minutes).padStart(2, '0')}</dd></div>
          </dl>
        )}

        <div className="nr-actions">
          <a className="ss-hero-btn" href={SPOTIFY} target="_blank" rel="noopener noreferrer">
            <SpotifyIcon /> {out ? 'Listen on Spotify' : 'Follow on Spotify'}
          </a>
          <a className="ss-hero-btn ss-hero-btn--ghost" href={APPLE} target="_blank" rel="noopener noreferrer">
            <AppleMusicIcon /> Apple Music
          </a>
        </div>
      </Reveal>
    </section>
  );
}
