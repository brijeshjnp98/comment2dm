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
  CheckCircle2,
  Instagram,
  Search,
  RefreshCw,
  Check,
  Layers,
  ExternalLink
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
import { getInstagramToken, fetchRecentMedia } from "@/lib/instagram-service"

const automationSchema = z.object({
  keywords: z.string().min(1, "At least one keyword is required"),
  replyMessage: z.string().min(10, "Reply message must be at least 10 characters"),
  targetUrl: z.string().url("Please enter a valid URL"),
  campaignGoal: z.string().optional(),
  postId: z.string().min(1, "Please select an Instagram post or choose All Posts"),
  postMediaUrl: z.string().optional(),
  postCaption: z.string().optional(),
  postPermalink: z.string().optional(),
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

  // Instagram posts states
  const [posts, setPosts] = React.useState<any[]>([])
  const [loadingPosts, setLoadingPosts] = React.useState(false)
  const [postFetchError, setPostFetchError] = React.useState("")
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      keywords: "",
      replyMessage: "",
      targetUrl: "",
      campaignGoal: "",
      postId: "all",
      postMediaUrl: "",
      postCaption: "",
      postPermalink: "",
    },
  })

  const fetchInstagramPosts = React.useCallback(async () => {
    if (!appUser?.instagramConnected) return
    setLoadingPosts(true)
    setPostFetchError("")
    try {
      const token = await getInstagramToken(appUser.uid)
      const { doc, getDoc } = await import("firebase/firestore")
      const { db } = await import("@/lib/firebase")
      const tokenDoc = await getDoc(doc(db, "instagram_tokens", appUser.uid))
      const businessId = tokenDoc.exists() ? tokenDoc.data().businessId : null
      
      if (!token || !businessId) {
        setPostFetchError("Instagram credentials not found. Please reconnect Instagram in Settings.")
        return
      }

      const media = await fetchRecentMedia(token, businessId, 15)
      setPosts(media)
    } catch (err: any) {
      console.error("Error loading Instagram posts:", err)
      setPostFetchError(err.message || "Failed to load posts from Instagram.")
    } finally {
      setLoadingPosts(false)
    }
  }, [appUser])

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
          postId: auto.postId || "all",
          postMediaUrl: auto.postMediaUrl || "",
          postCaption: auto.postCaption || "",
          postPermalink: auto.postPermalink || "",
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

  React.useEffect(() => {
    if (appUser?.instagramConnected) {
      fetchInstagramPosts()
    }
  }, [appUser, fetchInstagramPosts])

  const filteredPosts = posts.filter(post => 
    (post.caption || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        postId: data.postId,
        postMediaUrl: data.postMediaUrl,
        postCaption: data.postCaption,
        postPermalink: data.postPermalink,
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
          {/* Target Post Selector Card */}
          <Card className="border-none shadow-md overflow-hidden bg-white">
            <CardHeader className="bg-secondary/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Instagram className="size-5 text-[#E1306C]" />
                Select Instagram Post
              </CardTitle>
              <CardDescription>Choose if this automation applies to all posts or a specific post.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("postId", "all")
                    form.setValue("postMediaUrl", "")
                    form.setValue("postCaption", "")
                    form.setValue("postPermalink", "")
                  }}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 text-center transition-all ${
                    form.watch("postId") === "all"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-secondary/20 text-muted-foreground"
                  }`}
                >
                  <Layers className="size-6 mb-2" />
                  <span className="font-semibold text-sm">All Posts</span>
                  <span className="text-xs opacity-80 mt-1">Global keyword trigger</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (appUser?.instagramConnected) {
                      form.setValue("postId", "")
                    }
                  }}
                  disabled={!appUser?.instagramConnected}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 text-center transition-all ${
                    !appUser?.instagramConnected
                      ? "opacity-50 cursor-not-allowed border-dashed border-border bg-secondary/10"
                      : form.watch("postId") !== "all"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-secondary/20 text-muted-foreground"
                  }`}
                >
                  <Instagram className="size-6 mb-2" />
                  <span className="font-semibold text-sm">Specific Post</span>
                  <span className="text-xs opacity-80 mt-1">Target a single post/reel</span>
                </button>
              </div>

              {!appUser?.instagramConnected && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
                  <Info className="size-5 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Instagram Connection Required</p>
                    <p className="text-xs text-amber-700 mt-1">
                      To automate specific posts, you must connect your Instagram professional account in settings. 
                      You can still create a <strong>Global Trigger</strong> that applies to all posts.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 bg-white border-amber-200 text-amber-800 hover:bg-amber-100" asChild>
                      <Link href="/dashboard/settings">Connect Instagram</Link>
                    </Button>
                  </div>
                </div>
              )}

              {appUser?.instagramConnected && form.watch("postId") !== "all" && (
                <div className="space-y-4 pt-2">
                  {form.watch("postId") ? (
                    <div className="flex gap-4 p-4 rounded-xl border border-border bg-secondary/10 items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-16 relative bg-muted rounded-lg overflow-hidden shrink-0 border border-border/50">
                          {form.watch("postMediaUrl") ? (
                            <img src={form.watch("postMediaUrl")} alt="Selected post thumbnail" className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary">
                              <Instagram className="size-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs uppercase font-bold text-primary tracking-wider">Selected Post</p>
                          <p className="text-sm font-semibold line-clamp-2 text-foreground mt-0.5">
                            {form.watch("postCaption") || "No caption"}
                          </p>
                          {form.watch("postPermalink") && (
                            <a
                              href={form.watch("postPermalink")}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
                            >
                              View on Instagram <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          form.setValue("postId", "")
                          form.setValue("postMediaUrl", "")
                          form.setValue("postCaption", "")
                          form.setValue("postPermalink", "")
                        }}
                      >
                        Change Post
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            placeholder="Search posts by caption..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 rounded-xl bg-white border border-border focus-visible:ring-primary"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={fetchInstagramPosts}
                          disabled={loadingPosts}
                          className="rounded-xl shrink-0"
                        >
                          <RefreshCw className={`size-4 ${loadingPosts ? "animate-spin" : ""}`} />
                        </Button>
                      </div>

                      {postFetchError && (
                        <div className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                          <Info className="size-4 shrink-0" />
                          <span>{postFetchError}</span>
                        </div>
                      )}

                      {loadingPosts ? (
                        <div className="grid grid-cols-3 gap-3">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-secondary/50 rounded-xl animate-pulse" />
                          ))}
                        </div>
                      ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground bg-secondary/10 rounded-xl">
                          <Instagram className="size-8 mx-auto opacity-30 mb-2" />
                          <p className="text-sm">No Instagram posts found</p>
                          {searchTerm && <p className="text-xs mt-1">Try a different search query</p>}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
                          {filteredPosts.map((post) => {
                            const isSelected = form.watch("postId") === post.id
                            return (
                              <div
                                key={post.id}
                                onClick={() => {
                                  form.setValue("postId", post.id)
                                  form.setValue("postMediaUrl", post.media_url || "")
                                  form.setValue("postCaption", post.caption || "")
                                  form.setValue("postPermalink", post.permalink || "")
                                }}
                                className={`aspect-square relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all group hover:scale-[1.02] ${
                                  isSelected ? "border-primary shadow-md" : "border-transparent"
                                }`}
                              >
                                {post.media_url ? (
                                  <img
                                    src={post.media_url}
                                    alt={post.caption || "Instagram Media"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                                    <Instagram className="size-8 text-muted-foreground/50" />
                                  </div>
                                )}

                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] text-white px-1.5 py-0.5 rounded font-semibold">
                                  {post.media_type === "VIDEO" ? "VIDEO" : post.media_type === "CAROUSEL_ALBUM" ? "CAROUSEL" : "IMAGE"}
                                </div>

                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-8">
                                  <p className="text-[11px] text-white line-clamp-2 leading-tight">
                                    {post.caption || "No caption"}
                                  </p>
                                </div>

                                {isSelected && (
                                  <div className="absolute inset-0 bg-primary/25 flex items-center justify-center">
                                    <div className="bg-primary text-white rounded-full p-1.5 shadow-lg">
                                      <Check className="size-4 stroke-[3]" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                  {form.formState.errors.postId && (
                    <p className="text-xs font-semibold text-destructive mt-1">
                      {form.formState.errors.postId.message}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden bg-white">
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
