/**
 * @intent Edit invoice fields beside the live preview.
 * @in editor state, totals, errors, dispatch
 * @out form sections for parties, lines, totals, custom fields, notes
 * @not email sending
 */
import type { InvoiceTotals } from "@hearth/invoice-types/modules/Invoice";
import type { Dispatch, KeyboardEvent } from "react";
import { BusinessFields } from "../components/BusinessFields";
import { CustomFieldsEditor } from "../components/CustomFieldsEditor";
import { CustomerFields } from "../components/CustomerFields";
import { LineItemsTable } from "../components/LineItemsTable";
import { MetaFields } from "../components/MetaFields";
import { NotesField } from "../components/NotesField";
import { TotalsFields } from "../components/TotalsFields";
import type { EditorAction, EditorState } from "../state/EditorReducer";
import { cx } from "../../../utils/Cx";
import styles from "./InvoiceEditorPage.module.scss";

type InvoiceFieldsProps = {
  state: EditorState;
  totals: InvoiceTotals;
  errors: Record<string, string>;
  dispatch: Dispatch<EditorAction>;
  onKeyDown: (event: KeyboardEvent<HTMLFormElement>) => void;
};

export function InvoiceFields({
  state,
  totals,
  errors,
  dispatch,
  onKeyDown,
}: InvoiceFieldsProps) {
  return (
    <form
      id="editor"
      className={cx("editor no-print @container", styles.editor)}
      onSubmit={(event) => event.preventDefault()}
      onKeyDown={onKeyDown}
    >
      <BusinessFields
        value={state.invoice.business}
        errors={errors}
        onChange={(patch) => dispatch({ type: "patchBusiness", patch })}
      />
      <CustomerFields
        value={state.invoice.customer}
        errors={errors}
        onChange={(patch) => dispatch({ type: "patchCustomer", patch })}
      />
      <MetaFields
        invoice={state.invoice}
        errors={errors}
        onChange={(patch) => dispatch({ type: "patchMeta", patch })}
      />
      <LineItemsTable
        lines={state.invoice.lineItems}
        lineTotals={totals.lineTotals}
        errors={errors}
        onAdd={() => dispatch({ type: "addLine" })}
        onPatch={(id, patch) => dispatch({ type: "patchLine", id, patch })}
        onRemove={(id) => dispatch({ type: "removeLine", id })}
      />
      <TotalsFields
        discountAmount={state.invoice.discountAmount}
        taxRatePercent={state.invoice.taxRatePercent}
        errors={errors}
        onChange={(patch) => dispatch({ type: "patchMeta", patch })}
      />
      <CustomFieldsEditor
        fields={state.invoice.customFields}
        errors={errors}
        onAdd={() => dispatch({ type: "addCustomField" })}
        onPatch={(id, patch) => dispatch({ type: "patchCustomField", id, patch })}
        onRemove={(id) => dispatch({ type: "removeCustomField", id })}
      />
      <NotesField
        value={state.invoice.notes}
        error={errors.notes}
        onChange={(notes) => dispatch({ type: "patchMeta", patch: { notes } })}
      />
    </form>
  );
}
