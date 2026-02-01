import AdminSidebar from '@/components/AdminSidebar';
import Navbar from '@/components/Navbar';
import AdminLayoutContent from '@/components/AdminLayoutContent';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AdminSidebar />
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </div>
  );
}