
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { PanelLeft } from 'lucide-react';

import { useLayoutStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_ICON = '3.5rem';

// Hook simplificado, agora usando o store global diretamente
export const useSidebar = useLayoutStore;

// SidebarProvider foi removido. A lógica de cookie e keyboard shortcut será movida.

const Sidebar = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, children, ...props }, ref) => {
    const { isMobile, getState } = useSidebar();
    const state = getState();
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => setIsMounted(true), []);

    if (!isMounted) {
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
      <TooltipProvider delayDuration={0}>
        <div
          style={{
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
          } as React.CSSProperties}
          className="group/sidebar-wrapper"
        >
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
        </div>
      </TooltipProvider>
    );
  }
);
Sidebar.displayName = 'Sidebar';

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const toggle = useSidebar((s) => s.toggle);

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
  const { getState } = useSidebar();
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
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
    href?: string; // Fix TS error for Link usage
  }
>(({ asChild = false, isActive = false, tooltip, className, children, ...props }, ref) => {
  const { isMobile, getState } = useSidebar();
  const state = getState();

  const Comp = asChild ? Slot : 'button';

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
    </Comp>
  );

  // If collapsed, we might not see the text span if the child doesn't handle it, 
  // but with Slot, the children are merged.
  // Ideally, the consumer of asChild handles the content structure.
  // But here we're just wrapping.
  // Note: the original code rendered a <span> for the title. With asChild, the child must contain everything.
  // HOWEVER, SidebarMenuButton logic in the original file separated children and title?
  // Original usage: children (icon) + props.title used in a span.
  // Wait, let's look at original Render:
  // {children}
  // <span ...>{props.title}</span>
  // AND props.title was used for Tooltip.

  // If I use asChild, I can't inject the <span> automatically easily if it's a Slot.
  // I should probably stick to the "as" prop or just add href to the type definition for now to be safe and quick.
  // Changing to fully correct asChild might break the internal structure expectation (icon + span).

  // RETRACTING asChild PLAN for this specific component structure which assumes it controls the span rendering.
  // Going with adding href to type definition.

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

// ... (todos os outros componentes do sidebar permanecem os mesmos)


const SidebarRail = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(({ className, ...props }, ref) => {
  const { toggle } = useSidebar();
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