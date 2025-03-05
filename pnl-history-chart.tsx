"use client"

import type React from "react"
import { useMemo } from "react"
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"

type PnLDataPoint = {
  dt: string
  date: string
  daily_pnl_usd: number
  cumulative_pnl?: number
  positive_pnl?: number
  negative_pnl?: number
  formattedDaily?: string
  formattedCumulative?: string
}

const CustomDetailedTooltip: React.FC<{
  active?: boolean
  payload?: any[]
  label?: string
  data: PnLDataPoint[]
  viewMode: "cumulative" | "periodic" | "combined"
}> = ({ active, payload, label, data, viewMode }) => {
  if (!active || !payload || !payload.length) return null

  const dataPoint = data.find((d) => d.date === label)
  if (!dataPoint) return null

  // Use the formatted date directly from the data
  const formattedDate = dataPoint.date || label

  return (
    <div className="rounded-lg border bg-card p-3 shadow-md">
      <div className="mb-2 font-medium">{formattedDate}</div>

      <div className="space-y-2">
        {dataPoint.daily_pnl_usd !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Daily P&L:</span>
            <span className={`font-medium ${dataPoint.daily_pnl_usd >= 0 ? "text-green-600" : "text-red-600"}`}>
              {dataPoint.formattedDaily}
            </span>
          </div>
        )}

        {viewMode !== "periodic" && dataPoint.cumulative_pnl !== undefined && (
          <div className="flex justify-between gap-4">
            <span className="text-sm text-muted-foreground">Cumulative P&L:</span>
            <span className={`font-medium ${dataPoint.cumulative_pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
              {dataPoint.formattedCumulative}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

interface PnlHistoryChartProps {
  data: PnLDataPoint[]
  viewMode: "cumulative" | "periodic" | "combined"
  frequency: "day" | "week" | "month" | "quarter" | "year"
}

const PnlHistoryChart: React.FC<PnlHistoryChartProps> = ({ data, viewMode, frequency }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data
  }, [data])

  // Custom Y-axis ticks as requested
  const customYAxisTicks = [4, 3, 2, 1, 0, -1, -2]

  const renderChart = () => {
    if (!chartData.length) return <p className="text-center">No data available</p>

    // Common chart configuration
    const chartConfig = {
      pnl: {
        label: "Daily P&L",
        color: "hsl(var(--chart-1))",
      },
      cumulative: {
        label: "Cumulative P&L",
        color: "hsl(var(--chart-2))",
      },
      positive: {
        label: "Positive P&L",
        color: "hsl(142, 71%, 45%)",
      },
      negative: {
        label: "Negative P&L",
        color: "hsl(0, 84%, 60%)",
      },
    }

    switch (viewMode) {
      case "cumulative":
        return (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={true}
                  axisLine={true}
                  height={50}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={true}
                  axisLine={true}
                  tickFormatter={(value) => `${value}`}
                  ticks={customYAxisTicks}
                  domain={[Math.min(...customYAxisTicks), Math.max(...customYAxisTicks)]}
                  width={30}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                <Line
                  type="monotone"
                  dataKey="cumulative_pnl"
                  stroke="var(--color-cumulative)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Tooltip content={<CustomDetailedTooltip data={chartData} viewMode={viewMode} />} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        )

      case "periodic":
        return (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={true}
                  axisLine={true}
                  height={50}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={true}
                  axisLine={true}
                  tickFormatter={(value) => `${value}`}
                  ticks={customYAxisTicks}
                  domain={[Math.min(...customYAxisTicks), Math.max(...customYAxisTicks)]}
                  width={30}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                <Bar dataKey="positive_pnl" fill="var(--color-positive)" barSize={20} radius={[4, 4, 0, 0]} />
                <Bar dataKey="negative_pnl" fill="var(--color-negative)" barSize={20} radius={[4, 4, 0, 0]} />
                <Tooltip content={<CustomDetailedTooltip data={chartData} viewMode={viewMode} />} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        )

      case "combined":
      default:
        return (
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={true}
                  axisLine={true}
                  height={50}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={true}
                  axisLine={true}
                  tickFormatter={(value) => `${value}`}
                  ticks={customYAxisTicks}
                  domain={[Math.min(...customYAxisTicks), Math.max(...customYAxisTicks)]}
                  width={30}
                />
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
                <Bar dataKey="positive_pnl" fill="var(--color-positive)" barSize={20} radius={[4, 4, 0, 0]} />
                <Bar dataKey="negative_pnl" fill="var(--color-negative)" barSize={20} radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="cumulative_pnl"
                  stroke="var(--color-cumulative)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Tooltip content={<CustomDetailedTooltip data={chartData} viewMode={viewMode} />} />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        )
    }
  }

  return <div className="w-full">{renderChart()}</div>
}

export default PnlHistoryChart

