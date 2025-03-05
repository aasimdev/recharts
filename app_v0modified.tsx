"use client"

import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ArrowDownUp } from "lucide-react"
import PnlHistoryChart from "./pnl-history-chart"

export type TimeFrequency = "day" | "week" | "month" | "quarter" | "year"

interface DataPoint {
  dt: string
  daily_pnl_usd: number
  [key: string]: any
}

export function formatDateByFrequency(dateStr: string, frequency: TimeFrequency): string {
  // For special formats like "2024-W1" or "2024-Q1" that aren't valid date strings
  if (frequency === "week" && dateStr.includes("-W")) {
    const parts = dateStr.split("-W")
    return `Week ${parts[1]}, ${parts[0]}`
  }

  if (frequency === "quarter" && dateStr.includes("-Q")) {
    const parts = dateStr.split("-Q")
    return `Q${parts[1]} ${parts[0]}`
  }

  // For regular date strings
  try {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      switch (frequency) {
        case "day":
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        case "week":
          return `Week ${getWeekNumber(date)}, ${date.getFullYear()}`
        case "month":
          return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        case "quarter":
          return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
        case "year":
          return date.getFullYear().toString()
        default:
          return dateStr
      }
    }
  } catch (error) {
    console.error("Error formatting date:", error)
  }

  // If all else fails, return the original string
  return dateStr
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export function aggregateDataByFrequency(data: DataPoint[], frequency: TimeFrequency): DataPoint[] {
  if (!data || data.length === 0) return []

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.dt).getTime() - new Date(b.dt).getTime())

  if (frequency === "day") {
    return sortedData
  }

  const aggregatedData: { [key: string]: DataPoint } = {}

  sortedData.forEach((item) => {
    const date = new Date(item.dt)
    let key: string

    switch (frequency) {
      case "week":
        const weekNum = getWeekNumber(date)
        key = `${date.getFullYear()}-W${weekNum}`
        break
      case "month":
        key = `${date.getFullYear()}-${date.getMonth() + 1}`
        break
      case "quarter":
        const quarter = Math.floor(date.getMonth() / 3) + 1
        key = `${date.getFullYear()}-Q${quarter}`
        break
      case "year":
        key = date.getFullYear().toString()
        break
      default:
        key = item.dt
    }

    if (!aggregatedData[key]) {
      aggregatedData[key] = {
        dt: key,
        daily_pnl_usd: 0,
      }
    }

    aggregatedData[key].daily_pnl_usd += item.daily_pnl_usd
  })

  return Object.values(aggregatedData)
}

