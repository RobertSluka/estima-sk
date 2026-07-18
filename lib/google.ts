// Google OIDC sign-in helpers (server-only).
//
// Implements the standard authorization-code flow with plain fetch — no SDK.
// The id_token is obtained directly from Google's token endpoint over TLS, so
// we validate its claims (iss/aud/exp) but don't need JWKS signature checks.
//
//   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET  OAuth client ("Web application");
//       authorized redirect URI must be <base>/api/auth/google/callback
//   APP_BASE_URL  public origin used for the redirect URI when behind a proxy
//                 (defaults to the incoming request's origin in dev)

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"

export const OAUTH_STATE_COOKIE = "estima_oauth_state"

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

export function appOrigin(requestUrl: string): string {
  return (process.env.APP_BASE_URL || new URL(requestUrl).origin).replace(/\/$/, "")
}

function redirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`
}

export function buildAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  })
  return `${AUTH_ENDPOINT}?${params}`
}

export interface GoogleClaims {
  sub: string
  email: string
  name?: string
  picture?: string
}

/** Exchange the authorization code; returns verified profile claims or null. */
export async function exchangeCode(origin: string, code: string): Promise<GoogleClaims | null> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri(origin),
    }),
    cache: "no-store",
  })
  if (!res.ok) return null
  const data = (await res.json().catch(() => null)) as { id_token?: string } | null
  if (!data?.id_token) return null

  const payload = data.id_token.split(".")[1]
  if (!payload) return null
  let claims: Record<string, unknown>
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString())
  } catch {
    return null
  }

  const iss = String(claims.iss ?? "")
  const okIss = iss === "https://accounts.google.com" || iss === "accounts.google.com"
  const okAud = claims.aud === process.env.GOOGLE_CLIENT_ID
  const okExp = typeof claims.exp === "number" && claims.exp > Date.now() / 1000
  const verified = claims.email_verified !== false
  if (!okIss || !okAud || !okExp || !verified) return null
  if (typeof claims.sub !== "string" || typeof claims.email !== "string") return null

  return {
    sub: claims.sub,
    email: claims.email,
    name: typeof claims.name === "string" ? claims.name : undefined,
    picture: typeof claims.picture === "string" ? claims.picture : undefined,
  }
}
