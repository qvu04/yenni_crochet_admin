import { Card, CardContent } from '../../../components/ui'

export const OrderMetric = ({ label, value }: { label: string; value: string | number }) => (
  <Card>
    <CardContent>
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </CardContent>
  </Card>
)
