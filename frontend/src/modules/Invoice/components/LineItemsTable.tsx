/**
 * @intent Line-item editor with a fixed-width unit rate so the amount stays readable.
 * @in lines, lineTotals, field errors, add/patch/remove handlers
 * @out HTML table of description, quantity, unit rate, line amount
 * @not invoice sheet preview, tax/discount totals, currency conversion
 */
import type { LineItem } from "@hearth/invoice-types/modules/Invoice";
import { formatUsd } from "@hearth/invoice-types/modules/Invoice";
import {
  btnClass,
  fieldErrorClass,
  fieldsetClass,
  iconBtnClass,
  inputClass,
} from "../../../styles/Ui";
import { cx } from "../../../utils/Cx";
import { FieldsetHeading } from "./FieldsetHeading";
import styles from "./LineItemsTable.module.scss";

type LineItemsTableProps = {
  lines: LineItem[];
  lineTotals: number[];
  errors: Record<string, string>;
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<LineItem>) => void;
  onRemove: (id: string) => void;
};

function readNumber(value: string): number {
  if (value.trim() === "") {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function LineItemsTable({
  lines,
  lineTotals,
  errors,
  onAdd,
  onPatch,
  onRemove,
}: LineItemsTableProps) {
  return (
    <fieldset className={fieldsetClass}>
      <FieldsetHeading title="Line items" purpose="What you are charging for, with quantity and unit rate." />
      {errors.lineItems ? <p className={fieldErrorClass}>{errors.lineItems}</p> : null}
      <div className={styles.wrap}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colDesc} />
            <col className={styles.colQty} />
            <col className={styles.colRate} />
            <col className={styles.colAmount} />
            <col className={styles.colRemove} />
          </colgroup>
          <thead>
            <tr>
              <th className={styles.head}>Item description</th>
              <th className={styles.head}>Quantity</th>
              <th className={styles.head}>Unit rate</th>
              <th className={styles.head}>Line amount</th>
              <th>
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const descriptionError = errors[`lineItems.${index}.description`];
              const quantityError = errors[`lineItems.${index}.quantity`];
              const priceError = errors[`lineItems.${index}.unitPrice`];
              return (
                <tr key={line.id}>
                  <td className={styles.cell}>
                    <label className={styles.label} htmlFor={`line-desc-${line.id}`}>
                      Item description
                    </label>
                    <input
                      id={`line-desc-${line.id}`}
                      className={inputClass}
                      value={line.description}
                      aria-invalid={descriptionError ? true : undefined}
                      aria-describedby={descriptionError ? `line-desc-${line.id}-error` : undefined}
                      onChange={(event) => onPatch(line.id, { description: event.target.value })}
                    />
                    {descriptionError ? (
                      <p className={fieldErrorClass} id={`line-desc-${line.id}-error`}>
                        {descriptionError}
                      </p>
                    ) : null}
                  </td>
                  <td className={styles.cell}>
                    <label className={styles.label} htmlFor={`line-qty-${line.id}`}>
                      Quantity
                    </label>
                    <input
                      id={`line-qty-${line.id}`}
                      className={cx(inputClass, styles.moneyInput)}
                      type="number"
                      min={0}
                      step="any"
                      value={line.quantity}
                      aria-invalid={quantityError ? true : undefined}
                      aria-describedby={quantityError ? `line-qty-${line.id}-error` : undefined}
                      onChange={(event) => onPatch(line.id, { quantity: readNumber(event.target.value) })}
                    />
                    {quantityError ? (
                      <p className={fieldErrorClass} id={`line-qty-${line.id}-error`}>
                        {quantityError}
                      </p>
                    ) : null}
                  </td>
                  <td className={styles.cell}>
                    <label className={styles.label} htmlFor={`line-price-${line.id}`}>
                      Unit rate
                    </label>
                    <input
                      id={`line-price-${line.id}`}
                      className={cx(inputClass, styles.moneyInput)}
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unitPrice}
                      aria-invalid={priceError ? true : undefined}
                      aria-describedby={priceError ? `line-price-${line.id}-error` : undefined}
                      onChange={(event) => onPatch(line.id, { unitPrice: readNumber(event.target.value) })}
                    />
                    {priceError ? (
                      <p className={fieldErrorClass} id={`line-price-${line.id}-error`}>
                        {priceError}
                      </p>
                    ) : null}
                  </td>
                  <td className={cx(styles.cell, styles.amount)}>
                    <span className={styles.label}>Line amount</span>
                    {formatUsd(lineTotals[index] ?? 0)}
                  </td>
                  <td className={styles.cell}>
                    <button
                      type="button"
                      className={iconBtnClass}
                      onClick={() => onRemove(line.id)}
                      disabled={lines.length <= 1}
                      aria-label={`Remove ${line.description || "line item"}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className={btnClass} onClick={onAdd}>
        Add line
      </button>
    </fieldset>
  );
}
