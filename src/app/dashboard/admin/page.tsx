"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  Zap, 
  BarChart3, 
  Activity, 
  CreditCard,
  Loader2,
  Shield,
  UserX,
  CheckCircle2,
  XCircle,
  MessageSquare,
  TrendingUp,
  Sliders,
  Save,
  Edit,
  Sparkles,
  RefreshCw,
  Plus
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-provider"
import { getAllUsers, getAllAutomations, AutomationData } from "@/lib/firestore-service"
import { doc, updateDoc, getDocs, collection, query, where, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserData {
  uid: string
  email: string
  name: string
  role: "user" | "admin"
  instagramConnected: boolean
  instagramHandle?: string
  plan: string
  dmSentThisMonth: number
  dmQuota: number
  createdAt: any
}

interface PlanData {
  id: string
  name: string
  price: string
  monthly: string
  features: string[]
  quota: number
  key: "free" | "basic" | "pro"
  popular?: boolean
}

export default function AdminPage() {
  const { appUser } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = React.useState<UserData[]>([])
  const [automations, setAutomations] = React.useState<AutomationData[]>([])
  const [plans, setPlans] = React.useState<PlanData[]>([])
  
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<"users" | "automations" | "plans">("users")
  
  // Plan Editor State
  const [editingPlanKey, setEditingPlanKey] = React.useState<string | null>(null)
  const [editName, setEditName] = React.useState("")
  const [editPrice, setEditPrice] = React.useState("")
  const [editQuota, setEditQuota] = React.useState(0)
  const [editFeatures, setEditFeatures] = React.useState("")
  const [savingPlan, setSavingPlan] = React.useState(false)

  React.useEffect(() => {
    if (appUser && appUser.role !== "admin") {
      router.push("/dashboard")
      return
    }
    loadData()
  }, [appUser, router])

  async function loadData() {
    try {
      const [usersData, automationsData, plansSnap] = await Promise.all([
        getAllUsers(),
        getAllAutomations(),
        getDocs(collection(db, "plans"))
      ])
      
      setUsers(usersData as UserData[])
      setAutomations(automationsData)
      
      let plansList: PlanData[] = []
      if (plansSnap.empty) {
        // Fallback or seed default plans if empty
        const defaultPlans: PlanData[] = [
          {
            id: "free",
            name: "Free",
            price: "$0",
            monthly: "/mo",
            features: ["1,000 DMs per month", "3 Active Automations", "Basic Analytics"],
            quota: 1000,
            key: "free",
          },
          {
            id: "basic",
            name: "Basic",
            price: "$10",
            monthly: "/mo",
            features: ["2,500 DMs per month", "Unlimited Automations", "AI Suggestion Tool", "Advanced Analytics"],
            quota: 2500,
            popular: true,
            key: "basic",
          },
          {
            id: "pro",
            name: "Pro",
            price: "$25",
            monthly: "/mo",
            features: ["10,000 DMs per month", "Priority Delivery", "API Access", "VIP Support"],
            quota: 10000,
            key: "pro",
          }
        ]
        
        for (const p of defaultPlans) {
          await setDoc(doc(db, "plans", p.id), p)
        }
        plansList = defaultPlans
      } else {
        plansList = plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
      }
      
      const order: any = { free: 0, basic: 1, pro: 2 }
      plansList.sort((a, b) => (order[a.key] ?? 99) - (order[b.key] ?? 99))
      setPlans(plansList)

    } catch (err) {
      console.error("Failed to load admin data", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleRole(uid: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin"
    await updateDoc(doc(db, "users", uid), { role: newRole })
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole as "user" | "admin" } : u))
  }

  // Edit Plan triggers
  function startEditPlan(plan: PlanData) {
    setEditingPlanKey(plan.key)
    setEditName(plan.name)
    setEditPrice(plan.price)
    setEditQuota(plan.quota)
    setEditFeatures(plan.features?.join(", ") || "")
  }

  async function handleSavePlan(planKey: string) {
    setSavingPlan(true)
    try {
      const planRef = doc(db, "plans", planKey)
      const featuresArray = editFeatures
        .split(",")
        .map(f => f.trim())
        .filter(Boolean)
      
      const updatedData = {
        name: editName,
        price: editPrice,
        quota: Number(editQuota),
        features: featuresArray,
      }
      
      await updateDoc(planRef, updatedData)
      
      // Update current plans state
      setPlans(prev => prev.map(p => p.key === planKey ? { ...p, ...updatedData } : p))
      setEditingPlanKey(null)
      
      // Propagate quota updates to all users registered to this plan
      const qUsers = query(collection(db, "users"), where("plan", "==", planKey))
      const usersSnap = await getDocs(qUsers)
      
      const batchUpdates = usersSnap.docs.map(uDoc => 
        updateDoc(doc(db, "users", uDoc.id), {
          dmQuota: Number(editQuota)
        })
      )
      await Promise.all(batchUpdates)
      
      // Reload state to show updated quotas in Users table
      await loadData()
    } catch (err) {
      console.error("Failed to update plan configuration", err)
    } finally {
      setSavingPlan(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  const totalDmsSent = automations.reduce((sum, a) => sum + a.totalSent, 0)
  const activeAutomations = automations.filter(a => a.active).length
  const totalUsers = users.length
  const instagramConnectedUsers = users.filter(u => u.instagramConnected).length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
            <Shield className="size-8 text-primary animate-pulse" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">System settings, user accounts, and billing tiers.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {instagramConnectedUsers} connected to Instagram
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
            <Zap className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAutomations}</div>
            <p className="text-xs text-muted-foreground">
              {automations.length} total automations
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DMs Sent</CardTitle>
            <MessageSquare className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDmsSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Role</CardTitle>
            <Shield className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Admin</div>
            <p className="text-xs text-muted-foreground">Full override privileges active</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-2 border-b border-border pb-px">
        <Button 
          variant={activeTab === "users" ? "default" : "ghost"}
          onClick={() => setActiveTab("users")}
          className="rounded-t-lg rounded-b-none px-6"
        >
          <Users className="size-4 mr-2" /> Users
        </Button>
        <Button 
          variant={activeTab === "automations" ? "default" : "ghost"}
          onClick={() => setActiveTab("automations")}
          className="rounded-t-lg rounded-b-none px-6"
        >
          <Zap className="size-4 mr-2" /> Automations
        </Button>
        <Button 
          variant={activeTab === "plans" ? "default" : "ghost"}
          onClick={() => setActiveTab("plans")}
          className="rounded-t-lg rounded-b-none px-6"
        >
          <Sliders className="size-4 mr-2" /> Subscription Plans
        </Button>
      </div>

      {/* TABS CONTENT */}

      {activeTab === "users" && (
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              All Users ({users.length})
            </CardTitle>
            <CardDescription>Manage user plans, quotas, and security roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Instagram</TableHead>
                  <TableHead>DMs Used / Quota</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.uid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            {u.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{u.plan}</Badge>
                    </TableCell>
                    <TableCell>
                      {u.instagramConnected ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-sm">
                          <CheckCircle2 className="size-3" />
                          <span>@{u.instagramHandle}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <XCircle className="size-3" />
                          <span>Not connected</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {u.dmSentThisMonth.toLocaleString()} / {u.dmQuota.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleRole(u.uid, u.role)}
                      >
                        Toggle Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "automations" && (
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-5 text-amber-500" />
              All Automations ({automations.length})
            </CardTitle>
            <CardDescription>Overview of active keyword DMs across all user accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keywords</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>DMs Sent</TableHead>
                  <TableHead>Target URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium capitalize">
                      {a.keywords.join(", ")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {a.userId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.active ? "default" : "secondary"}>
                        {a.active ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{a.totalSent}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {a.targetUrl}
                    </TableCell>
                  </TableRow>
                ))}
                {automations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No automations created yet
                  </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "plans" && (
        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="size-5 text-primary" />
                Subscription Plans Manager
              </CardTitle>
              <CardDescription>
                Configure standard pricing tiers and quotas. Changes update Billing dashboards instantly and propagate to all active users on the matching tier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((p) => {
                  const isEditing = editingPlanKey === p.key

                  return (
                    <Card key={p.key} className="border bg-slate-50/50 flex flex-col justify-between">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{p.name}</CardTitle>
                          <Badge className="bg-primary/10 text-primary capitalize font-bold text-[10px]">
                            {p.key}
                          </Badge>
                        </div>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-3xl font-bold">{p.price}</span>
                          <span className="text-muted-foreground text-xs">{p.monthly}</span>
                        </div>
                        <CardDescription className="text-xs font-mono mt-1">
                          Limit: {p.quota.toLocaleString()} messages/mo
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between pt-2">
                        <div className="space-y-3 mb-6">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features list:</p>
                          <ul className="space-y-2">
                            {p.features?.map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full rounded-xl bg-white hover:bg-slate-50"
                          onClick={() => startEditPlan(p)}
                          disabled={editingPlanKey !== null}
                        >
                          <Edit className="size-3.5 mr-2" /> Edit Plan properties
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {editingPlanKey && (
            <Card className="border-primary border shadow-lg ring-1 ring-primary/20 animate-in slide-in-from-bottom duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Edit Plan parameters: <span className="capitalize text-primary">{editingPlanKey}</span></span>
                  <Button variant="ghost" size="sm" onClick={() => setEditingPlanKey(null)}>Cancel</Button>
                </CardTitle>
                <CardDescription>
                  Updating features, pricing, or quotas instantly updates user dashboard cards and retroactively changes quotas for existing subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Display Name</label>
                    <Input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Pricing Label (e.g. $15)</label>
                    <Input 
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Monthly Message Quota (Limit)</label>
                    <Input 
                      type="number"
                      value={editQuota}
                      onChange={(e) => setEditQuota(Number(e.target.value))}
                      className="rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Plan Features (comma-separated list)</label>
                  <Textarea
                    placeholder="e.g. 5,000 DMs per month, Unlimited Automations, Priority Support"
                    value={editFeatures}
                    onChange={(e) => setEditFeatures(e.target.value)}
                    className="rounded-xl min-h-[80px]"
                  />
                  <p className="text-[10px] text-muted-foreground">Separate each plan feature bullet point with a comma.</p>
                </div>

                <div className="flex items-center gap-2 justify-end pt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setEditingPlanKey(null)}
                    disabled={savingPlan}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => handleSavePlan(editingPlanKey)}
                    disabled={savingPlan}
                    className="rounded-xl bg-primary text-white"
                  >
                    {savingPlan ? (
                      <><Loader2 className="mr-2 size-4 animate-spin" /> Propagating & Saving...</>
                    ) : (
                      <><Save className="mr-2 size-4" /> Save Configuration</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}