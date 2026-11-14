/* Each act's name in its own brand lettering, as real text (search engines
   and screen readers read the name; CSS does the branding):

   - Soul Shades  → the site header wordmark: Bebas Neue, SHADES in tan
   - DJ DX        → Archivo Black, as on djdxmusic.com
   - Julie Schatz → Playfair Display Black (900), caps, as on julieschatzmusic.com */

export const SoulShadesMark = () => (
  <span className="wm wm-ss">
    <span className="wm-ss-soul">Soul</span> <span className="wm-ss-shades">Shades</span>
  </span>
);

export const DjDxMark = () => <span className="wm wm-dx">DJ DX</span>;

export const JulieSchatzMark = () => <span className="wm wm-js">Julie Schatz</span>;
