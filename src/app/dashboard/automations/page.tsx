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
  Hash,
  Loader2,
  Instagram
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
import { ScanButton } from "./scan-button"
import { useAuth } from "@/lib/auth-provider"
import { getAutomations, toggleAutomation, deleteAutomation, AutomationData } from "@/lib/firestore-service"

export default function AutomationsPage() {
  const { appUser } = useAuth()
  const [automations, setAutomations] = React.useState<AutomationData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    async function loadData() {
      if (!appUser) return
      try {
        const data = await getAutomations(appUser.uid)
        setAutomations(data)
      } catch (err) {
        console.error("Failed to load automations", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [appUser])

  async function handleToggle(id: string, currentActive: boolean) {
    try {
      await toggleAutomation(id, !currentActive)
      setAutomations(prev => prev.map(a => a.id === id ? { ...a, active: !currentActive } : a))
    } catch (err) {
      console.error("Failed to toggle automation", err)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAutomation(id)
      setAutomations(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      console.error("Failed to delete automation", err)
    }
  }

  const filtered = automations.filter(a => 
    a.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-none shadow-sm focus-visible:ring-1"
            />
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
          <Button className="bg-primary rounded-full px-6" asChild>
            <Link href="/dashboard/automations/new">
              <Plus className="mr-2 size-4" /> New Trigger
            </Link>
          </Button>
        </div>
      </div>

      {/* Scan Comments Button */}
      <ScanButton />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.id} className="border-none shadow-md bg-white hover:shadow-lg transition-all group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${item.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Hash className="size-4" />
                </div>
                <CardTitle className="text-lg font-bold capitalize">"{item.keywords.join(", ")}"</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/automations/${item.id}/edit`}>
                      <Edit2 className="mr-2 size-4" /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggle(item.id!, item.active)}>
                    {item.active ? (
                      <><PauseCircle className="mr-2 size-4" /> Pause</>
                    ) : (
                      <><PlayCircle className="mr-2 size-4" /> Resume</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(item.id!)}>
                    <Trash2 className="mr-2 size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instagram Specific Post Preview if applicable */}
              {item.postId && item.postId !== "all" && (
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors">
                  <div className="size-10 relative bg-muted rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    {item.postMediaUrl ? (
                      <img src={item.postMediaUrl} alt="Post thumbnail" className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <Instagram className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-primary tracking-wider">Specific Post</p>
                    <p className="text-xs text-muted-foreground truncate leading-relaxed mt-0.5">
                      {item.postCaption || "No caption"}
                    </p>
                  </div>
                  {item.postPermalink && (
                    <a
                      href={item.postPermalink}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 hover:bg-white rounded-lg text-muted-foreground hover:text-primary transition-colors shrink-0"
                      title="View post on Instagram"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-start gap-3 bg-secondary/30 p-3 rounded-xl">
                <MessageCircle className="size-4 text-muted-foreground mt-1 shrink-0" />
                <p className="text-sm text-foreground line-clamp-3 leading-relaxed italic">
                  "{item.replyMessage}"
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ExternalLink className="size-3" />
                <span className="truncate">{item.targetUrl}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={item.active ? "default" : "secondary"}>
                      {item.active ? "Active" : "Paused"}
                    </Badge>
                    <Badge variant="outline" className={item.postId && item.postId !== "all" ? "bg-purple-50 text-purple-700 border-purple-200/60 text-[10px] px-2 py-0.5 font-semibold" : "bg-blue-50 text-blue-700 border-blue-200/60 text-[10px] px-2 py-0.5 font-semibold"}>
                      {item.postId && item.postId !== "all" ? "Post-Specific" : "Global Trigger"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{item.totalSent} sent</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filtered.length === 0 && (
          <Link href="/dashboard/automations/new" className="h-full col-span-full">
            <div className="h-full min-h-[220px] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 p-6 group hover:border-primary/50 transition-colors bg-white/50">
              <div className="size-12 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Plus className="size-6" />
              </div>
              <div className="text-center">
                <p className="font-headline font-bold">New Automation</p>
                <p className="text-sm text-muted-foreground">Add your first keyword trigger</p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}