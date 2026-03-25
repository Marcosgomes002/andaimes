import {
  LayoutDashboard,
  Package,
  Users,
  CalendarOff,
  FilePlus,
  FileText,
  RotateCcw,
  DollarSign,
  BarChart3,
  Download,
  Settings,
  HardHat,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Produtos', url: '/produtos', icon: Package },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Novo Aluguel', url: '/alugueis/novo', icon: FilePlus },
  { title: 'Aluguéis', url: '/alugueis', icon: FileText },
  { title: 'Devolução', url: '/devolucao', icon: RotateCcw },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign },
  { title: 'Dias Não Cobrados', url: '/dias-nao-cobrados', icon: CalendarOff },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart3 },
  { title: 'Backup', url: '/backup', icon: Download },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3">
            <div className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-sidebar-primary" />
              {!collapsed && (
                <span className="text-sm font-bold text-sidebar-primary">
                  LocaFácil
                </span>
              )}
            </div>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent font-semibold text-sidebar-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}