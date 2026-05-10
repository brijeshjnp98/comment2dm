
"use client"

import * as React from "react"
import { 
  Zap, 
  MoreHorizontal, 
  Plus, 
  Trash2, 
  Edit2, 
  PauseCircle, 
  PlayCircle,
  ExternalLink,
  MessageCircle,
  Hash
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function AutomationsPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Automations</h1>
          <p className="text-muted-foreground">Manage your keyword-triggered direct messages.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Input 
              placeholder="Search triggers..." 
              className="pl-9 bg-white border-none shadow-sm focus-visible:ring-1"
            />
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
          <Button className="bg-primary rounded-full px-6" asChild>
            <Link href="/dashboard/automations/new">
              <Plus className="mr-2 size-4" /> New Trigger
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[
          { keyword: "link", count: 842, active: true, message: "Here is the special link you requested! Enjoy 20% off with code SAVE20.", url: "https://shop.com/sale" },
          { keyword: "price", count: 212, active: true, message: "Our prices start from $29.99 for the basic kit. Check out the full catalog here!", url: "https://shop.com/pricing" },
          { keyword: "details", count: 124, active: false, message: "Check out our detailed guide on how to get started with Comment2DM.", url: "https://shop.com/guide" },
          { keyword: "offer", count: 45, active: true, message: "This limited time offer expires in 24 hours. Grab it now!", url: "https://shop.com/offer" },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-md bg-white hover:shadow-lg transition-all group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${item.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Hash className="size-4" />
                </div>
                <CardTitle className="text-lg font-bold">"{item.keyword}"</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Edit2 className="mr-2 size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {item.active ? (
                      <>
                        <PauseCircle className="mr-2 size-4" /> Pause
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-2 size-4" /> Resume
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 bg-secondary/30 p-3 rounded-xl">
                <MessageCircle className="size-4 text-muted-foreground mt-1 shrink-0" />
                <p className="text-sm text-foreground line-clamp-3 leading-relaxed italic">
                  "{item.message}"
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ExternalLink className="size-3" />
                <span className="truncate">{item.url}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                  <Badge variant={item.active ? "default" : "secondary"}>
                    {item.active ? "Active" : "Paused"}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">{item.count} sent</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs h-7 hover:bg-primary/5 hover:text-primary">
                  View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Empty State / Add New Card */}
        <Link href="/dashboard/automations/new" className="h-full">
          <div className="h-full min-h-[220px] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 p-6 group hover:border-primary/50 transition-colors bg-white/50">
            <div className="size-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Plus className="size-6" />
            </div>
            <div className="text-center">
              <p className="font-headline font-bold">New Automation</p>
              <p className="text-sm text-muted-foreground">Add another keyword trigger</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
