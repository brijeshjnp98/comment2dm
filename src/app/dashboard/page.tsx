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
  Clock
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function DashboardOverview() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Welcome back, John</h1>
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
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
            <Zap className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Running across 3 accounts
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Activity className="size-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium">+2.1%</span> from last week
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quota Used</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45%</div>
            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '45%' }}></div>
            </div>
            <p className="text-[10px] mt-1 text-muted-foreground">
              450 / 1000 DMs
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
            <div className="space-y-4">
              {[
                { keyword: "link", sent: 432, status: "Active" },
                { keyword: "price", sent: 212, status: "Active" },
                { keyword: "details", sent: 156, status: "Inactive" },
              ].map((auto, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Zap className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm capitalize">Keyword: "{auto.keyword}"</p>
                      <p className="text-xs text-muted-foreground">{auto.sent} DMs sent total</p>
                    </div>
                  </div>
                  <Badge variant={auto.status === "Active" ? "default" : "secondary"}>
                    {auto.status}
                  </Badge>
                </div>
              ))}
            </div>
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
            <div className="space-y-6">
              {[
                { author: "mikesmith", time: "2m ago", keyword: "link" },
                { author: "sarah_j", time: "15m ago", keyword: "price" },
                { author: "alex_travels", time: "1h ago", keyword: "offer" },
                { author: "dev_guy", time: "3h ago", keyword: "link" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative">
                    <Avatar className="size-8">
                      <AvatarImage src={`https://picsum.photos/seed/${activity.author}/100`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <CheckCircle2 className="size-3 text-emerald-500" />
                    </div>
                  </div>
                  <div className="grid gap-1">
                    <p className="text-sm">
                      <span className="font-semibold">@{activity.author}</span> commented <span className="text-primary italic">"{activity.keyword}"</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      <span>{activity.time}</span>
                      <span className="text-emerald-600 font-medium">DM Sent</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
