import { useState } from "react";
import { useApp } from "../lib/AppContext";
import { EntryForm, type EntryFormValues } from "../components/EntryForm";
import { Toast, type ToastState } from "../components/Toast";

export function EntryScreen() {
  const { addEntry, currency, setCurrency, settings } = useApp();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(values: EntryFormValues) {
    try {
      addEntry(values);
      setToast({
        kind: "success",
        message: `${values.type === "expense" ? "Expense" : "Income"} saved.`,
      });
      setFormKey((k) => k + 1);
    } catch {
      setToast({ kind: "error", message: "Something went wrong. Please try again." });
    }
  }

  return (
    <div className="relative flex-1 flex flex-col">
      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}
      <EntryForm
        key={formKey}
        currency={currency}
        supportedCurrencies={settings.supportedCurrencies}
        onCurrencyChange={setCurrency}
        onSubmit={handleSubmit}
        onValidationError={(message) => setToast({ kind: "error", message })}
        submitLabelPrefix="Save"
      />
    </div>
  );
}
