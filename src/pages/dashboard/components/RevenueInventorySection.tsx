import {
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type TooltipItem,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, SegmentedControl } from '../../../components/ui'
import { formatCurrency, type RevenuePeriod, type RevenuePoint } from '../../../utils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const revenuePeriods: Array<{ label: string; value: RevenuePeriod }> = [
  { label: 'Ngày', value: 'day' },
  { label: 'Tuần', value: 'week' },
  { label: 'Tháng', value: 'month' },
]

interface RevenueInventorySectionProps {
  revenuePeriod: RevenuePeriod
  revenueSeries: RevenuePoint[]
  chartTotal: number
  totalInventoryQuantity: number
  activeProductCount: number
  variantProductCount: number
  preOrderCount: number
  onRevenuePeriodChange: (period: RevenuePeriod) => void
}

export const RevenueInventorySection = ({
  revenuePeriod,
  revenueSeries,
  chartTotal,
  totalInventoryQuantity,
  activeProductCount,
  variantProductCount,
  preOrderCount,
  onRevenuePeriodChange,
}: RevenueInventorySectionProps) => {
  const chartData = {
    labels: revenueSeries.map((point) => point.label),
    datasets: [
      {
        label: 'Doanh thu',
        data: revenueSeries.map((point) => point.value),
        borderColor: '#9F5161',
        backgroundColor: 'rgba(248, 183, 193, 0.32)',
        borderWidth: 3,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#2F252A',
        pointBorderColor: '#FFFFFF',
        tension: 0.35,
      },
    ],
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => formatCurrency(Number(context.parsed.y ?? 0)),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#8B727A',
          font: { weight: 700 },
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: 'rgba(159, 81, 97, 0.12)' },
        ticks: {
          color: '#8B727A',
          callback: (value: string | number) => formatCurrency(Number(value)).replace('₫', '').trim(),
        },
      },
    },
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row">
          <div>
            <CardTitle>Doanh thu</CardTitle>
            <CardDescription>Tổng {formatCurrency(chartTotal)} trong khoảng đang xem.</CardDescription>
          </div>
          <SegmentedControl value={revenuePeriod} options={revenuePeriods} onValueChange={onRevenuePeriodChange} />
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Tổng quan tồn kho</CardTitle>
            <CardDescription>Theo dõi nhanh lượng hàng đang bật bán.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <InventoryMetric label="Tổng số lượng còn tồn" value={totalInventoryQuantity} />
          <InventoryMetric label="Sản phẩm đang bật bán" value={activeProductCount} />
          <InventoryMetric label="Sản phẩm có phân loại" value={variantProductCount} />
          <InventoryMetric label="Sản phẩm preorder" value={preOrderCount} />
        </CardContent>
      </Card>
    </section>
  )
}

const InventoryMetric = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between gap-4 rounded-admin border border-berry/10 bg-cream px-4 py-3">
    <span className="text-sm font-bold text-muted">{label}</span>
    <span className="text-lg font-black text-ink">{value}</span>
  </div>
)
