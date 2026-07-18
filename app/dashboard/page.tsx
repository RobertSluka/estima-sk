import { redirect } from "next/navigation"

// The dashboard was retired in favour of /monitoring — its market overview
// is covered by /mapa-cien. Redirect so old links keep working.
export default function DashboardRedirect() {
  redirect("/monitoring")
}
