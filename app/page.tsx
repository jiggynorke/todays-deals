import { connection } from "next/server";
import { supabase } from "@/lib/supabase";

type Deal = {
  id: number;
  title: string;
  store: string | null;
  weight: number | null;
  price: number | null;
  original_price: number | null;
  url: string | null;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function percentOff(price: number | null, original: number | null) {
  if (price == null || !original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
}

const HOT_DEAL_PERCENT = 45;

export default async function Home() {
  // Render on every request so new rows in Supabase show up without a redeploy.
  await connection();

  const { data: deals, error } = await supabase
    .from("deals")
    .select("id, title, store, weight, price, original_price, url")
    .order("created_at", { ascending: false });

  // Biggest discount first; deals without a discount go last.
  const sorted = ((deals ?? []) as Deal[])
    .map((deal) => ({ ...deal, off: percentOff(deal.price, deal.original_price) }))
    .sort((a, b) => (b.off ?? -1) - (a.off ?? -1));

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Today&apos;s Deals</h1>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          Couldn&apos;t load deals: {error.message}
        </p>
      )}

      {!error && sorted.length === 0 && (
        <p className="mt-6 text-zinc-500">No deals yet. Check back soon.</p>
      )}

      <ul className="mt-8 flex flex-col gap-3">
        {sorted.map((deal) => {
          const { off } = deal;
          return (
            <li
              key={deal.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div>
                <p className="font-medium">
                  {off != null && off >= HOT_DEAL_PERCENT && (
                    <span role="img" aria-label="Hot deal" className="mr-1">
                      🔥
                    </span>
                  )}
                  {deal.url ? (
                    <a href={deal.url} className="hover:underline" target="_blank" rel="noopener noreferrer">
                      {deal.title}
                    </a>
                  ) : (
                    deal.title
                  )}
                </p>
                <p className="text-sm text-zinc-500">
                  {[deal.store, deal.weight != null && `${deal.weight}g`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              <div className="text-right">
                {deal.price != null && (
                  <p className="text-lg font-semibold">{money.format(deal.price)}</p>
                )}
                <p className="text-sm">
                  {deal.original_price != null && off != null && (
                    <span className="text-zinc-400 line-through">
                      {money.format(deal.original_price)}
                    </span>
                  )}
                  {off != null && (
                    <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      {off}% off
                    </span>
                  )}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
