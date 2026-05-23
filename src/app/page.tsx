import Link from "next/link"
import { Zap, Shield, Sparkles, MessageSquare, Instagram, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAdminDb } from "@/lib/firebase-admin"

async function getPlans() {
  try {
    const dbAdmin = getAdminDb()
    const plansSnap = await dbAdmin.collection("plans").get()
    
    if (!plansSnap.empty) {
      const list = plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
      const order: any = { free: 0, basic: 1, pro: 2 }
      list.sort((a: any, b: any) => (order[a.key] ?? 99) - (order[b.key] ?? 99))
      return list
    }
  } catch (e) {
    console.error("Failed to fetch plans on landing page, falling back to static defaults", e)
  }
  
  // Fallback defaults in case admin SDK isn't initialized or running locally
  return [
    {
      name: "Free",
      price: "$0",
      monthly: "/mo",
      features: ["1,000 DMs per month", "3 Active Automations", "Basic Analytics"],
      quota: 1000,
      key: "free",
    },
    {
      name: "Basic",
      price: "$10",
      monthly: "/mo",
      features: ["2,500 DMs per month", "Unlimited Automations", "AI Suggestion Tool", "Advanced Analytics"],
      quota: 2500,
      popular: true,
      key: "basic",
    },
    {
      name: "Pro",
      price: "$25",
      monthly: "/mo",
      features: ["10,000 DMs per month", "Priority Delivery", "API Access", "VIP Support"],
      quota: 10000,
      key: "pro",
    }
  ]
}

export default async function LandingPage() {
  const plans = await getPlans()

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F1F8]">
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between sticky top-0 bg-[#F2F1F8]/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <Zap className="size-6 fill-current" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight">Comment2DM</span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center font-medium text-sm">
          <Link className="hover:text-primary transition-colors" href="#features">Features</Link>
          <Link className="hover:text-primary transition-colors" href="#pricing">Pricing</Link>
          <Link className="hover:text-primary transition-colors" href="/dashboard">Dashboard</Link>
          <Button className="bg-primary hover:bg-primary/90 rounded-full px-6 shadow-md" asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="py-20 lg:py-32 px-6">
          <div className="container mx-auto max-w-5xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 animate-bounce">
              <Sparkles className="size-4" />
              <span>AI-Powered Instagram Automation</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-headline font-bold tracking-tight text-slate-900 leading-[1.1]">
              Convert Every Comment <br className="hidden md:block" />
              Into a <span className="text-primary underline decoration-primary/20 underline-offset-8">Customer.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Automatically send direct messages with links and info when followers comment on your Instagram posts. Never miss a lead again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="h-14 px-10 rounded-full bg-primary shadow-xl shadow-primary/20 text-lg group" asChild>
                <Link href="/dashboard">
                  Start Free Trial <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-full border-2 bg-transparent text-lg" asChild>
                <Link href="#features">How it works</Link>
              </Button>
            </div>
            
            <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
              <div className="flex items-center justify-center gap-2 font-headline font-bold text-xl italic"><Instagram className="size-6" /> INSTA_PRO</div>
              <div className="flex items-center justify-center gap-2 font-headline font-bold text-xl italic">STRIPE</div>
              <div className="flex items-center justify-center gap-2 font-headline font-bold text-xl italic">META_DEV</div>
              <div className="flex items-center justify-center gap-2 font-headline font-bold text-xl italic text-primary">FIREBASE</div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-white rounded-[3rem] mx-4 lg:mx-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="container mx-auto max-w-6xl px-6">
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-5xl font-headline font-bold mb-4">Everything you need to scale</h2>
              <p className="text-slate-500">Built for influencers, brands, and agencies.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-4 group">
                <div className="size-14 rounded-2xl bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C] group-hover:scale-110 transition-transform">
                  <Instagram className="size-7" />
                </div>
                <h3 className="text-xl font-headline font-bold">Instagram Native</h3>
                <p className="text-slate-600 leading-relaxed">Direct integration with the Instagram Graph API for lightning fast and secure response delivery.</p>
              </div>
              <div className="space-y-4 group">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Sparkles className="size-7" />
                </div>
                <h3 className="text-xl font-headline font-bold">AI DM Generator</h3>
                <p className="text-slate-600 leading-relaxed">Let our AI write the perfect, non-spammy responses for you. Just enter your goal and keywords.</p>
              </div>
              <div className="space-y-4 group">
                <div className="size-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Shield className="size-7" />
                </div>
                <h3 className="text-xl font-headline font-bold">Safe & Compliant</h3>
                <p className="text-slate-600 leading-relaxed">Built with Meta Developer best practices to ensure your account remains safe and engagement stays high.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-32 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-headline font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-slate-500">Choose the plan that fits your growth.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan: any) => {
                return (
                  <div 
                    key={plan.name} 
                    className={`p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col relative transition-all duration-300 hover:shadow-lg ${
                      plan.popular 
                        ? 'bg-primary text-white scale-105 z-10 shadow-2xl shadow-primary/20' 
                        : 'bg-white text-slate-900'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-primary px-4 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow">
                        Most Popular
                      </div>
                    )}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold">{plan.name}</h3>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-4xl font-headline font-bold">{plan.price}</span>
                        <span className={plan.popular ? 'text-primary-foreground/85 text-xs' : 'text-slate-500 text-xs'}>
                          {plan.monthly}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-1 ${plan.popular ? 'text-primary-foreground/75' : 'text-slate-400'}`}>
                        Up to {plan.quota.toLocaleString()} messages/mo
                      </p>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features?.map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <MessageSquare className={`size-4 shrink-0 ${plan.popular ? 'text-white' : 'text-primary'}`} /> 
                          <span className={plan.popular ? 'text-white/90' : 'text-slate-600'}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full rounded-full py-6 font-semibold shadow-md ${
                        plan.popular 
                          ? 'bg-white text-primary hover:bg-white/95' 
                          : 'bg-primary text-white hover:bg-primary/95'
                      }`} 
                      asChild
                    >
                      <Link href="/dashboard">
                        {plan.key === "free" ? "Get Started" : `Go ${plan.name}`}
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-12 px-6 lg:px-12 border-t border-slate-200">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="size-6 text-primary" />
            <span className="text-xl font-headline font-bold">Comment2DM</span>
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Comment2DM. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link className="hover:text-primary transition-colors" href="#">Privacy</Link>
            <Link className="hover:text-primary transition-colors" href="#">Terms</Link>
            <Link className="hover:text-primary transition-colors" href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
