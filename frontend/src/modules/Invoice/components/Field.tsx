import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { fieldClass, fieldErrorClass, fieldLabelClass, inputClass, textareaClass } from "../../../styles/Ui";
import { cx } from "../../../utils/Cx";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export function Field({ id, label, error, children }: FieldProps) {
  const describedBy = error ? `${id}-error` : undefined;
  const control = Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }
    const element = child as ReactElement<{ className?: string }>;
    const isTextArea = element.type === "textarea";
    return cloneElement(element, {
      id,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy,
      className: cx(isTextArea ? textareaClass : inputClass, element.props.className),
    } as Partial<typeof element.props>);
  });

  return (
    <div className={fieldClass}>
      <label className={fieldLabelClass} htmlFor={id}>
        {label}
      </label>
      {control}
      {error ? (
        <p className={fieldErrorClass} id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
