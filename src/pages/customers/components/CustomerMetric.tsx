export const CustomerMetric = ({ label, value }: { label: string; value: string | number }) => (
  <article className="rounded-admin bg-white p-4 shadow-soft ring-1 ring-berry/10">
    <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
    <p className="mt-3 text-2xl font-black text-ink">{value}</p>
  </article>
)
