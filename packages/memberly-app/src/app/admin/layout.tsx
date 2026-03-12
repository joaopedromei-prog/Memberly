import { Sidebar } from '@/components/admin/Sidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { ToastContainer } from '@/components/ui/Toast';

export const metadata = {
  title: 'Admin — Memberly',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="p-6">
          <Breadcrumb />
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
