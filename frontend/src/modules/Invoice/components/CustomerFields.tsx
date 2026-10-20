import type { Customer } from "@hearth/invoice-types/modules/Invoice";
import { fieldGridClass, fieldsetClass } from "../../../styles/Ui";
import { Field } from "./Field";
import { FieldsetHeading } from "./FieldsetHeading";

type CustomerFieldsProps = {
  value: Customer;
  errors: Record<string, string>;
  onChange: (patch: Partial<Customer>) => void;
};

export function CustomerFields({ value, errors, onChange }: CustomerFieldsProps) {
  return (
    <fieldset className={fieldsetClass}>
      <FieldsetHeading title="Bill to" purpose="The customer who should receive and pay this invoice." />
      <div className={fieldGridClass}>
        <Field id="customer-name" label="Customer name" error={errors["customer.name"]}>
          <input
            value={value.name}
            autoComplete="name"
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </Field>
        <Field id="customer-address" label="Customer address" error={errors["customer.address"]}>
          <textarea
            value={value.address}
            rows={3}
            onChange={(event) => onChange({ address: event.target.value })}
          />
        </Field>
        <Field id="customer-email" label="Customer email" error={errors["customer.email"]}>
          <input
            type="email"
            value={value.email}
            autoComplete="email"
            onChange={(event) => onChange({ email: event.target.value })}
          />
        </Field>
      </div>
    </fieldset>
  );
}
