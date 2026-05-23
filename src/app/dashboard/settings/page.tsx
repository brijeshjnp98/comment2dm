"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  User, 
  Mail, 
  Instagram, 
  Link2, 
  Unlink, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Save,
  ChevronDown,
  ChevronUp,
  Copy,
  ClipboardList,
  RefreshCw,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-provider"
import { updateDoc, doc, setDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, appUser, refreshAppUser } = useAuth()
  const [saving, setSaving] = React.useState(false)
  const [connecting, setConnecting] = React.useState(false)
  const [showGuide, setShowGuide] = React.useState(false)
  const [showManualInput, setShowManualInput] = React.useState(false)
  const [manualToken, setManualToken] = React.useState("")
  const [manualHandle, setManualHandle] = React.useState("")
  const [manualPageId, setManualPageId] = React.useState("")
  const [manualIgBusinessId, setManualIgBusinessId] = React.useState("")
  const [manualError, setManualError] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [connectionError, setConnectionError] = React.useState("")
  const [connectionSuccess, setConnectionSuccess] = React.useState(false)

  // Handle Instagram OAuth callback
  React.useEffect(() => {
    async function handleInstagramCallback() {
      const status = searchParams.get("instagram")
      const username = searchParams.get("ig_username")
      const businessId = searchParams.get("ig_business_id")
      const pageId = searchParams.get("ig_page_id")
      const profilePic = searchParams.get("ig_profile_pic")
      const igError = searchParams.get("ig_error")

      if (status === "error") {
        setConnectionError(igError || "Instagram connection failed. Please try again.")
        router.replace("/dashboard/settings")
        return
      }

      if (status === "success" && username && appUser) {
        setConnecting(true)
        try {
          // Fetch the token from the secure cookie endpoint
          const tokenRes = await fetch("/api/auth/instagram/token")
          const tokenData = await tokenRes.json()

          if (!tokenRes.ok || !tokenData.accessToken) {
            setConnectionError("Could not retrieve access token. Please try connecting again.")
            router.replace("/dashboard/settings")
            return
          }

          // Save to Firestore
          await updateDoc(doc(db, "users", appUser.uid), {
            instagramConnected: true,
            instagramHandle: username,
            instagramProfilePic: profilePic || null,
          })
          await setDoc(doc(db, "instagram_tokens", appUser.uid), {
            accessToken: tokenData.accessToken,
            pageToken: tokenData.pageToken || "",
            businessId: businessId || "",
            fbPageId: pageId || "",
            connectedAt: new Date(),
          })
          await refreshAppUser()
          setConnectionSuccess(true)
          router.replace("/dashboard/settings")
        } catch (err) {
          console.error("Failed to save Instagram connection", err)
          setConnectionError("Failed to save connection. Please try again.")
          router.replace("/dashboard/settings")
        } finally {
          setConnecting(false)
        }
      }
    }
    handleInstagramCallback()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, appUser])

  async function handleDisconnectInstagram() {
    if (!appUser) return
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", appUser.uid), {
        instagramConnected: false,
        instagramHandle: null,
        instagramProfilePic: null,
      })
      // Also delete the stored token
      try {
        await deleteDoc(doc(db, "instagram_tokens", appUser.uid))
      } catch (e) {
        console.log("No token doc to delete")
      }
      await refreshAppUser()
    } catch (err) {
      console.error("Failed to disconnect Instagram", err)
    } finally {
      setSaving(false)
    }
  }

  async function handleConnectInstagram() {
    setConnectionError("")
    setConnectionSuccess(false)
    window.location.href = "/api/auth/instagram/connect"
  }

  async function handleManualConnect() {
    setManualError("")
    
    if (!manualToken.trim()) {
      setManualError("Please enter an access token")
      return
    }
    if (!manualHandle.trim()) {
      setManualError("Please enter your Instagram handle/username")
      return
    }

    if (!appUser) return
    setSaving(true)

    try {
      let igBusinessId = manualIgBusinessId.trim()
      let fbPageId = manualPageId.trim()

      // First, validate the token by making a test API call
      try {
        const meRes = await fetch(
          `https://graph.facebook.com/v22.0/me?access_token=${manualToken.trim()}`
        )
        const meData = await meRes.json()
        if (meData.error) {
          setManualError(`Invalid token: ${meData.error.message}`)
          setSaving(false)
          return
        }
      } catch (e) {
        // Network error, proceed anyway
      }

      // If page ID provided, use it directly
      if (fbPageId) {
        setManualError("")
        // Try to find Instagram Business Account from the page
        try {
          const igRes = await fetch(
            `https://graph.facebook.com/v22.0/${fbPageId}` +
            `?fields=instagram_business_account` +
            `&access_token=${manualToken.trim()}`
          )
          const igData = await igRes.json()
          if (igData.instagram_business_account) {
            igBusinessId = igData.instagram_business_account.id
          } else if (igData.error) {
            setManualError(`Page ID error: ${igData.error.message}`)
            setSaving(false)
            return
          }
        } catch (e) {
          console.log("Could not fetch Business ID with page ID", e)
        }
      } else {
        // Try to auto-find from user token
        try {
          const pagesRes = await fetch(
            `https://graph.facebook.com/v22.0/me/accounts?access_token=${manualToken.trim()}`
          )
          const pagesData = await pagesRes.json()

          if (pagesData.error) {
            setManualError(`Token error: ${pagesData.error.message}. Make sure you have 'pages_show_list' permission.`)
            setSaving(false)
            return
          }

          if (pagesData.data && pagesData.data.length > 0) {
            fbPageId = pagesData.data[0].id
            const pageToken = pagesData.data[0].access_token
            
            // Try each page to find Instagram Business Account
            for (const page of pagesData.data) {
              const igRes = await fetch(
                `https://graph.facebook.com/v22.0/${page.id}?fields=instagram_business_account&access_token=${pageToken}`
              )
              const igData = await igRes.json()
              if (igData.instagram_business_account) {
                igBusinessId = igData.instagram_business_account.id
                fbPageId = page.id
                break
              }
            }
          }
        } catch (e) {
          console.log("Token verification skipped")
        }
      }

      await updateDoc(doc(db, "users", appUser.uid), {
        instagramConnected: true,
        instagramHandle: manualHandle.trim(),
      })
      await setDoc(doc(db, "instagram_tokens", appUser.uid), {
        accessToken: manualToken.trim(),
        businessId: igBusinessId,
        fbPageId: fbPageId || "",
        connectedAt: new Date(),
      }, { merge: true })
      await refreshAppUser()
      setManualToken("")
      setManualHandle("")
      setManualPageId("")
      setManualIgBusinessId("")
      setShowManualInput(false)
      setConnectionSuccess(true)
    } catch (err) {
      setManualError("Failed to save. Check token and try again.")
      console.error("Manual connect error:", err)
    } finally {
      setSaving(false)
    }
  }

  async function copyTokenGuide() {
    const text = `Instructions:
1. Open https://developers.facebook.com/tools/explorer/
2. Select your Comment2DM app
3. Get User Token with: pages_show_list, pages_read_engagement, instagram_basic
4. Click "Get Token" → Copy the token`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!appUser) return null

  const initials = appUser.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      {connecting && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertTitle className="text-blue-800">Connecting Instagram...</AlertTitle>
          <AlertDescription className="text-blue-700">
            Please wait while we save your Instagram connection.
          </AlertDescription>
        </Alert>
      )}

      {connectionSuccess && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-800">Instagram Connected!</AlertTitle>
          <AlertDescription className="text-emerald-700">
            Your Instagram account has been successfully linked. You can now create automations.
          </AlertDescription>
        </Alert>
      )}

      {connectionError && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Connection Failed</AlertTitle>
          <AlertDescription className="text-red-700 text-sm">
            {connectionError}
            <div className="mt-2 text-xs text-red-600/80">
              <strong>Common fixes:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Make sure your Instagram is a Professional (Business/Creator) account</li>
                <li>Link Instagram to a Facebook Page in Instagram Settings → Account → Linked Accounts</li>
                <li>Accept the test user invite in Meta App Dashboard</li>
                <li>Try the "Enter Token Manually" option below</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and integrations.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={appUser.instagramProfilePic || `https://picsum.photos/seed/${user?.uid}/100`} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{appUser.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="size-3" /> {appUser.email}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={appUser.name} disabled className="rounded-xl bg-muted" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={appUser.email} disabled className="rounded-xl bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="size-5 text-[#E1306C]" />
            Instagram Connection
          </CardTitle>
          <CardDescription>Link your Instagram professional account to start automating DMs.</CardDescription>
        </CardHeader>
        <CardContent>
          {appUser.instagramConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="size-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-800">Connected to @{appUser.instagramHandle}</p>
                  <p className="text-sm text-emerald-600">Your Instagram account is linked and ready.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={handleDisconnectInstagram}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Unlink className="mr-2 size-4" />}
                  Disconnect Instagram
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleDisconnectInstagram().then(() => {
                      handleConnectInstagram()
                    })
                  }}
                  disabled={saving}
                >
                  <RefreshCw className="mr-2 size-4" />
                  Reconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <AlertCircle className="size-6 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-800">Instagram not connected</p>
                  <p className="text-sm text-amber-600">Connect your Instagram Professional account to start automating.</p>
                </div>
              </div>

              {/* Quick setup checklist */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm space-y-2">
                <p className="font-semibold text-blue-800 flex items-center gap-2">
                  <CheckCircle2 className="size-4" /> Before connecting, make sure:
                </p>
                <ul className="space-y-1.5 text-blue-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">①</span>
                    <span>Your Instagram account is a <strong>Professional</strong> (Business or Creator) account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">②</span>
                    <span>Instagram is linked to a <strong>Facebook Page</strong> (Instagram → Settings → Account → Linked Accounts → Facebook)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">③</span>
                    <span>If app is in Development mode, you&apos;re added as a <strong>test user</strong> in Meta App Dashboard</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button 
                  className="bg-[#E1306C] hover:bg-[#E1306C]/90 text-white"
                  onClick={handleConnectInstagram}
                >
                  <Instagram className="mr-2 size-4" />
                  Connect Instagram
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowGuide(!showGuide)}
                >
                  <ExternalLink className="mr-2 size-4" />
                  {showGuide ? "Hide Setup Guide" : "How to setup?"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowManualInput(!showManualInput)}
                >
                  <KeyRound className="mr-2 size-4" />
                  {showManualInput ? "Hide Manual Entry" : "Enter Token Manually"}
                </Button>
              </div>

              {showGuide && (
                <div className="bg-secondary/30 p-4 rounded-xl text-sm space-y-3">
                  <p className="font-semibold">Instagram Setup Steps:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Go to <a href="https://developers.facebook.com/" target="_blank" className="text-primary hover:underline">Meta for Developers</a></li>
                    <li>Create an app → Select <strong>Business</strong> type</li>
                    <li>Add <strong>Instagram Graph API</strong> product to your app</li>
                    <li>Go to <strong>App Roles → Roles</strong> and add yourself as a test user (if in development mode)</li>
                    <li>Accept the test user invite by going to <a href="https://developers.facebook.com/settings/developer/requests/" target="_blank" className="text-primary hover:underline">your developer requests</a></li>
                    <li>Copy App ID and App Secret to your <code className="bg-muted px-1 rounded">.env.local</code></li>
                    <li>In app settings, add this redirect URI: <code className="bg-muted px-1 rounded break-all">http://localhost:9002/api/auth/instagram/callback</code></li>
                    <li>Go to <strong>Permissions → instagram_basic</strong> and add it to your app</li>
                    <li>Make sure your Instagram is a <strong>Professional account</strong> (Business/Creator) linked to a Facebook Page</li>
                  </ol>
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <strong>⚠️ Common mistake:</strong> If your Meta app is in <strong>Development mode</strong>, only test users can use the OAuth login. Make sure you&apos;ve added yourself as a test user AND accepted the invite.
                  </div>
                </div>
              )}

              {showManualInput && (
                <div className="bg-secondary/20 p-5 rounded-xl border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm flex items-center gap-2">
                      <KeyRound className="size-4 text-primary" />
                      Manual Token Entry
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={copyTokenGuide}
                    >
                      {copied ? (
                        <><CheckCircle2 className="mr-1 size-3" /> Copied</>
                      ) : (
                        <><ClipboardList className="mr-1 size-3" /> Copy Guide</>
                      )}
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                    <p className="font-semibold">How to get your token:</p>
                    <ol className="list-decimal list-inside space-y-0.5">
                      <li>Open <a href="https://developers.facebook.com/tools/explorer/" target="_blank" className="underline font-medium">Graph API Explorer</a></li>
                      <li>Select app: <strong>Comment2DM</strong> (or your app name)</li>
                      <li>Click <strong>&quot;Get Token&quot;</strong> → <strong>&quot;Get User Access Token&quot;</strong></li>
                      <li>Select permissions: <strong>pages_show_list, pages_read_engagement, instagram_basic</strong></li>
                      <li>Login with your Facebook account & grant all permissions</li>
                      <li>Copy the token and paste below</li>
                    </ol>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Instagram Username/Handle <span className="text-red-500">*</span></label>
                      <Input
                        placeholder="e.g. your_business_account"
                        value={manualHandle}
                        onChange={(e) => setManualHandle(e.target.value)}
                        className="rounded-xl bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Instagram Business ID <span className="text-muted-foreground">(auto-detected)</span></label>
                        <Input
                          placeholder="e.g. 178414..."
                          value={manualIgBusinessId}
                          onChange={(e) => setManualIgBusinessId(e.target.value)}
                          className="rounded-xl bg-white font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Facebook Page ID <span className="text-muted-foreground">(auto-detected)</span></label>
                        <Input
                          placeholder="e.g. 123456789"
                          value={manualPageId}
                          onChange={(e) => setManualPageId(e.target.value)}
                          className="rounded-xl bg-white font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Access Token <span className="text-red-500">*</span></label>
                      <Input
                        placeholder="Paste your token here..."
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        className="rounded-xl bg-white font-mono text-xs"
                      />
                      <p className="text-[10px] text-muted-foreground">Token will be validated before saving</p>
                    </div>

                    {manualError && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="size-3" /> {manualError}
                      </p>
                    )}

                    <Button 
                      className="w-full rounded-xl bg-primary"
                      onClick={handleManualConnect}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 size-4" />
                      )}
                      Save & Connect
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Need an Instagram Professional (Business or Creator) account to use this feature.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-5 text-primary" />
            Account Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Plan</p>
              <p className="font-semibold capitalize">{appUser.plan}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <p className="font-semibold capitalize">{appUser.role}</p>
            </div>
            <div>
              <p className="text-muted-foreground">DMs Used</p>
              <p className="font-semibold">{appUser.dmSentThisMonth} / {appUser.dmQuota}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account Created</p>
              <p className="font-semibold">{new Date(appUser.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}