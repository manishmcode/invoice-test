import { legendClass, legendHintClass } from "../../../styles/Ui";

type FieldsetHeadingProps = {
  title: string;
  purpose: string;
};

export function FieldsetHeading({ title, purpose }: FieldsetHeadingProps) {
  return (
    <>
      <legend className={legendClass}>{title}</legend>
      <p className={legendHintClass}>{purpose}</p>
    </>
  );
}
