import { APP_ICON as AppIcon, NAV } from '@/components/layout/nav';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { ThemeToggle } from '../ui/theme-toggle';

export function AppLayout() {
  const { pathname } = useLocation();
  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 font-semibold">
            <div className="flex items-center gap-2">
              <AppIcon className="size-4" />
              Tonic
            </div>
            <ThemeToggle />
          </div>
        </SidebarHeader>
        <SidebarContent>
          {NAV.map((group, i) => (
            <SidebarGroup key={group.label ?? i}>
              {group.label && (
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map(({ to, label, icon: Icon }) => (
                    <SidebarMenuItem key={to}>
                      <SidebarMenuButton
                        isActive={isActive(to)}
                        render={<Link to={to} />}
                      >
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center border-b px-4 md:hidden">
          <SidebarTrigger aria-label="Abrir menu" />
        </header>
        <main className="min-w-0 flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
