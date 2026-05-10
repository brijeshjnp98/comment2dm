
"use client"

import * as React from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"
import { TrendingUp, Users, MessageCircle, AlertTriangle } from "lucide-react"

const performanceData = [
  { date: "Mon", sent: 45, detected: 48 },
  { date: "Tue", sent: 52, detected: 55 },
  { date: "Wed", sent: 38, detected: 42 },
  { date: "Thu", sent: 65, detected: 68 },
  { date: "Fri", sent: 48, detected: 50 },
  { date: "Sat", sent: 24, detected: 28 },
  { date: "Sun", sent: 32, detected: 35 },
]

const chartConfig = {
  sent: {
    label: "DMs Sent",
    color: "hsl(var(--primary))",
  },
  detected: {
    label: "Comments Detected",
    color: "hsl(var(--accent))",
  },
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your engagement performance over time.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Detected Comments", value: "3,482", trend: "+14%", icon: MessageCircle, color: "text-blue-500" },
          { label: "Successful DMs", value: "3,212", trend: "+12%", icon: TrendingUp, color: "text-emerald-500" },
          { label: "Unique Users", value: "1,824", trend: "+8%", icon: Users, color: "text-purple-500" },
          { label: "Failed Deliveries", value: "24", trend: "-5%", icon: AlertTriangle, color: "text-red-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`size-4 ${stat.color}`} />
                <span className={`text-xs font-bold ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold opacity-70">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Delivery Performance</CardTitle>
            <CardDescription>Daily comparison of detected comments vs sent DMs.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer config={chartConfig}>
              <BarChart data={performanceData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="detected" 
                  fill="var(--color-detected)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
                <Bar 
                  dataKey="sent" 
                  fill="var(--color-sent)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Growth Trend</CardTitle>
            <CardDescription>Weekly progression of successful automations.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ChartContainer config={chartConfig}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-sent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-sent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tickMargin={10}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="var(--color-sent)" 
                  fillOpacity={1} 
                  fill="url(#colorSent)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
