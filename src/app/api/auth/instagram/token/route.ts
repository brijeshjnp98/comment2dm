import { NextRequest, NextResponse } from "next/server"

// This endpoint returns the temporary Instagram token stored in the httpOnly cookie
// The settings page calls this after OAuth redirect to save the token to Firestore
export async function GET(req: NextRequest) {
  const token = req.cookies.get("ig_temp_token")?.value
  const pageToken = req.cookies.get("ig_temp_page_token")?.value

  if (!token) {
    return NextResponse.json(
      { error: "No temporary token found. Please reconnect Instagram." },
      { status: 404 }
    )
  }

  // Return the token and clear the cookies
  const response = NextResponse.json({
    accessToken: token,
    pageToken: pageToken || "",
  })

  // Clear the temporary cookies
  response.cookies.set("ig_temp_token", "", { maxAge: 0, path: "/" })
  response.cookies.set("ig_temp_page_token", "", { maxAge: 0, path: "/" })

  return response
}
