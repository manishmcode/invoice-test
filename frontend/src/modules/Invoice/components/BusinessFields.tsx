import type { Business } from "@hearth/invoice-types/modules/Invoice";
import { fieldGridClass, fieldGridTwoClass, fieldsetClass } from "../../../styles/Ui";
import { Field } from "./Field";
import { FieldsetHeading } from "./FieldsetHeading";

type BusinessFieldsProps = {
  value: Business;
  errors: Record<string, string>;
  onChange: (patch: Partial<Business>) => void;
};

export function BusinessFields({ value, errors, onChange }: BusinessFieldsProps) {
  return (
    <fieldset className={fieldsetClass}>
      <FieldsetHeading title="Bill from" purpose="Your business details. These print as the sender on the invoice." />
      <div className={fieldGridClass}>
        <Field id="business-name" label="Business name" error={errors["business.name"]}>
          <input
            value={value.name}
            autoComplete="organization"
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </Field>
        <Field id="business-address" label="Business address" error={errors["business.address"]}>
          <textarea
            value={value.address}
            rows={3}
            onChange={(event) => onChange({ address: event.target.value })}
          />
        </Field>
        <div className={fieldGridTwoClass}>
          <Field id="business-email" label="Business email" error={errors["business.email"]}>
            <input
              type="email"
              value={value.email}
              autoComplete="email"
              onChange={(event) => onChange({ email: event.target.value })}
            />
          </Field>
          <Field id="business-phone" label="Business phone" error={errors["business.phone"]}>
            <input
              value={value.phone}
              autoComplete="tel"
              onChange={(event) => onChange({ phone: event.target.value })}
            />
          </Field>
        </div>
      </div>
    </fieldset>
  );
}
