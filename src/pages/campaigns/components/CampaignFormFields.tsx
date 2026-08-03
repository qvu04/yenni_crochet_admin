import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export const CampaignFormSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-admin border border-berry/10 bg-white p-4">
    <h4 className="text-sm font-black uppercase tracking-[0.08em] text-muted">{title}</h4>
    <div className="mt-4 space-y-4">{children}</div>
  </section>
)

export const CampaignFormField = ({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) => (
  <label className="block">
    <span className="text-sm font-bold text-cocoa">{label}</span>
    <div className="mt-2">{children}</div>
    {error ? <span className="mt-2 block text-sm font-bold text-berry">{error}</span> : null}
  </label>
)

interface CampaignToggleFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const CampaignToggleField = forwardRef<HTMLInputElement, CampaignToggleFieldProps>(({ label, ...props }, ref) => (
  <label className="flex h-11 items-center gap-3 rounded-admin border border-berry/10 bg-cream px-4 text-sm font-bold text-cocoa">
    <input ref={ref} type="checkbox" className="h-4 w-4 accent-berry" {...props} />
    {label}
  </label>
))

CampaignToggleField.displayName = 'CampaignToggleField'
