import Reveal from './Reveal';
import { useBookingDialog } from './BookingDialog';
import { DjDxMark, JulieSchatzMark, SoulShadesMark } from './Wordmarks';

/* The bio is written to be quoted: the first paragraph answers "who is
   Soul Shades?" on its own (who, what, where, since when, what it sounds
   like), and the fact card repeats the key facts in a scannable form for
   search engines and answer engines. Keep it in step with the MusicGroup
   JSON-LD in index.html. */

export default function About() {
  const openBooking = useBookingDialog();

  return (
    <section className="ss-section about" id="about" aria-labelledby="about-title">
      <div className="ss-section-label">The Story</div>
      <h2 className="ss-section-title about-title" id="about-title">About <SoulShadesMark /></h2>

      {/* The story runs full width: the lead across the top, then two columns
          of running text with the pull quote opening the second. The fact
          sheet sits underneath as one wide band rather than a sidebar. */}
      <Reveal className="about-bio">
        <p className="about-lead">
          <SoulShadesMark /> is a New York–based music duo of <span className="nobr">DJ DX</span> and vocalist and
          multi-instrumentalist <span className="nobr">Julie Schatz</span>. Formed in 2024, they blend Deep House,
          Afro House, Jazz, R&amp;B and <span className="nobr">Hip-Hop</span>, playing DJ sets with live violin, vocals and keys on top.
        </p>
        <div className="about-cols">
          <div>
            <p className="about-dropcap">
              Julie sings, writes and plays; DJ DX cuts, produces and raps. Mid-set, Julie lifts a violin
              over DJ DX’s mix and the record stops being a record — which is why a Soul Shades booking reads
              differently on a run sheet than a DJ booking does.
            </p>
            <p>
              Both came up digging in New York — DJ DX in the vinyl racks, Julie through the CD stacks — and
              it shows in the catalogue. Originals like <cite>“Beyond Your Mind,”</cite> <cite>“Wait For Me”</cite> and{' '}
              <cite>“Buzz in London”</cite> sit beside blends like <cite>“I Only Smoke When I Drink x Englishman in
              New York”</cite>: pairings that look wrong on paper until the first eight bars land.
            </p>
          </div>
          <div>
            <p className="about-pull">Blending genres, creating moods.</p>
            <p>
              Fourteen releases in, with more than 10 million views across TikTok and Instagram and a remix
              featured by Ninja Tune, Soul Shades plays clubs, corporate receptions and private events in New
              York and worldwide — from a rooftop at Rockefeller Center to Contentsquare’s CX Circle at The
              Glasshouse.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Fact sheet. The members aren't repeated here: their photo cards
          follow directly below with names, roles and their own sites. */}
      <Reveal className="about-facts" delay={0.1}>
        <div className="facts-head">
          <div>
            <h3 className="facts-title">NYC DJ &amp; Live Violin Duo</h3>
            <p className="facts-kicker">For weddings, corporate events, private parties and club nights.</p>
          </div>
          <button type="button" className="ss-hero-btn about-cta" onClick={(e) => { e.currentTarget.focus(); openBooking(); }} aria-haspopup="dialog">
            Send a Booking Inquiry
          </button>
        </div>

        <ul className="facts-stats" aria-label="Highlights">
          <li><strong>10M+</strong><span>Views on TikTok &amp; Instagram</span></li>
          <li><strong>14</strong><span>Releases</span></li>
          <li><strong>Ninja Tune</strong><span>Featured remix</span></li>
        </ul>

        <dl className="facts-list">
          <div><dt>Formed</dt><dd>2024 · New York City</dd></div>
          <div><dt>Sound</dt><dd>Deep House · Afro House · Jazz · R&amp;B · Hip-Hop · Reggaeton</dd></div>
          <div><dt>Live Show</dt><dd>DJ set with live violin, vocals &amp; keys</dd></div>
        </dl>
      </Reveal>

      {/* Each card opens that member's own site in a new tab, so the booking
          page stays open behind it. Their sites rank for their names; this
          one links to them instead of competing with them. */}
      <div className="about-members">
        <Reveal as="article" className="member">
          <a className="member-link" href="https://julieschatzmusic.com/" target="_blank" rel="noopener" aria-label="Julie Schatz — visit julieschatzmusic.com (opens in a new tab)">
            <img
              src="/nautadutilh-julie-violin-cathedral-nyc.jpg"
              alt="Julie Schatz playing violin beside the DJ booth at a rooftop reception in New York"
              width={1920}
              height={720}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: '68% 40%' }}
            />
            <div className="member-cap">
              <h3><JulieSchatzMark /></h3>
              <p>Vocals · Violin · Keys · Production</p>
              <span className="member-site">julieschatzmusic.com <span aria-hidden="true">↗</span></span>
            </div>
          </a>
        </Reveal>
        <Reveal as="article" className="member" delay={0.1}>
          <a className="member-link" href="https://djdxmusic.com/" target="_blank" rel="noopener" aria-label="DJ DX — visit djdxmusic.com (opens in a new tab)">
            <img
              src="/glasshouse-dj-dx-contentsquare-nyc.jpg"
              alt="DJ DX at the decks at Contentsquare’s CX Circle NYC 2026, The Glasshouse, with the Hudson River at sunset behind him"
              width={1200}
              height={1600}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: '40% 34%' }}
            />
            <div className="member-cap">
              <h3><DjDxMark /></h3>
              <p>DJ · Turntablism · Production · Rap</p>
              <span className="member-site">djdxmusic.com <span aria-hidden="true">↗</span></span>
            </div>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
