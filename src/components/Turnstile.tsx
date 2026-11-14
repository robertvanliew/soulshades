import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/* Cloudflare Turnstile: invisible bot detection (no picture puzzles). Real
   visitors almost never see anything; a suspicious one gets a single
   checkbox. Off until VITE_TURNSTILE_SITE_KEY is set, so the form keeps
   working before the key exists. The server checks the token with
   TURNSTILE_SECRET_KEY (api/booking.ts). */

export const TURNSTILE_SITE_KEY: string | undefined = import.meta.env.VITE_TURNSTILE_SITE_KEY || undefined;

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }

const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT; s.async = true; s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => { loading = null; reject(new Error('turnstile-load')); };
    document.head.appendChild(s);
  });
  return loading;
}

export type TurnstileHandle = { reset: () => void };

type Props = {
  onToken: (token: string | null) => void;
  /** Called when the check can't run (blocked script, network). The form then falls back gracefully. */
  onUnavailable: () => void;
};

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ onToken, onUnavailable }, ref) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const cb = useRef({ onToken, onUnavailable });
  cb.current = { onToken, onUnavailable };

  useImperativeHandle(ref, () => ({
    reset: () => { if (widget.current && window.turnstile) { cb.current.onToken(null); window.turnstile.reset(widget.current); } },
  }), []);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !box.current || !window.turnstile) return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        appearance: 'interaction-only',
        action: 'booking',
        callback: (t: string) => cb.current.onToken(t),
        'expired-callback': () => cb.current.onToken(null),
        'error-callback': () => { cb.current.onToken(null); cb.current.onUnavailable(); return true; },
      });
    }).catch(() => { if (!cancelled) cb.current.onUnavailable(); });
    return () => {
      cancelled = true;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={box} className="form-turnstile" />;
});

export default Turnstile;
