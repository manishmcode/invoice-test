import { PortalAction, PortalActionList } from "../portal/PortalAction";

type ActionBarProps = {
  className?: string;
  saving: boolean;
  emailDisabled: boolean;
  onPrint: () => void;
  onSave: () => void;
  onEmail: () => void;
};

export function ActionBar({ className, saving, emailDisabled, onPrint, onSave, onEmail }: ActionBarProps) {
  return (
    <PortalActionList className={className} labeled>
      <PortalAction icon="print" label="Print / PDF" onClick={onPrint} />
      <PortalAction icon="save" label={saving ? "Saving…" : "Save"} variant="primary" disabled={saving} onClick={onSave} />
      <PortalAction icon="email" label="Send email" disabled={emailDisabled} onClick={onEmail} />
    </PortalActionList>
  );
}
