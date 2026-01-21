
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import { PanelLeft } from 'lucide-react';
import { create } from 'zustand';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3.5rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

interface SidebarState {
  isOpen: boolean;
  isMobileOpen: boolean;
  isMobile: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  setMobileOpen: (open: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  getState: () => 'expanded' | 'collapsed';
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isOpen: true, 
  isMobileOpen: false,
  isMobile: false,
  toggle: () => {
    if (get().isMobile) {
      set({ isMobileOpen: !get().isMobileOpen });
    } else {
      const newIsOpen = !get().isOpen;
      set({ isOpen: newIsOpen });
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${newIsOpen}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  },
  setOpen: (open) => {
    set({ isOpen: open });
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${60 * 60 * 24 * 7}`;
  },
  setMobileOpen: (open) => set({ isMobileOpen: open }),
  setIsMobile: (isMobile) => set({ isMobile }),
  getState: () => get().isOpen ? 'expanded' : 'collapsed',
}));

type SidebarContextValue = ReturnType<typeof useSidebarStore>;
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export const SidebarProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const store = useSidebarStore();
  const isMobile = useIsMobile();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isMounted || isMobile === null) return;

    const currentIsMobile = store.getState().isMobile;

    if (currentIsMobile !== isMobile) {
        store.setIsMobile(isMobile);
    }
  }, [isMobile, isMounted, store]);

  React.useEffect(() => {
    if (isMounted) {
      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
        ?.split('=')[1];
      if (cookieValue) {
        store.setOpen(cookieValue === 'true');
      }
    }
  }, [store, isMounted]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        store.toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  if (isMobile === null) return null;

  return (
    <SidebarContext.Provider value={store}>
        <TooltipProvider delayDuration={0}>
          <div
            style={{
                '--sidebar-width': SIDEBAR_WIDTH,
                '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
            } as React.CSSProperties}
            className="group/sidebar-wrapper"
          >
            {children}
          </div>
        </TooltipProvider>
    </SidebarContext.Provider>
  );
};

const Sidebar = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, children, ...props }, ref) => {
    const { isMobile, getState } = useSidebarStore();
    const state = getState();
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => setIsMounted(true), []);

    if (!isMounted) {
      // Render a static placeholder on the server and initial client render
      return (
          <div 
            ref={ref} 
            className={cn('hidden h-full text-sidebar-foreground z-40 md:flex md:flex-col w-[--sidebar-width]', className)} 
            {...props}
          />
      );
    }

    if (isMobile) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'hidden h-full text-sidebar-foreground z-40 md:flex md:flex-col',
          state === 'collapsed' ? 'w-[--sidebar-width-icon]' : 'w-[--sidebar-width]',
          'transition-all duration-200',
          className
        )}
        data-state={state}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Sidebar.displayName = 'Sidebar';

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggle();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    const { getState } = useSidebarStore();
    const state = getState();
    return (
        <div
            ref={ref}
            data-sidebar="header"
            className={cn('flex items-center p-3', state === 'collapsed' && 'justify-center', className)}
            {...props}
        />
    );
});
SidebarHeader.displayName = 'SidebarHeader';

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    as?: React.ElementType;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  }
>(({ as: Comp = 'button', isActive = false, tooltip, className, children, ...props }, ref) => {
  const { isMobile, getState } = useSidebarStore();
  const state = getState();

  const button = (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent active:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
        { 'bg-accent text-accent-foreground': isActive },
        state === 'collapsed' && 'justify-center !p-2',
        className
      )}
      {...props}
    >
      {children}
      <span className={cn('truncate', state === 'collapsed' && 'sr-only')}>{props.title}</span>
    </Comp>
  );

  if (!tooltip) {
    return button;
  }

  const tooltipContent = typeof tooltip === 'string' ? { children: tooltip } : tooltip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        {...tooltipContent}
      />
    </Tooltip>
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(({ className, ...props }, ref) => {
    const { toggle } = useSidebarStore();
    return <button ref={ref} onClick={toggle} className={cn("group-data-[collapsible=offcanvas]:-left-2", className)} {...props} />
})
SidebarRail.displayName = 'SidebarRail';

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<'main'>>((props, ref) => <main ref={ref} {...props} />);
SidebarInset.displayName = 'SidebarInset';

const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>((props, ref) => <Input ref={ref} {...props} />);
SidebarInput.displayName = 'SidebarInput';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>((props, ref) => <div ref={ref} {...props} />);
SidebarFooter.displayName = 'SidebarFooter';

const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>((props, ref) => <Separator ref={ref} {...props} />);
SidebarSeparator.displayName = 'SidebarSeparator';

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>((props, ref) => <div ref={ref} {...props} />);
SidebarContent.displayName = 'SidebarContent';

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>((props, ref) => <div ref={ref} {...props} />);
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>((props, ref) => <div ref={ref} {...props} />);
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>((props, ref) => <button ref={ref} {...props} />);
SidebarGroupAction.displayName = 'SidebarGroupAction';

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>((props, ref) => <div ref={ref} {...props} />);
SidebarGroupContent.displayName = 'SidebarGroupContent';

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>((props, ref) => <ul ref={ref} {...props} />);
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>((props, ref) => <li ref={ref} {...props} />);
SidebarMenuItem.displayName = 'SidebarMenuItem';

const SidebarMenuAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>((props, ref) => <button ref={ref} {...props} />);
SidebarMenuAction.displayName = 'SidebarMenuAction';

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>((props, ref) => <div ref={ref} {...props} />);
SidebarMenuBadge.displayName = 'SidebarMenuBadge';

const SidebarMenuSkeleton = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>((props, ref) => <div ref={ref} {...props} />);
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>((props, ref) => <ul ref={ref} {...props} />);
SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>((props, ref) => <li ref={ref} {...props} />);
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

const SidebarMenuSubButton = React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'>>((props, ref) => <a ref={ref} {...props} />);
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
};