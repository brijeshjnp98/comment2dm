"use client"

import * as React from "react"
import { 
  CreditCard, 
  CheckCircle2, 
  Sparkles,
  Zap,
  MessageSquare,
  Shield,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-provider"
import { collection, getDocs, setDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function BillingPage() {
  const { appUser, refreshAppUser } = useAuth()
  const [plansList, setPlansList] = React.useState<any[]>([])
  const [plansLoading, setPlansLoading] = React.useState(true)
  const [upgradingPlan, setUpgradingPlan] = React.useState<string | null>(null)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    async function loadPlans() {
      try {
        const plansSnap = await getDocs(collection(db, "plans"))
        
        if (plansSnap.empty) {
          // Auto-seed default subscription plans in Firestore
          const defaultPlans = [
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
          setPlansList(defaultPlans)
        } else {
          const list = plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          // Sort plans in order: Free -> Basic -> Pro
          const order: any = { free: 0, basic: 1, pro: 2 }
          list.sort((a: any, b: any) => (order[a.key] ?? 99) - (order[b.key] ?? 99))
          setPlansList(list)
        }
      } catch (err: any) {
        console.warn("Failed to load plans from Firestore, falling back to static defaults", err)
        const fallbackPlans = [
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
        setPlansList(fallbackPlans)
      } finally {
        setPlansLoading(false)
      }
    }

    loadPlans()
  }, [])

  async function handleUpgrade(planKey: string, quota: number) {
    if (!appUser) return
    setUpgradingPlan(planKey)
    setError("")

    try {
      // Update plan and quota dynamically in Firestore
      await updateDoc(doc(db, "users", appUser.uid), {
        plan: planKey,
        dmQuota: quota,
      })
      await refreshAppUser()
    } catch (err: any) {
      console.error("Plan upgrade error:", err)
      setError("Failed to process upgrade. Please try again.")
    } finally {
      setUpgradingPlan(null)
    }
  }

  if (!appUser) return null

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-headline font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription plan and quotas dynamically.</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 text-red-800">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-600" />
            <span className="text-sm">{error}</span>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-primary/5 rounded-xl border border-primary/20 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Sparkles className="size-6 text-primary animate-pulse" />
              </div>
              <div>
                <p className="font-headline font-bold text-xl capitalize">{appUser.plan} Plan</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {appUser.dmSentThisMonth.toLocaleString()} / {appUser.dmQuota.toLocaleString()} DMs used this month
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto">
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 capitalize px-3 py-1 text-xs">
                Active & Enforced
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-headline font-bold mb-2">Available Plans</h2>
        <p className="text-muted-foreground mb-6">Choose the perfect scaling option. Upgrades apply instantly.</p>
        
        {plansLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plansList.map((plan) => {
              const isCurrentPlan = plan.key === appUser.plan
              const isUpgradingThis = upgradingPlan === plan.key

              return (
                <Card 
                  key={plan.name} 
                  className={`border-none shadow-md flex flex-col relative transition-all duration-300 hover:shadow-lg ${
                    plan.popular ? 'scale-105 z-10 ring-2 ring-primary shadow-xl shadow-primary/20 bg-white' : 'bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="pt-6">
                    <CardTitle className="text-xl flex items-center justify-between">
                      <span>{plan.name}</span>
                      {isCurrentPlan && (
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                          Current
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-headline font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-xs">{plan.monthly}</span>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      Up to {plan.quota.toLocaleString()} messages/mo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-2">
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features?.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full rounded-full ${
                        isCurrentPlan 
                          ? 'bg-muted text-muted-foreground cursor-default hover:bg-muted' 
                          : 'bg-primary hover:bg-primary/95 text-white shadow-md'
                      }`}
                      disabled={isCurrentPlan || upgradingPlan !== null}
                      onClick={() => !isCurrentPlan && handleUpgrade(plan.key, plan.quota)}
                    >
                      {isUpgradingThis ? (
                        <><Loader2 className="mr-2 size-4 animate-spin" /> Processing...</>
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}