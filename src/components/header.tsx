'use client';

import { Menu, Search } from 'lucide-react';
import { Logo } from './logo';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
import { usePathname } from 'next/navigation';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

// Basic menu items without role filtering
const allMenuItems = [
  { href: "/dashboard", label: "Painel" },
  { href: "/dashboard/reservations", label: "Reservas" },
  { href: "/dashboard/resources", label: "Recursos" },
  { href: "/dashboard/users", label: "Usuários" },
  { href: "/dashboard/settings", label: "Configurações" },
];

function MobileNav({ menuItems }: { menuItems: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir Menu Principal</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[300px] p-0">
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Menu Principal</SheetTitle>
            <SheetDescription>
              Navegue pelas diferentes seções do painel administrativo.
            </SheetDescription>
          </VisuallyHidden>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 p-3 border-b">
            <Logo className="w-8 h-8" />
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

export default function Header({ userRole }: { userRole?: string }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenuItems = allMenuItems.filter(item => {
    // Basic mapping of admin-only items. Ideally should share the config with sidebar.
    if (item.href === '/dashboard/users' || item.href === '/dashboard/settings') {
      return userRole === 'Admin';
    }
    return true;
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = () => {
    // In a real app, you would verify logout with the server here
    router.push('/');
  };

  return (
    <>
      <header
        className='sticky top-4 z-10 w-[95%] rounded-lg border bg-card/95 backdrop-blur-sm shadow-lg mb-4'
      >
        <div className="flex items-center gap-4 p-4 sm:px-6">

          <MobileNav menuItems={filteredMenuItems} />

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
                    <AvatarFallback>
                      U
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  Minha Conta
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userRole === 'Admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Configurações</Link>
                  </DropdownMenuItem>
                )}
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
