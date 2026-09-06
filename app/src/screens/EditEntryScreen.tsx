import { useState } from "react";
import { useApp } from "../lib/AppContext";
import { EntryForm, type EntryFormValues } from "../components/EntryForm";
import { Toast, type ToastState } from "../components/Toast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { TopBar } from "../components/TopBar";
import type { Currency, Entry } from "../lib/types";

interface EditEntryScreenProps {
  entry: Entry;
  onDone: () => void;
}

export function EditEntryScreen({ entry, onDone }: EditEntryScreenProps) {
  const { updateEntry, deleteEntry, settings } = useApp();
  const [currency, setCurrency] = useState<Currency>(entry.currency);
  const [toast, setToast] = useState<ToastState | null>(null);
  const currencyOptions = settings.supportedCurrencies.includes(entry.currency)
    ? settings.supportedCurrencies
    : [entry.currency, ...settings.supportedCurrencies];
  const [pendingValues, setPendingValues] = useState<EntryFormValues | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleConfirmSave() {
    if (!pendingValues) return;
    updateEntry(entry.id, pendingValues);
    setPendingValues(null);
    onDone();
  }

  function handleConfirmDelete() {
    deleteEntry(entry.id);
    setConfirmDelete(false);
    onDone();
  }

  return (
    <div className="w-full max-w-[480px] min-h-svh flex flex-col bg-[var(--app-bg)] relative mx-auto">
      <TopBar title="Edit Entry" onBackClick={onDone} />
      {toast && <Toast toast={toast} onDone={() => setToast(null)} />}

      <EntryForm
        initial={entry}
        currency={currency}
        supportedCurrencies={currencyOptions}
        expenseCategories={settings.expenseCategories}
        onCurrencyChange={setCurrency}
        onSubmit={setPendingValues}
        onValidationError={(message) => setToast({ kind: "error", message })}
        submitLabelPrefix="Save Changes to"
        extraActions={
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full rounded-xl py-4 font-semibold text-base active:opacity-80 transition-opacity"
            style={{ color: "var(--danger)", background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            Delete Entry
          </button>
        }
      />

      {pendingValues && (
        <ConfirmDialog
          title="Save changes?"
          message="This will update the saved entry with your changes."
          confirmLabel="Save"
          onConfirm={handleConfirmSave}
          onCancel={() => setPendingValues(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this entry?"
          message="This permanently removes the entry. This can't be undone."
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
