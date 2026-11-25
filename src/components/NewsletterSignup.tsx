import { useId, useRef, useState } from 'react';

/* Mailing-list sign-up (posts to api/subscribe.ts). Email is the only
   required field; first name is optional so emails can say hello by name.
   The hidden "website" field is a honeypot for bots, and the time since the
   form appeared is sent so instant bot posts can be dropped quietly. */

type Status = 'idle' | 'sending' | 'done' | 'error';

export default function NewsletterSignup({ id = 'newsletter' }: { id?: string }) {
  const uid = useId();
  const shownAt = useRef(Date.now());
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;
    const form = new FormData(e.currentTarget);
    setStatus('sending');
    setMessage('');
    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          firstName: form.get('firstName'),
          honeypot: form.get('website'),
          elapsedMs: Date.now() - shownAt.current,
        }),
      });
      const data = await r.json().catch(() => ({})) as { message?: string };
      if (!r.ok) throw new Error(data.message || 'Something went wrong. Please try again in a moment.');
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error && err.message !== 'Failed to fetch' ? err.message : 'Something went wrong. Please try again in a moment.');
    }
  }

  return (
    <section id={id} className="ss-section nl" aria-labelledby={`${uid}-h`}>
      <div className="nl-text">
        <p className="ss-section-label">Mailing List</p>
        <h2 id={`${uid}-h`} className="nl-title">Hear new music first</h2>
        <p className="nl-sub">New releases, mixes and show dates, straight from DJ DX and Julie.</p>
      </div>

      {status === 'done' ? (
        <p className="nl-done" role="status">You’re on the list. Thank you for listening.</p>
      ) : (
        <form className="nl-form" onSubmit={submit}>
          <div className="nl-fields">
            <label className="nl-field">
              <span>First name <em>(optional)</em></span>
              <input name="firstName" type="text" autoComplete="given-name" maxLength={60} />
            </label>
            <label className="nl-field">
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required maxLength={254} />
            </label>
            <label className="nl-hp" aria-hidden="true">
              Website <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
            <button type="submit" className="ss-hero-btn nl-btn" disabled={status === 'sending'}>
              {status === 'sending' ? 'Joining…' : 'Join the list'}
            </button>
          </div>
          <p className="nl-fine">
            Unsubscribe any time with one click. We never share your email. <a href="/privacy#use">Privacy</a>
          </p>
          {status === 'error' && <p className="nl-error" role="alert">{message}</p>}
        </form>
      )}
    </section>
  );
}
