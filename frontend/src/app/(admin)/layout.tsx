import Sidebar  from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar for mobile */}
        <header className="flex h-14 items-center gap-3 border-b px-4 md:hidden">
          <MobileSidebar />
          <span className="text-sm font-semibold">Goldman&apos;s Delight</span>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}