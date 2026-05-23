"use client"

import * as React from "react"
import { 
  Zap, 
  MessageSquare, 
  Activity, 
  ArrowUpRight, 
  Plus, 
  Instagram,
  CheckCircle2,
  Clock,
  Loader2
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useAuth } from "@/lib/auth-provider"
import { getAutomations, getRecentActivity, AutomationData, ActivityLogData } from "@/lib/firestore-service"

export default function DashboardOverview() {
  const { appUser } = useAuth()
  const [automations, setAutomations] = React.useState<AutomationData[]>([])
  const [activities, setActivities] = React.useState<ActivityLogData[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!appUser) return
      try {
        const [autoData, activityData] = await Promise.all([
          getAutomations(appUser.uid),
          getRecentActivity(appUser.uid, 5),
        ])
        setAutomations(autoData)
        setActivities(activityData)
      } catch (err) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [appUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  const activeCount = automations.filter(a => a.active).length
  const totalSent = automations.reduce((sum, a) => sum + a.totalSent, 0)
  const dmPercent = appUser ? Math.round((appUser.dmSentThisMonth / appUser.dmQuota) * 100) : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Welcome back, {appUser?.name?.split(" ")[0] || "User"}</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your automations today.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 rounded-full px-6 shadow-lg shadow-primary/20" asChild>
          <Link href="/dashboard/automations/new">
            <Plus className="mr-2 size-4" /> Create Automation
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DMs Sent</CardTitle>
            <MessageSquare className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all automations
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
            <Zap className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              {automations.length} total automations
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quota Used</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dmPercent}%</div>
            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${dmPercent}%` }}></div>
            </div>
            <p className="text-[10px] mt-1 text-muted-foreground">
              {appUser?.dmSentThisMonth || 0} / {appUser?.dmQuota || 1000} DMs
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-1">
              <CardTitle>Active Automations</CardTitle>
              <CardDescription>
                Manage your running keyword triggers.
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline" className="ml-auto">
              <Link href="/dashboard/automations">
                View All
                <ArrowUpRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {automations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No automations yet</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/dashboard/automations/new">Create your first automation</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {automations.slice(0, 5).map((auto) => (
                  <div key={auto.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Zap className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm capitalize">
                          Keyword: "{auto.keywords.join(", ")}"
                        </p>
                        <p className="text-xs text-muted-foreground">{auto.totalSent} DMs sent total</p>
                      </div>
                    </div>
                    <Badge variant={auto.active ? "default" : "secondary"}>
                      {auto.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest comments and responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="size-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="relative">
                      <Avatar className="size-8">
                        <AvatarImage src={`https://picsum.photos/seed/${activity.commentAuthor}/100`} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className={`size-3 ${activity.status === "success" ? "text-emerald-500" : "text-red-500"}`} />
                      </div>
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm">
                        <span className="font-semibold">@{activity.commentAuthor}</span> commented{" "}
                        <span className="text-primary italic">"{activity.keyword}"</span>
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                        <span className={activity.status === "success" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                          {activity.status === "success" ? "DM Sent" : "Failed"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}