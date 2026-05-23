"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Sparkles, 
  Save, 
  ArrowLeft, 
  Info,
  Link as LinkIcon,
  MessageSquare,
  Hash,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { aiDmResponseGenerator } from "@/ai/flows/ai-dm-response-generator"
import { useAuth } from "@/lib/auth-provider"
import { getAutomation, updateAutomation } from "@/lib/firestore-service"

const automationSchema = z.object({
  keywords: z.string().min(1, "At least one keyword is required"),
  replyMessage: z.string().min(10, "Reply message must be at least 10 characters"),
  targetUrl: z.string().url("Please enter a valid URL"),
  campaignGoal: z.string().optional(),
})

type AutomationFormValues = z.infer<typeof automationSchema>

export default function EditAutomationPage() {
  const router = useRouter()
  const params = useParams()
  const automationId = params.id as string
  const { appUser } = useAuth()
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [notFound, setNotFound] = React.useState(false)
  
  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      keywords: "",
      replyMessage: "",
      targetUrl: "",
      campaignGoal: "",
    },
  })

  // Load existing automation data
  React.useEffect(() => {
    async function loadAutomation() {
      if (!automationId) return
      try {
        const auto = await getAutomation(automationId)
        if (!auto) {
          setNotFound(true)
          return
        }
        form.reset({
          keywords: auto.keywords.join(", "),
          replyMessage: auto.replyMessage,
          targetUrl: auto.targetUrl,
          campaignGoal: auto.campaignGoal || "",
        })
      } catch (err) {
        console.error("Failed to load automation:", err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    loadAutomation()
  }, [automationId, form])

  async function generateWithAi() {
    const values = form.getValues()
    const keywordList = values.keywords.split(",").map(k => k.trim()).filter(Boolean)
    
    if (keywordList.length === 0) {
      form.setError("keywords", { message: "Enter keywords before generating AI suggestions" })
      return
    }

    setIsGenerating(true)
    try {
      const response = await aiDmResponseGenerator({
        keywords: keywordList,
        campaignGoal: values.campaignGoal || "General engagement",
        tone: "Friendly and engaging"
      })
      
      if (response.suggestedResponse) {
        form.setValue("replyMessage", response.suggestedResponse)
      }
    } catch (error) {
      console.error("AI Generation failed", error)
    } finally {
      setIsGenerating(false)
    }
  }

  async function onSubmit(data: AutomationFormValues) {
    if (!appUser || !automationId) return
    setIsSaving(true)
    try {
      const keywordList = data.keywords.split(",").map(k => k.trim()).filter(Boolean)
      await updateAutomation(automationId, {
        keywords: keywordList,
        replyMessage: data.replyMessage,
        targetUrl: data.targetUrl,
        campaignGoal: data.campaignGoal,
      })
      setSuccess(true)
      setTimeout(() => router.push("/dashboard/automations"), 1500)
    } catch (error) {
      console.error("Failed to update automation", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto pb-12 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-2xl font-headline font-bold text-muted-foreground">Automation not found</h2>
          <p className="text-muted-foreground mt-2">This automation may have been deleted.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/automations">Back to Automations</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto pb-12 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-headline font-bold">Automation Updated!</h2>
          <p className="text-muted-foreground mt-2">Your changes have been saved.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href="/dashboard/automations">
            <ArrowLeft className="mr-2 size-4" /> Back to list
          </Link>
        </Button>
        <h1 className="text-3xl font-headline font-bold">Edit Automation</h1>
        <p className="text-muted-foreground">Update your keyword trigger and reply message.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-secondary/20">
              <CardTitle className="text-lg">Trigger Settings</CardTitle>
              <CardDescription>Define what triggers your automated response.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="size-4 text-primary" />
                      Keywords
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. link, price, details (comma separated)" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormDescription>
                      The app will trigger when someone comments any of these words.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <LinkIcon className="size-4 text-primary" />
                      Target URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com/product" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormDescription>
                      Where do you want to send your followers?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-primary/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Response Message</CardTitle>
                <CardDescription>What your followers will receive via DM.</CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="bg-white border-primary/20 hover:bg-primary/5 text-primary"
                onClick={generateWithAi}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}
                AI Suggest
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="campaignGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Context (for AI suggestions)</FormLabel>
                    <FormControl>
                      <Input placeholder="What is the goal of this DM?" {...field} className="bg-secondary/20 border-none rounded-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="replyMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MessageSquare className="size-4 text-primary" />
                      DM Content
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your message here... or use AI to generate one!" 
                        className="min-h-[150px] rounded-xl resize-none leading-relaxed" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Pro-tip: Keep it friendly and include emojis to increase conversion.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" className="rounded-full px-8" asChild>
              <Link href="/dashboard/automations">Cancel</Link>
            </Button>
            <Button type="submit" className="bg-primary rounded-full px-8 shadow-lg shadow-primary/20" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
