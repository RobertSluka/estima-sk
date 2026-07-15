// Auth state. There is no authentication backend yet, so the app always
// renders a signed-out UI (a "Sign in" link, never a fabricated identity).
// When real auth is wired, expose the session/user here — and never hardcode
// a real person's name or email into the client bundle.

export const isAuthenticated = false as const
