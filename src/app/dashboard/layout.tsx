import AppSidebar from '@/components/app-sidebar';
import Header from '@/components/header';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const userRole = user?.role;

  return (
    <div className="flex min-h-screen w-full flex-row">
      <AppSidebar userRole={userRole} />
      <div className="flex flex-1 flex-col">
        <div className="relative flex flex-1 flex-col items-center bg-background">
          <Header userRole={userRole} />
          <main className="w-full flex-1 p-4 sm:px-6 md:gap-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
