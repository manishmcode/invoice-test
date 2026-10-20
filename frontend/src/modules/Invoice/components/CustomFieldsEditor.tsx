import type { CustomField } from "@hearth/invoice-types/modules/Invoice";
import {
  btnClass,
  fieldClass,
  fieldErrorClass,
  fieldLabelClass,
  fieldsetClass,
  iconBtnClass,
  inputClass,
} from "../../../styles/Ui";
import { FieldsetHeading } from "./FieldsetHeading";

type CustomFieldsEditorProps = {
  fields: CustomField[];
  errors: Record<string, string>;
  onAdd: () => void;
  onPatch: (id: string, patch: Partial<CustomField>) => void;
  onRemove: (id: string) => void;
};

export function CustomFieldsEditor({
  fields,
  errors,
  onAdd,
  onPatch,
  onRemove,
}: CustomFieldsEditorProps) {
  return (
    <fieldset className={fieldsetClass}>
      <FieldsetHeading
        title="Custom fields"
        purpose="Extra details such as a purchase order. Choose which ones print on the invoice."
      />
      {errors.customFields ? <p className={fieldErrorClass}>{errors.customFields}</p> : null}
      {fields.map((field, index) => {
        const labelError = errors[`customFields.${index}.label`];
        const valueError = errors[`customFields.${index}.value`];
        return (
          <div className="grid gap-[0.6rem] py-3" key={field.id}>
            <div className={fieldClass}>
              <label className={fieldLabelClass} htmlFor={`custom-label-${field.id}`}>
                Field name
              </label>
              <input
                id={`custom-label-${field.id}`}
                className={inputClass}
                value={field.label}
                aria-invalid={labelError ? true : undefined}
                aria-describedby={labelError ? `custom-label-${field.id}-error` : undefined}
                onChange={(event) => onPatch(field.id, { label: event.target.value })}
              />
              {labelError ? (
                <p className={fieldErrorClass} id={`custom-label-${field.id}-error`}>
                  {labelError}
                </p>
              ) : null}
            </div>
            <div className={fieldClass}>
              <label className={fieldLabelClass} htmlFor={`custom-value-${field.id}`}>
                Field value
              </label>
              <input
                id={`custom-value-${field.id}`}
                className={inputClass}
                value={field.value}
                aria-invalid={valueError ? true : undefined}
                aria-describedby={valueError ? `custom-value-${field.id}-error` : undefined}
                onChange={(event) => onPatch(field.id, { value: event.target.value })}
              />
              {valueError ? (
                <p className={fieldErrorClass} id={`custom-value-${field.id}-error`}>
                  {valueError}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[0.92rem]" htmlFor={`custom-visible-${field.id}`}>
                <input
                  id={`custom-visible-${field.id}`}
                  type="checkbox"
                  checked={field.visible}
                  onChange={(event) => onPatch(field.id, { visible: event.target.checked })}
                />
                Show on invoice
              </label>
              <button
                type="button"
                className={iconBtnClass}
                onClick={() => onRemove(field.id)}
                aria-label={`Remove ${field.label || "custom field"}`}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
      <button type="button" className={`${btnClass} mt-3`} onClick={onAdd}>
        Add custom field
      </button>
    </fieldset>
  );
}
