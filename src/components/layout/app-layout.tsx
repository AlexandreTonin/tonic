import { CommandPalette } from '@/components/layout/command-palette';
import { GithubIcon } from '@/components/layout/github-icon';
import { PracticeTimer } from '@/components/layout/practice-timer';
import { ShortcutsDialog } from '@/components/layout/shortcuts-dialog';
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
import { movePractice } from '@/lib/practice-log';
import { Link, Outlet, useLocation, useMatches } from '@tanstack/react-router';
import { Coffee, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '../ui/theme-toggle';

export function AppLayout() {
  const { pathname } = useLocation();
  const { title, description, noindex } = useMatches({
    select: (matches) => {
      const leaf = matches[matches.length - 1];
      const page = leaf?.staticData;
      const id = (leaf?.params as { id?: string } | undefined)?.id;
      const item = page?.item && id !== undefined ? page.item(id) : undefined;
      return {
        title: item ? `${item} · ${page?.title}` : page?.title,
        description:
          item && page?.description
            ? `${item}. ${page.description}`
            : page?.description,
        noindex: !!page?.noindex || (!!page?.item && !item),
      };
    },
    structuralSharing: true,
  });

  useEffect(() => {
    applyPageMeta({ title, description, noindex, pathname });
  }, [title, description, noindex, pathname]);
  useEffect(() => {
    movePractice(pathname, title ?? 'Tonic');
  }, [pathname, title]);
  const [searching, setSearching] = useState(false);
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
          <button
            type="button"
            onClick={() => setSearching(true)}
            className="flex h-8 items-center gap-2 rounded-xl border px-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Search className="size-4" />
            Buscar
            <kbd className="ml-auto font-sans text-xs">Ctrl K</kbd>
          </button>
          <PracticeTimer path={pathname} title={title ?? 'Tonic'} />
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
          <button
            type="button"
            aria-label="Buscar"
            onClick={() => setSearching(true)}
            className="justify-self-end rounded-xl p-2 hover:bg-muted"
          >
            <Search className="size-4" />
          </button>
        </header>
        <main className="min-w-0 flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </SidebarInset>
      <CommandPalette open={searching} onOpenChange={setSearching} />
      <ShortcutsDialog />
    </SidebarProvider>
  );
}
