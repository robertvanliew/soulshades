import {
  AppleMusicIcon,
  BandcampIcon,
  InstagramIcon,
  SoundcloudIcon,
  SpotifyIcon,
  ThreadsIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from './icons';
import Reveal from './Reveal';

const PLATFORMS = [
  { name: 'Spotify',     kind: 'Stream', href: 'https://open.spotify.com/artist/2GES5fSFNcx25lv9RFcQjP?autoplay=true', Icon: SpotifyIcon },
  { name: 'Apple Music', kind: 'Stream', href: 'https://music.apple.com/us/artist/soul-shades/1783698611',             Icon: AppleMusicIcon },
  { name: 'YouTube',     kind: 'Watch',  href: 'https://www.youtube.com/@soulshadesmusic',                             Icon: YouTubeIcon },
  { name: 'SoundCloud',  kind: 'Stream', href: 'https://soundcloud.com/soulshadesmusic',                               Icon: SoundcloudIcon },
  { name: 'Bandcamp',    kind: 'Buy',    href: 'https://soulshadesmusic.bandcamp.com/',                                Icon: BandcampIcon },
  { name: 'TikTok',      kind: 'Follow', href: 'https://www.tiktok.com/@soulshadesmusic',                              Icon: TikTokIcon },
  { name: 'Instagram',   kind: 'Follow', href: 'https://www.instagram.com/soulshadesmusic/',                           Icon: InstagramIcon },
  { name: 'Threads',     kind: 'Follow', href: 'https://www.threads.net/@soulshadesmusic',                             Icon: ThreadsIcon },
  { name: 'X',           kind: 'Follow', href: 'https://x.com/soulshadesmusic',                                        Icon: XIcon },
];

const ArrowUpRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" />
  </svg>
);

export default function StreamStrip() {
  return (
    <section className="ss-section" id="follow" aria-labelledby="follow-title">
      <div className="ss-section-label">Follow &amp; Stream</div>
      <h2 className="ss-section-title" id="follow-title">Find Soul Shades <span>everywhere</span></h2>
      <ul className="follow-grid">
        {PLATFORMS.map(({ name, kind, href, Icon }, n) => (
          <Reveal as="li" key={name} delay={0.04 * n} duration={0.5}>
            <a href={href} target="_blank" rel="noopener noreferrer" className="follow-link">
              <span className="follow-icon"><Icon /></span>
              <span className="follow-text">
                <span className="follow-name">{name}</span>
                <span className="follow-kind">{kind}</span>
              </span>
              <span className="follow-arrow"><ArrowUpRight /></span>
            </a>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
