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
import { TrendingUp, Users, MessageCircle, AlertTriangle, Loader2, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-provider"
import { getAnalytics, getRecentActivity, getAutomations, AnalyticsDataPoint } from "@/lib/firestore-service"

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
  const { appUser } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [days, setDays] = React.useState(7)
  const [chartData, setChartData] = React.useState<{ date: string; sent: number; detected: number }[]>([])
  const [stats, setStats] = React.useState({
    totalDetected: 0,
    totalSent: 0,
    uniqueUsers: 0,
    totalFailed: 0,
    sentTrend: "+0%",
    detectedTrend: "+0%",
  })

  React.useEffect(() => {
    async function loadAnalytics() {
      if (!appUser) return
      setLoading(true)
      try {
        const [analyticsData, activities, automations] = await Promise.all([
          getAnalytics(appUser.uid, days),
          getRecentActivity(appUser.uid, 100),
          getAutomations(appUser.uid),
        ])

        // Build chart data from analytics collection
        if (analyticsData.length > 0) {
          setChartData(analyticsData.map(d => ({
            date: formatDate(d.date),
            sent: d.sent,
            detected: d.detected,
          })))
        } else {
          // If no analytics data yet, build from activity logs
          const grouped = groupActivitiesByDay(activities, days)
          setChartData(grouped)
        }

        // Calculate stats
        const totalSent = automations.reduce((sum, a) => sum + a.totalSent, 0)
        const successActivities = activities.filter(a => a.status === "success").length
        const failedActivities = activities.filter(a => a.status === "failed").length
        const uniqueAuthors = new Set(activities.map(a => a.commentAuthor)).size

        setStats({
          totalDetected: activities.length,
          totalSent: totalSent || successActivities,
          uniqueUsers: uniqueAuthors,
          totalFailed: failedActivities,
          sentTrend: totalSent > 0 ? `+${Math.min(totalSent, 100)}` : "0",
          detectedTrend: activities.length > 0 ? `+${Math.min(activities.length, 100)}` : "0",
        })
      } catch (err) {
        console.error("Failed to load analytics:", err)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [appUser, days])

  function formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString("en-US", { weekday: "short" })
    } catch {
      return dateStr
    }
  }

  function groupActivitiesByDay(
    activities: any[],
    numDays: number
  ): { date: string; sent: number; detected: number }[] {
    const result: { date: string; sent: number; detected: number }[] = []
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" })

      const dayActivities = activities.filter(a => {
        try {
          const actDate = new Date(a.timestamp).toISOString().split("T")[0]
          return actDate === dateStr
        } catch {
          return false
        }
      })

      result.push({
        date: dayLabel,
        sent: dayActivities.filter(a => a.status === "success").length,
        detected: dayActivities.length,
      })
    }
    return result
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  const hasData = chartData.some(d => d.sent > 0 || d.detected > 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your engagement performance over time.</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />
          {[7, 14, 30].map(d => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
              className="rounded-full"
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Detected Comments", value: stats.totalDetected.toLocaleString(), trend: stats.detectedTrend, icon: MessageCircle, color: "text-blue-500" },
          { label: "Successful DMs", value: stats.totalSent.toLocaleString(), trend: stats.sentTrend, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Unique Users", value: stats.uniqueUsers.toLocaleString(), trend: "", icon: Users, color: "text-purple-500" },
          { label: "Failed Deliveries", value: stats.totalFailed.toLocaleString(), trend: stats.totalFailed > 0 ? `${stats.totalFailed}` : "0", icon: AlertTriangle, color: "text-red-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`size-4 ${stat.color}`} />
                {stat.trend && (
                  <span className={`text-xs font-bold ${stat.label === "Failed Deliveries" ? 'text-red-500' : 'text-emerald-500'}`}>
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold opacity-70">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!hasData ? (
        <Card className="border-none shadow-md">
          <CardContent className="py-16 text-center">
            <MessageCircle className="size-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-headline font-bold text-muted-foreground">No activity data yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Analytics will appear here once you start scanning comments and sending DMs.
              Go to Automations → Scan Comments Now to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Delivery Performance</CardTitle>
              <CardDescription>Comparison of detected comments vs sent DMs (last {days} days).</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer config={chartConfig}>
                <BarChart data={chartData}>
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
              <CardDescription>Progression of successful automations (last {days} days).</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
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
      )}
    </div>
  )
}
