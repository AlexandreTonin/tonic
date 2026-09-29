import { GithubIcon } from '@/components/layout/github-icon';
import {
  APP_ICON as AppIcon,
  BUY_ME_A_COFFEE_URL,
  NAV,
  REPO_URL,
} from '@/components/layout/nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { applyPageMeta } from '@/lib/page-meta';
import { Link, Outlet, useLocation, useMatches } from '@tanstack/react-router';
import { Coffee } from 'lucide-react';
import { useEffect } from 'react';
import { ThemeToggle } from '../ui/theme-toggle';

export function AppLayout() {
  const { pathname } = useLocation();
  const page = useMatches({
    select: (matches) =>
      matches.findLast((m) => m.staticData.title)?.staticData,
  });
  const title = page?.title;
  const description = page?.description;

  useEffect(() => {
    applyPageMeta({ title, description, pathname });
  }, [title, description, pathname]);
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
        <SidebarFooter className="pb-6">
          <SidebarGroup className="p-0">
            <SidebarGroupLabel>Apoie o projeto</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <a
                        href={BUY_ME_A_COFFEE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <Coffee />
                    <span>Buy Me a Coffee</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <GithubIcon />
                    <span>GitHub</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b px-4 md:hidden">
          <SidebarTrigger aria-label="Abrir menu" />
          <div className="flex items-center gap-2 font-semibold">
            <AppIcon className="size-4" />
            Tonic
          </div>
        </header>
        <main className="min-w-0 flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
