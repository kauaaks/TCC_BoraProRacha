import { useState, useEffect, useMemo } from 'react'
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
  BarChart3,
  Wallet, 
  Settings, 
  LogOut, 
  Menu,
  MapPin,
  Shield
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Layout({ children }) {
  const { user, logout, apiCall } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [hasTeam, setHasTeam] = useState(false)
  const [teams, setTeams] = useState([])
  const location = useLocation()
  const navigate = useNavigate()

  // nome visível
  const nomeVisivel = useMemo(
    () => (user?.nome || user?.displayName || user?.name || '').trim(),
    [user]
  )

  // Carrega times do usuário e define hasTeam
  useEffect(() => {
    let alive = true
    async function loadTeams() {
      if (!user?.uid) {
        if (alive) {
          setHasTeam(false)
          setTeams([])
          setLoadingTeams(false)
        }
        return
      }
      try {
        const res = await apiCall('/teams/meustimes?t=' + Date.now())
          .catch(() => apiCall('/teams/me?t=' + Date.now()))
        const list = res?.teams || []
        if (alive) {
          setTeams(list)
          setHasTeam(Array.isArray(list) && list.length > 0)
        }
      } catch {
        if (alive) {
          setHasTeam(false)
          setTeams([])
        }
      } finally {
        if (alive) setLoadingTeams(false)
      }
    }
    loadTeams()
    return () => { alive = false }
  }, [user?.uid, apiCall]) // padrão useEffect para buscar dados ao montar [web:315][web:314]

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

    const filteredCommon = common.filter(item => {
      if (item.name === 'Times') {
        return !(userType === 'jogador' || userType === 'representante_time')
      }
      return true
    })

    if (userType === 'admin') {
      return [
        ...filteredCommon,
        { name: 'Administração', href: '/admin', icon: Shield }
      ]
    }

    if (userType === 'gestor_campo') {
      return [
        ...filteredCommon,
        { name: 'Meus Campos', href: '/fields', icon: MapPin }
      ]
    }

    if (userType === 'representante_time') {
      return [
        ...filteredCommon,
        { name: 'Meus Times', href: '/my-team', icon: Users }
      ]
    }

    if (userType === 'jogador') {
      return [
        ...filteredCommon,
        { name: 'Meus Times', href: '/my-team', icon: Users }
      ]
    }

    return filteredCommon
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
      'gestor_campo': 'Gestor de Campo',
      'representante_time': 'Representante',
      'jogador': 'Jogador'
    }
    return types[userType] || 'Usuário'
  }

  // Banner “sem time” – aparece somente quando não possui time e já terminou de carregar
  const NoTeamBanner = () => {
    if (loadingTeams || hasTeam) return null
    return (
      <div className="p-4 md:p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-yellow-800">
            Você ainda não faz parte de nenhum time. Solicite o código/link a um representante e clique abaixo para ingressar.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/join-team')} className="bg-appsociety-green hover:bg-green-600">
              Entrar em um time
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* header da barra lateral */}
      <div className="flex items-center space-x-3 p-6 border-b">
        <div className="w-10 h-10 bg-gradient-to-br from-appsociety-green to-appsociety-blue rounded-lg flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bora Pro Racha</h1>
          <p className="text-xs text-gray-500">
            {nomeVisivel || 'Usuário'} {user?.user_type && `• ${getUserTypeLabel(user.user_type)}`}
          </p>
        </div>
      </div>

      {/* navegação */}
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

      {/* conta */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start h-12 p-2">
              <Avatar className="w-8 h-8 mr-3">
                <AvatarFallback className="bg-appsociety-green text-white text-sm">
                  {getUserInitials(nomeVisivel)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{nomeVisivel || 'Usuário'}</p>
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
      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <SidebarContent />
        </div>
      </div>

      {/* Topbar mobile */}
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
                    {getUserInitials(nomeVisivel)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{nomeVisivel || 'Usuário'}</p>
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

      {/* Conteúdo */}
      <div className="lg:pl-72">
        <main className="flex-1">
          <div className="p-4 lg:p-8 space-y-4">
            <NoTeamBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
