import type { CreateInvoiceBody } from "@hearth/invoice-types/modules/Invoice";
import { fieldGridClass, fieldGridTwoClass, fieldsetClass } from "../../../styles/Ui";
import { Field } from "./Field";
import { FieldsetHeading } from "./FieldsetHeading";

type MetaFieldsProps = {
  invoice: CreateInvoiceBody;
  errors: Record<string, string>;
  onChange: (patch: Partial<Pick<CreateInvoiceBody, "number" | "issueDate" | "dueDate">>) => void;
};

export function MetaFields({ invoice, errors, onChange }: MetaFieldsProps) {
  return (
    <fieldset className={fieldsetClass}>
      <FieldsetHeading title="Invoice details" purpose="Number and dates printed on the invoice sheet." />
      <div className={fieldGridClass}>
        <Field id="invoice-number" label="Invoice number" error={errors.number}>
          <input value={invoice.number} onChange={(event) => onChange({ number: event.target.value })} />
        </Field>
        <div className={fieldGridTwoClass}>
          <Field id="issue-date" label="Issue date" error={errors.issueDate}>
            <input
              type="date"
              value={invoice.issueDate}
              onChange={(event) => onChange({ issueDate: event.target.value })}
            />
          </Field>
          <Field id="due-date" label="Due date" error={errors.dueDate}>
            <input
              type="date"
              value={invoice.dueDate}
              onChange={(event) => onChange({ dueDate: event.target.value })}
            />
          </Field>
        </div>
      </div>
    </fieldset>
  );
}
