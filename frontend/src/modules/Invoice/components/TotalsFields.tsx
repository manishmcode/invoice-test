import { fieldGridTwoClass, fieldsetClass } from "../../../styles/Ui";
import { Field } from "./Field";
import { FieldsetHeading } from "./FieldsetHeading";

type TotalsFieldsProps = {
  discountAmount: number;
  taxRatePercent: number;
  errors: Record<string, string>;
  onChange: (patch: { discountAmount?: number; taxRatePercent?: number }) => void;
};

function readNumber(value: string): number {
  if (value.trim() === "") {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function TotalsFields({
  discountAmount,
  taxRatePercent,
  errors,
  onChange,
}: TotalsFieldsProps) {
  return (
    <fieldset className={fieldsetClass}>
      <FieldsetHeading
        title="Discount and tax"
        purpose="Taken from the line-item subtotal before the amount due."
      />
      <div className={fieldGridTwoClass}>
        <Field id="discount" label="Discount (USD)" error={errors.discountAmount}>
          <input
            type="number"
            min={0}
            step="0.01"
            value={discountAmount}
            onChange={(event) => onChange({ discountAmount: readNumber(event.target.value) })}
          />
        </Field>
        <Field id="tax" label="Tax rate (%)" error={errors.taxRatePercent}>
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={taxRatePercent}
            onChange={(event) => onChange({ taxRatePercent: readNumber(event.target.value) })}
          />
        </Field>
      </div>
    </fieldset>
  );
}
