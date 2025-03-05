"use client"

import { Tooltip, TooltipProvider } from "./tooltip"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { TooltipProps } from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartConfig | null>(null)

function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  // Create CSS variables for each color in the config
  const style = React.useMemo(() => {
    return Object.entries(config).reduce(
      (acc, [key, value]) => {
        if (value.color) {
          acc[`--color-${key}`] = value.color
        }
        return acc
      },
      {} as Record<string, string>,
    )
  }, [config])

  return (
    <ChartContext.Provider value={config}>
      <div className={cn("w-full", className)} style={style} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipProps<TValue extends ValueType, TName extends NameType>
  extends Omit<TooltipProps<TValue, TName>, "content"> {
  content?: React.ReactNode
  className?: string
  defaultIndex?: number
}

function ChartTooltip<TValue extends ValueType, TName extends NameType>({
  content,
  className,
  defaultIndex,
  ...props
}: ChartTooltipProps<TValue, TName>) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(defaultIndex ?? null)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return

      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, 10)))
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeIndex])

  return (
    <TooltipProvider>
      <Tooltip
        {...props}
        content={
          content ? (
            <div className={cn("rounded-md border bg-background p-2 shadow-md", className)}>{content}</div>
          ) : undefined
        }
        onMouseEnter={() => setActiveIndex(null)}
        onMouseMove={(data: any) => {
          if (props.onMouseMove as any) {
            props.onMouseMove(data)
          }
        }}
        position={{ y: 0 }}
        isAnimationActive={false}
      />
    </TooltipProvider>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: {
      [key: string]: any
    }
  }>
  label?: string
  labelKey?: string
  labelClassName?: string
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number, name?: string) => string
  formatter?: (value: number, name?: string) => string
  className?: string
  indicator?: "dot" | "line"
}

function ChartTooltipContent({
  active,
  payload,
  label,
  labelKey,
  labelClassName,
  labelFormatter,
  valueFormatter,
  formatter = (value) => String(value),
  className,
  indicator = "dot",
}: ChartTooltipContentProps) {
  const config = React.useContext(ChartContext)

  if (!active || !payload?.length || !config) {
    return null
  }

  const formattedLabel = labelFormatter ? labelFormatter(label!) : label

  return (
    <div className={cn("space-y-2", className)}>
      {formattedLabel && <div className={cn("font-medium", labelClassName)}>{formattedLabel}</div>}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const dataKey = item.name
          const configKey = labelKey ?? dataKey
          const itemConfig = config[configKey] || config[dataKey]

          if (!itemConfig) return null

          const formattedValue = formatter
            ? formatter(item.value, item.name)
            : valueFormatter
              ? valueFormatter(item.value, item.name)
              : item.value

          return (
            <div key={index} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {indicator === "dot" ? (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: itemConfig.color || `var(--color-${dataKey})`,
                    }}
                  />
                ) : (
                  <div
                    className="h-3 w-0.5 rounded-full"
                    style={{
                      backgroundColor: itemConfig.color || `var(--color-${dataKey})`,
                    }}
                  />
                )}
                <span className="text-sm text-muted-foreground">{itemConfig.label}</span>
              </div>
              <span className="font-medium">{formattedValue}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig }

