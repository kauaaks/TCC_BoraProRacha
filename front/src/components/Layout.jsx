import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Home, 
  Users, 
  Calendar, 
  CreditCard, 
  BarChart3,
  Wallet, 
  Settings, 
  LogOut, 
  Menu,
  MapPin,
  Shield
} from 'lucide-react'
import { href, useLocation, useNavigate } from 'react-router-dom'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const getNavigationItems = () => {
    if (!user) return []

    const userType = user.user_type

    const common = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Jogos', href: '/games', icon: Calendar },
      { name: 'Estatísticas', href: '/stats', icon: BarChart3 },
      { name: 'Times', href:'/teams', icon: Users },
      { name: 'Financeiro', href: '/payments', icon: Wallet }
    ]

    if (userType === 'admin') {
      return [
        ...common,
        { name: 'Times', href: '/teams', icon: Users },
        { name: 'Campos', href: '/fields', icon: MapPin },
        { name: 'Financeiro', href: '/payments', icon: CreditCard },
        { name: 'Administração', href: '/admin', icon: Shield }
      ]
    }

    if (userType === 'field_manager') {
      return [
        ...common,
        { name: 'Meus Campos', href: '/fields', icon: MapPin }
      ]
    }

    if (userType === 'team_rep') {
      return [
    ...common,
    { name: 'Meu Time', href: '/my-team', icon: Users },
    { name: 'Financeiro', href: '/payments', icon: CreditCard }
  ]
}



    if (userType === 'player') {
      return common
    }

    return common
  }

  const navigationItems = getNavigationItems()

  const handleNavigation = (href) => {
    navigate(href)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getUserInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  }

  const getUserTypeLabel = (userType) => {
    const types = {
      'admin': 'Administrador',
      'field_manager': 'Gestor de Campo',
      'team_rep': 'Representante',
      'player': 'Jogador'
    }
    return types[userType] || 'Usuário'
  }

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center space-x-3 p-6 border-b">
        <div className="w-10 h-10 bg-gradient-to-br from-appsociety-green to-appsociety-blue rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bora Pro Racha</h1>
          <p className="text-xs text-gray-500">{getUserTypeLabel(user?.user_type)}</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-12 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Button>
          )
        })}
      </nav>

      {/* Perfil do usuário */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-12 p-2">
              <Avatar className="w-8 h-8 mr-3">
                <AvatarFallback className="bg-appsociety-green text-white text-sm">
                  {getUserInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                  <VisuallyHidden>
                    <SheetTitle>Menu de navegação</SheetTitle>
                  </VisuallyHidden>
                <SidebarContent isMobile={true} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-appsociety-green to-appsociety-blue rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Bora Pro Racha</h1>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-appsociety-green text-white text-sm">
                    {getUserInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="lg:pl-72">
        <main className="flex-1">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
