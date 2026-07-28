import { requireAuth } from "@/lib/auth/guards"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  await requireAuth()

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[288px_minmax(0,1fr)]">
        <Sidebar />

        <div className="min-w-0 pb-20 lg:pb-0">
          {children}
        </div>
      </div>

      <MobileNav />
    </div>
  )
}