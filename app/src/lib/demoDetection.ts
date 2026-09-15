import type { Entry } from "./types";

// Mirrors the exact entries generateDemoEntries() in demoData.ts produces,
// so a batch of them can be recognized after they've been merged into real
// data by the sync race this detector exists to clean up after (see
// AppContext.tsx's demoModeRef guards). Jittered amounts are matched by the
// same range mkEntry/jitter() draws from; fixed amounts must match exactly.
interface DemoSignature {
  type: Entry["type"];
  category: string;
  comment: string;
  currency: Entry["currency"];
  amountMin: number;
  amountMax: number;
}

function fixed(type: Entry["type"], category: string, comment: string, currency: Entry["currency"], amount: number): DemoSignature {
  return { type, category, comment, currency, amountMin: amount, amountMax: amount };
}

function jittered(
  type: Entry["type"],
  category: string,
  comment: string,
  currency: Entry["currency"],
  base: number,
  spread: number,
): DemoSignature {
  return { type, category, comment, currency, amountMin: base - spread, amountMax: base + spread };
}

const DEMO_SIGNATURES: DemoSignature[] = [
  jittered("income", "Salary", "", "PKR", 280000, 20000),
  fixed("expense", "PK Rent", "", "PKR", 60000),
  jittered("expense", "PK Groceries", "monthly shop", "PKR", 15000, 4000),
  jittered("expense", "PK Bills", "electricity + gas", "PKR", 9000, 2000),
  jittered("expense", "Car", "fuel", "PKR", 6000, 2000),
  fixed("expense", "PK Maids", "", "PKR", 8000),
  fixed("income", "Yearly Bonus", "annual bonus", "PKR", 150000),
  fixed("expense", "DE Air Ticket", "flight home", "EUR", 450),
  fixed("expense", "DE", "utilities", "EUR", 120),
  fixed("expense", "Family Support", "", "PKR", 20000),
  fixed("expense", "Spende", "donation", "PKR", 5000),
  fixed("expense", "Health", "checkup", "PKR", 7500),
  fixed("expense", "PK Groceries", "milk and bread", "PKR", 2200),
  fixed("expense", "PK Dine Out / Delivery", "dinner out", "PKR", 1800),
  fixed("expense", "Car", "fuel", "PKR", 3500),
  fixed("expense", "PK Groceries", "", "PKR", 1400),
  fixed("expense", "PK Others", "", "PKR", 900),
  fixed("expense", "PK Dine Out / Delivery", "weekend takeout", "PKR", 2600),
  fixed("expense", "Health", "pharmacy", "PKR", 1200),
];

function matchesAnySignature(entry: Entry): boolean {
  return DEMO_SIGNATURES.some(
    (sig) =>
      sig.type === entry.type &&
      sig.category === entry.category &&
      sig.comment === entry.comment &&
      sig.currency === entry.currency &&
      entry.amount >= sig.amountMin &&
      entry.amount <= sig.amountMax,
  );
}

// All 57 entries from one generateDemoEntries() call are built in a single
// synchronous loop, so they share the same createdAt down to the second.
// Real entries, added one at a time over normal use, essentially never do.
// Requiring both a same-second cluster AND a signature match keeps this from
// flagging a real entry that just happens to match one signature in isolation.
const MIN_CLUSTER_SIZE = 15;

export function findLikelyDemoEntries(entries: Entry[]): Entry[] {
  const bySecond = new Map<string, Entry[]>();
  for (const entry of entries) {
    const key = entry.createdAt.slice(0, 19);
    const group = bySecond.get(key);
    if (group) group.push(entry);
    else bySecond.set(key, [entry]);
  }

  const flagged: Entry[] = [];
  for (const group of bySecond.values()) {
    if (group.length < MIN_CLUSTER_SIZE) continue;
    const matching = group.filter(matchesAnySignature);
    if (matching.length / group.length >= 0.8) {
      flagged.push(...matching);
    }
  }

  return flagged.sort((a, b) => b.date.localeCompare(a.date));
}
