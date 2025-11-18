import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, Users, Shield } from 'lucide-react'
import logoImg from '../assets/logo6.png'
import './Login.css'

export default function Login() {
  const { login, register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('login')

  // Estados do formulário de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  // Estados do formulário de registro
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    user_type: 'jogador'
  })

  const userTypeOptions = [
    { value: 'jogador', label: 'Jogador', icon: Users },
    { value: 'representante_time', label: 'Representante de Time', icon: Shield },
    { value: 'gestor_campo', label: 'Gestor de Campo', icon: Shield }
  ]

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const result = await login(loginData.email, loginData.password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setIsLoading(false)
  }

  // Função de registro
  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const { email, password, name, phone, user_type } = registerData

  try {
    // Ajuste os nomes dos campos para o backend
    const result = await register({
      email,
      password,          // senha vai pro Firebase
      nome: name,        // 'name' -> 'nome'
      telefone: phone,   // 'phone' -> 'telefone'
      user_type          // já vem correto do select
    })

    if (!result.success) {
      setError(result.error)
    }

  } catch (err) {
    setError(err.message)
  }

  setIsLoading(false)
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="w-full max-w-md space-y-6 fade-in">
        {/* Logo e Título */}
        <div className="text-center space-y-4">
          <img src={logoImg} alt="Logo" className="mx-auto w-30 h-30 rounded-2xl shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold text-white">Bora pro Racha!</h1>
            <p className="text-white">Gestão completa para times de futebol society</p>
          </div>
        </div>

        {/* Formulários */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bem-vindo</CardTitle>
            <CardDescription className="text-center">
              Entre na sua conta ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>

              {/* Formulário de Login */}
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginData.email || ''}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Sua senha"
                        value={loginData.password || ''}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="h-12 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-appsociety-green hover:bg-green-600 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              {/* Formulário de Registro */}
              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={registerData.name || ''}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email || ''}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={registerData.phone || ''}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_type">Tipo de Usuário</Label>
                    <Select
                      value={registerData.user_type || 'player'}
                      onValueChange={(value) => setRegisterData({ ...registerData, user_type: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Selecione o tipo de usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {userTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center space-x-2">
                              <option.icon className="w-4 h-4" />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crie uma senha segura"
                        value={registerData.password || ''}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        className="h-12 pr-10"
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 bg-appsociety-blue hover:bg-blue-600 text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Informações adicionais */}
        <div className="text-center text-sm text-white">
          <p>Ao criar uma conta, você concorda com nossos</p>
          <p>
            <a href="#" className="text-appsociety-blue hover:underline">Termos de Uso</a>
            {' e '}
            <a href="#" className="text-appsociety-blue hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  )
}