// Extended sample data to better demonstrate filtering
export function getPnLData() {
  return [
    { dt: "2024-01-01", daily_pnl_usd: 50.12 },
    { dt: "2024-01-02", daily_pnl_usd: -30.45 },
    { dt: "2024-01-03", daily_pnl_usd: 80.67 },
    { dt: "2024-01-04", daily_pnl_usd: -15.89 },
    { dt: "2024-01-05", daily_pnl_usd: 120.34 },
    { dt: "2024-01-06", daily_pnl_usd: -90.23 },
    { dt: "2024-01-07", daily_pnl_usd: 200.78 },
    { dt: "2024-01-08", daily_pnl_usd: -50.12 },
    { dt: "2024-01-09", daily_pnl_usd: 75.45 },
    { dt: "2024-01-10", daily_pnl_usd: 160.23 },
    { dt: "2024-01-11", daily_pnl_usd: -110.34 },
    { dt: "2024-01-12", daily_pnl_usd: 140.67 },
    { dt: "2024-01-13", daily_pnl_usd: -35.78 },
    { dt: "2024-01-14", daily_pnl_usd: 95.89 },
    { dt: "2024-01-15", daily_pnl_usd: -25.12 },
    { dt: "2024-01-16", daily_pnl_usd: 210.34 },
    { dt: "2024-01-17", daily_pnl_usd: -190.45 },
    { dt: "2024-01-18", daily_pnl_usd: 300.23 },
    { dt: "2024-01-19", daily_pnl_usd: -220.56 },
    { dt: "2024-01-20", daily_pnl_usd: 180.67 },
    { dt: "2024-01-21", daily_pnl_usd: 275.78 },
    { dt: "2024-01-22", daily_pnl_usd: -140.12 },
    { dt: "2024-01-23", daily_pnl_usd: 90.45 },
    { dt: "2024-01-24", daily_pnl_usd: 310.23 },
    { dt: "2024-01-25", daily_pnl_usd: -290.78 },
    { dt: "2024-01-26", daily_pnl_usd: 200.89 },
    { dt: "2024-01-27", daily_pnl_usd: -150.34 },
    // Add data for February to demonstrate month filtering
    { dt: "2024-02-01", daily_pnl_usd: 180.45 },
    { dt: "2024-02-05", daily_pnl_usd: -120.67 },
    { dt: "2024-02-10", daily_pnl_usd: 250.34 },
    { dt: "2024-02-15", daily_pnl_usd: -90.56 },
    { dt: "2024-02-20", daily_pnl_usd: 310.78 },
    { dt: "2024-02-25", daily_pnl_usd: -150.23 },
    // Add data for March to demonstrate quarter filtering
    { dt: "2024-03-01", daily_pnl_usd: 220.56 },
    { dt: "2024-03-10", daily_pnl_usd: -180.34 },
    { dt: "2024-03-20", daily_pnl_usd: 290.67 },
    // Add data for April to demonstrate quarter filtering
    { dt: "2024-04-01", daily_pnl_usd: -120.45 },
    { dt: "2024-04-15", daily_pnl_usd: 340.23 },
    // Add data for July to demonstrate quarter filtering
    { dt: "2024-07-01", daily_pnl_usd: 400.12 },
    { dt: "2024-07-15", daily_pnl_usd: -250.67 },
    // Add data for October to demonstrate quarter filtering
    { dt: "2024-10-01", daily_pnl_usd: 380.45 },
    { dt: "2024-10-15", daily_pnl_usd: -200.34 },
  ]
}

export default function App() {
  const rawData = getPnLData()
  const [viewMode, setViewMode] = useState<"cumulative" | "periodic" | "combined">("combined")
  const [frequency, setFrequency] = useState<TimeFrequency>("day")

  const chartData = useMemo(() => {
    const aggregatedData = aggregateDataByFrequency(rawData, frequency) || []

    let cumulative = 0
    return aggregatedData.map((item) => {
      cumulative += item.daily_pnl_usd
      return {
        ...item,
        date: formatDateByFrequency(item.dt, frequency),
        cumulative_pnl: Number.parseFloat(cumulative.toFixed(2)),
        formattedDaily: `${item.daily_pnl_usd > 0 ? "+" : ""}$${Math.abs(item.daily_pnl_usd).toFixed(2)}`,
        formattedCumulative: `$${cumulative.toFixed(2)}`,
        positive_pnl: item.daily_pnl_usd > 0 ? item.daily_pnl_usd : 0,
        negative_pnl: item.daily_pnl_usd < 0 ? item.daily_pnl_usd : 0,
      }
    })
  }, [rawData, frequency])

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-8 flex flex-col gap-6 border-b border-gray-100 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">PnL Performance</h1>
            <p className="text-sm text-gray-500">Track your profit and loss over time</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative z-40">
              <Select
                value={viewMode}
                onValueChange={(value) => setViewMode(value as "cumulative" | "periodic" | "combined")}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <ArrowDownUp className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select view" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cumulative">Cumulative</SelectItem>
                  <SelectItem value="periodic">Periodic</SelectItem>
                  <SelectItem value="combined">Combined</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative z-30">
              <Select value={frequency} onValueChange={(value) => setFrequency(value as TimeFrequency)}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select frequency" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">By day</SelectItem>
                  <SelectItem value="week">By week</SelectItem>
                  <SelectItem value="month">By month</SelectItem>
                  <SelectItem value="quarter">By quarter</SelectItem>
                  <SelectItem value="year">By year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="relative z-10 rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
          <PnlHistoryChart data={chartData} viewMode={viewMode} frequency={frequency} />
        </div>
      </div>
    </main>
  )
}

