import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { RealtimeAlertToasts } from '@/components/realtime/realtime-alert-toasts';
import { ToastProvider } from '@/components/dashboard/toast-notification';
import { PresentationController } from '@/components/demo/presentation-controller';

/**
 * Dashboard layout — Digital Bauhaus application shell.
 * Paper canvas, editorial sidebar, clean topbar.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <Topbar />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
        </div>

        {/* Global realtime alert toasts */}
        <RealtimeAlertToasts />

        {/* Presentation controller */}
        <PresentationController />
      </div>
    </ToastProvider>
  );
}
