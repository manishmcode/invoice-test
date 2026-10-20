/**
 * @intent Confirm recipient and send the last saved invoice by email.
 * @in open, to, sending, error, handlers
 * @out modal dialog; send triggers the parent email action
 * @not SMTP, PDF rendering
 */
import { useEffect, useRef } from "react";
import {
  btnClass,
  btnPrimaryClass,
  fieldClass,
  fieldErrorClass,
  fieldLabelClass,
  inputClass,
} from "../../../styles/Ui";
import { demoMailInbox } from "../data/DemoMail";

type EmailDialogProps = {
  open: boolean;
  to: string;
  sending: boolean;
  error?: string;
  onToChange: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
};

export function EmailDialog({
  open,
  to,
  sending,
  error,
  onToChange,
  onClose,
  onSend,
}: EmailDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="no-print fixed inset-0 z-30 grid place-items-center bg-backdrop p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="grid w-[min(28rem,100%)] gap-4 rounded-hl border border-rule bg-paper p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="email-dialog-title" className="m-0 font-display text-[1.4rem] font-semibold not-italic">
          Send invoice
        </h2>
        <p className="m-0 text-[0.92rem] text-muted">
          Sends the last saved snapshot to the demo Yopmail inbox. Other addresses are rejected.
          The invoice PDF is attached.
        </p>
        <div className={fieldClass}>
          <label className={fieldLabelClass} htmlFor="email-to">
            To
          </label>
          <input
            ref={inputRef}
            id="email-to"
            className={inputClass}
            type="email"
            value={to}
            placeholder={demoMailInbox}
            autoComplete="email"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "email-to-error email-to-hint" : "email-to-hint"}
            onChange={(event) => onToChange(event.target.value)}
          />
          <p id="email-to-hint" className="m-0 text-label text-muted">
            Use {demoMailInbox}
          </p>
          {error ? (
            <p className={fieldErrorClass} id="email-to-error">
              {error}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-[0.6rem]">
          <button type="button" className={btnClass} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={btnPrimaryClass} onClick={onSend} disabled={sending}>
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
