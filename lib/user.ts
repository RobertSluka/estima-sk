// Mock signed-in user. The app has no auth backend yet — this stands in for
// whatever the session/API will return later. Swap for real data when wired.

export interface CurrentUser {
  name: string
  email: string
  initials: string
  plan: string
}

export const currentUser: CurrentUser = {
  name: "Robert Sluka",
  email: "geminitech11@gmail.com",
  initials: "R",
  plan: "BASIC",
}
