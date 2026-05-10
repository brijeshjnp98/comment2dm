
import Link from "next/link"
import { Zap, Shield, Sparkles, MessageSquare, Instagram, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
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
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold">Starter</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-headline font-bold">$5</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-slate-600"><MessageSquare className="size-4 text-primary" /> 1,000 DMs per month</li>
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Zap className="size-4 text-primary" /> 3 Active Automations</li>
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Shield className="size-4 text-primary" /> Basic Analytics</li>
                </ul>
                <Button className="w-full rounded-full py-6" variant="outline" asChild><Link href="/dashboard">Get Started</Link></Button>
              </div>
              
              <div className="bg-primary text-white p-8 rounded-3xl shadow-2xl shadow-primary/20 flex flex-col scale-105 z-10">
                <div className="absolute top-4 right-8 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Popular</div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold">Growth</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-headline font-bold">$10</span>
                    <span className="text-primary-foreground/80">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm"><MessageSquare className="size-4" /> 2,500 DMs per month</li>
                  <li className="flex items-center gap-2 text-sm"><Zap className="size-4" /> Unlimited Automations</li>
                  <li className="flex items-center gap-2 text-sm"><Sparkles className="size-4" /> AI Suggestion Tool</li>
                  <li className="flex items-center gap-2 text-sm"><Shield className="size-4" /> Advanced Analytics</li>
                </ul>
                <Button className="w-full rounded-full py-6 bg-white text-primary hover:bg-white/90" asChild><Link href="/dashboard">Go Pro</Link></Button>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold">Unlimited</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-headline font-bold">$25</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-2 text-sm text-slate-600"><MessageSquare className="size-4 text-primary" /> Unlimited DMs</li>
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Zap className="size-4 text-primary" /> Priority Delivery</li>
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Sparkles className="size-4 text-primary" /> API Access</li>
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Shield className="size-4 text-primary" /> VIP Support</li>
                </ul>
                <Button className="w-full rounded-full py-6" variant="outline" asChild><Link href="/dashboard">Contact Us</Link></Button>
              </div>
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
          <p className="text-sm text-slate-500">© 2024 Comment2DM. All rights reserved.</p>
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
