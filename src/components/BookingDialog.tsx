import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import BookingForm from './BookingForm';

export const BOOKING_EMAIL = 'bookings@soulshadesmusic.com';

const Ctx = createContext<(service?: string) => void>(() => {});

/** Opens the booking form in a pop-up from anywhere on the page. */
export const useBookingDialog = () => useContext(Ctx);

export function BookingDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [service, setService] = useState('');
  // The openers aren't Radix triggers, so remember which one was used and
  // hand focus back to it on close — keyboard users keep their place.
  const opener = useRef<HTMLElement | null>(null);
  const show = useCallback((serviceId?: string) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setService(typeof serviceId === 'string' ? serviceId : '');
    setOpen(true);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bd-overlay" />
          <Dialog.Content
            className="bd-panel"
            aria-describedby="bd-desc"
            onCloseAutoFocus={(e) => {
              if (opener.current?.isConnected) {
                e.preventDefault();
                opener.current.focus();
              }
            }}
          >
            <div className="bd-head">
              <div>
                <Dialog.Title className="bd-title">Book Soul Shades</Dialog.Title>
                <Dialog.Description id="bd-desc" className="bd-desc">
                  Tell us about your event. We reply within 24–48 hours.
                </Dialog.Description>
              </div>
              <Dialog.Close className="bd-close" aria-label="Close booking form">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </Dialog.Close>
            </div>
            <BookingForm autoFocus key={service || 'any'} initialService={service} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Ctx.Provider>
  );
}

/** Shows the email address, but opens the booking form instead of a mail app. */
export function EmailButton({ className, children }: { className?: string; children?: ReactNode }) {
  const open = useBookingDialog();
  return (
    <button
      type="button"
      className={`email-btn${className ? ` ${className}` : ''}`}
      onClick={(e) => { e.currentTarget.focus(); open(); }}
      aria-haspopup="dialog"
      aria-label={`Contact Soul Shades at ${BOOKING_EMAIL} — opens the booking form`}
    >
      {children ?? BOOKING_EMAIL}
    </button>
  );
}
