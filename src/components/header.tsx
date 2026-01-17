'use client';

import { BookOpenCheck, LayoutDashboard, CalendarDays, Building, Users, Settings, Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { SidebarTrigger } from './ui/sidebar';
import { useAppUser } from '@/hooks/use-app-user'; // Correct hook for app user data
import { useAuth as useFirebaseAuth } from '@/firebase/provider'; // Correct hook for auth instance
import { signOut } from 'firebase/auth'; // Firebase signout function
import { usePathname } from 'next/navigation';

const allMenuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel", adminOnly: false },
  { href: "/dashboard/reservations", icon: CalendarDays, label: "Reservas", adminOnly: false },
  { href: "/dashboard/resources", icon: Building, label: "Recursos", adminOnly: false },
  { href: "/dashboard/users", icon: Users, label: "Usuários", adminOnly: true },
  { href: "/dashboard/settings", icon: Settings, label: "Configurações", adminOnly: true },
];

function MobileNav() {
    const pathname = usePathname();
    const { currentUser, isLoaded } = useAppUser(); // Use the new hook
    const [open, setOpen] = useState(false);

    const menuItems = allMenuItems.filter(item => {
        if (!isLoaded) return false;
        if (item.adminOnly) return currentUser?.role === 'Admin';
        return true;
    });

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[300px] p-0">
                 <div className="flex h-full flex-col">
                    <div className="flex items-center gap-2 p-3 border-b">
                         <BookOpenCheck className="w-8 h-8 text-primary" />
                         <span className="text-lg font-semibold">Gestão Escolar</span>
                    </div>
                    <nav className="flex flex-col gap-2 p-2">
                        {menuItems.map((item) => (
                           <Button
                                key={item.href}
                                asChild
                                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                                className="justify-start"
                                onClick={() => setOpen(false)}
                            >
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-5 w-5" />
                                    {item.label}
                                </Link>
                           </Button>
                        ))}
                    </nav>
                 </div>
            </SheetContent>
        </Sheet>
    );
}

export default function Header() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser, isLoaded } = useAppUser(); // Use new hook for user data
  const auth = useFirebaseAuth(); // Use hook from provider to get auth instance

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      <header
        className='sticky top-4 z-10 w-[95%] rounded-lg border bg-card/95 backdrop-blur-sm shadow-lg mb-4'
      >
          <div className="flex items-center gap-4 p-4 sm:px-6">

            <MobileNav />

            <SidebarTrigger className="hidden md:flex flex-shrink-0" />

            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar recursos..."
                  className="w-full rounded-lg bg-card pl-8 md:w-[200px] lg:w-[336px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full flex-shrink-0"
                  >
                    <Avatar>
                      <AvatarImage src={currentUser?.avatar} alt="Avatar" />
                      {isLoaded && (
                        <AvatarFallback>
                          {currentUser?.name?.charAt(0) ?? 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {isLoaded ? currentUser?.name ?? 'Minha Conta' : 'Carregando...'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Configurações</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Suporte</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
      </header>
    </>
  );
}
