import { fieldsetClass } from "../../../styles/Ui";
import { Field } from "./Field";
import { FieldsetHeading } from "./FieldsetHeading";

type NotesFieldProps = {
  value: string;
  error?: string;
  onChange: (notes: string) => void;
};

export function NotesField({ value, error, onChange }: NotesFieldProps) {
  return (
    <fieldset className={fieldsetClass}>
      <FieldsetHeading title="Notes" purpose="A message printed at the bottom for the customer." />
      <Field id="notes" label="Customer note" error={error}>
        <textarea value={value} rows={4} onChange={(event) => onChange(event.target.value)} />
      </Field>
    </fieldset>
  );
}
