import { NextResponse } from "next/server"
import { authConfigured } from "@/lib/auth"
import { accountsConfigured } from "@/lib/backend"
import { stripeConfigured } from "@/lib/stripe"

// Which sign-in/billing methods this deployment supports — lets pages
// show/hide the Google button, registration and checkout without leaking
// any secrets.
export async function GET() {
  return NextResponse.json({
    password: authConfigured(),
    registration: accountsConfigured() && authConfigured(),
    google: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && authConfigured(),
    ),
    billing: stripeConfigured(),
  })
}
