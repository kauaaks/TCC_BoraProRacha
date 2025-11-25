import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, Users, Shield, X } from 'lucide-react'
import logoImg from '../assets/logo6.png'
import './Login.css'

// VALIDAÇÃO DE SENHA FORTE
function validarSenhaForte(senha) {
  const regras = [
    { regex: /.{8,}/, msg: "Mínimo de 8 caracteres" },
    { regex: /[A-Z]/, msg: "Ao menos uma letra maiúscula" },
    { regex: /[a-z]/, msg: "Ao menos uma letra minúscula" },
    { regex: /[0-9]/, msg: "Ao menos um número" },
    { regex: /[!@#$%^&*(),.?\":{}|<>]/, msg: "Ao menos um símbolo" },
  ];
  const mensagensErro = regras.filter(r => !r.regex.test(senha)).map(r => r.msg);
  return { valido: mensagensErro.length === 0, erros: mensagensErro };
}

export default function Login() {
  const { login, register, resetPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

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

  // Estado para feedback da senha
  const [senhaFeedback, setSenhaFeedback] = useState({ valido: false, erros: [] });

  // Estados do modal "Esqueceu a senha"
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')

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
      if (result.error?.includes('auth/invalid-credential')){
        setError('E-mail ou senha incorretos');
      } else {
        setError('Erro desconhecido ao fazer login');
      }
    }
    setIsLoading(false)
  }

  // Função de registro
  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const { email, password, name, phone, user_type } = registerData

    if (!senhaFeedback.valido) {
      setError("A senha não atende aos requisitos de segurança!")
      setIsLoading(false)
      return;
    }

    try {
      const result = await register({
        email,
        password,
        nome: name,
        telefone: phone,
        user_type
      })

      if (!result.success) {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    }
    setIsLoading(false)
  }

  // Handler do modal "Esqueceu a senha"
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setForgotMessage('');
    try {
      const result = await resetPassword(forgotEmail);
      if (!result.success) setError(result.error);
      else setForgotMessage('Enviamos um link de redefinição para o seu e-mail!');
    } catch (err) {
      setError('Não foi possível enviar o e-mail de redefinição.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4 relative">

      {/* Modal "Esqueceu a senha" */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-all fade-in">
          <Card className="w-full max-w-sm shadow-2xl border-0 p-8 fade-in">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-xl text-appsociety-green">Redefinir Senha</h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-2 py-0 text-gray-500 hover:text-appsociety-blue"
                onClick={() => setIsForgotOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="h-12"
              />
              <Button
                type="submit"
                className="w-full h-12 bg-appsociety-green hover:bg-green-600 text-white font-semibold"
                disabled={isLoading || !forgotEmail}
              >
                {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
              </Button>
            </form>
            {forgotMessage && (
              <Alert variant="success" className="mt-4">
                <AlertDescription>{forgotMessage}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-gray-600 mt-4 text-center">
              Informe seu e-mail e enviaremos o link de redefinição.
            </p>
          </Card>
        </div>
      )}

      <div className="w-full max-w-md space-y-6 fade-in">
        {/* Logo e Título */}
        <div className="text-center space-y-4">
          <img src={logoImg} alt="Logo" className="mx-auto w-30 h-30 rounded-2xl shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold text-white">BoraProRacha!</h1>
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
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-appsociety-blue hover:underline"
                        onClick={() => {
                          setForgotEmail(loginData.email || '');
                          setIsForgotOpen(true);
                          setError('');
                          setForgotMessage('');
                        }}
                      >
                        Esqueceu a senha?
                      </button>
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
                        onChange={(e) => {
                          const senha = e.target.value;
                          setRegisterData({ ...registerData, password: senha });
                          setSenhaFeedback(validarSenhaForte(senha));
                        }}
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
                    {registerData.password.length > 0 && !senhaFeedback.valido && (
                      <ul className="text-red-700 text-xs mt-2 mb-2">
                        {senhaFeedback.erros.map((erro, i) => <li key={i}>{erro}</li>)}
                      </ul>
                    )}
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-appsociety-green hover:bg-green-600 text-white font-semibold"
                    disabled={isLoading || !senhaFeedback.valido}
                  >
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Links para Termos e Política mantidos */}
        <div className="text-center text-sm text-white">
          <p>Ao criar uma conta, você concorda com nossos</p>
          <p>
            <button
              type="button"
              className="text-appsociety-blue hover:underline mr-1"
              onClick={() => setShowTermsModal(true)}
            >
              Termos de Uso
            </button>
            e
            <button
              type="button"
              className="text-appsociety-blue hover:underline ml-1"
              onClick={() => setShowPrivacyModal(true)}
            >
              Política de Privacidade
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
// Componente de Política de Privacidade dentro do modal
function PrivacyPolicyContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-2">Política de Privacidade</h1>
      <p className="mb-4 font-medium text-gray-700">
        Ao acessar nosso site ou baixar o aplicativo <strong>BoraProRacha</strong>, você concorda com esta Política de Privacidade e com o tratamento dos seus dados pessoais, de acordo com a LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018).
      </p>
      <p>Coletamos apenas os dados necessários para o funcionamento da plataforma, incluindo:</p>
      <ul className="list-disc list-inside mb-2">
        <li>Informações de cadastro: nome, e-mail, nome de usuário;</li>
        <li>Informações de perfil: avatar, dados do time e cargos;</li>
        <li>Dados de participação: histórico de jogos, convites aceitos e pagamentos;</li>
        <li>Dados técnicos: IP, tipo de navegador e informações de dispositivo para melhoria da plataforma.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">2. Uso dos Dados</h2>
      <p>Seus dados são utilizados para:</p>
      <ul className="list-disc list-inside mb-2">
        <li>Permitir o cadastro e login de usuários;</li>
        <li>Gerenciar times, jogos, convites e pagamentos;</li>
        <li>Enviar notificações e atualizações relevantes;</li>
        <li>Melhorar a experiência e segurança do sistema.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">3. Compartilhamento de Dados</h2>
      <p>Não compartilhamos seus dados pessoais com terceiros para fins comerciais. Compartilhamentos podem ocorrer apenas quando:</p>
      <ul className="list-disc list-inside mb-2">
        <li>Exigido por lei ou ordem judicial;</li>
        <li>Necessário para prestação de serviços essenciais, como processamento de pagamentos;</li>
        <li>Autorizado por você previamente.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">4. Segurança dos Dados</h2>
      <p>Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados, vazamentos ou alterações indevidas. O acesso aos dados pessoais é restrito apenas a pessoas autorizadas.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">5. Direitos do Usuário</h2>
      <p>Em conformidade com a LGPD, você tem direito de:</p>
      <ul className="list-disc list-inside mb-2">
        <li>Acessar e corrigir seus dados pessoais;</li>
        <li>Solicitar a exclusão de seus dados;</li>
        <li>Revogar consentimentos concedidos;</li>
        <li>Solicitar portabilidade dos dados para outro serviço;</li>
        <li>Obter informações sobre o compartilhamento de seus dados.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">6. Contato</h2>
      <p>Em caso de dúvidas sobre esta política ou sobre seus dados pessoais, você pode entrar em contato pelo e-mail: <strong>contato@boraproracha.com.br</strong>.</p>

      <p className="mt-4 text-gray-500 text-sm">
        Esta Política de Privacidade pode ser atualizada periodicamente. Recomendamos que revise esta página regularmente.
      </p>
    </div>
  )
}

// Componente de Termos de Uso
function TermsOfUseContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-2">Termos de Uso</h1>

      <h2 className="text-xl font-semibold mt-4 mb-2">1. Introdução</h2>
      <p>
        Bem-vindo ao <strong>BoraProRacha</strong>. Estes Termos de Uso constituem um contrato legal entre você, usuário, e a plataforma <strong>BoraProRacha</strong>, regulamentando o acesso e utilização de nossos serviços. Ao utilizar a plataforma, você concorda com todas as condições aqui descritas.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">2. Objetivo</h2>
      <p>
        O objetivo destes Termos de Uso é definir regras de uso, direitos e responsabilidades tanto do usuário quanto da plataforma, garantindo uma experiência segura, organizada e em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">3. Uso do Serviço</h2>
      <p>
        Você concorda em utilizar a plataforma apenas para fins legais e de acordo com as normas estabelecidas neste documento. É proibido:
      </p>
      <ul className="list-disc list-inside mb-2">
        <li>Utilizar a plataforma para praticar atos ilícitos ou contrários à legislação vigente;</li>
        <li>Compartilhar conteúdo ofensivo, discriminatório, difamatório ou que viole direitos de terceiros;</li>
        <li>Tentar acessar contas de outros usuários sem autorização;</li>
        <li>Modificar, distribuir ou reproduzir de forma não autorizada qualquer recurso da plataforma.</li>
      </ul>
      <p>O uso da plataforma deve respeitar as regras de conduta, mantendo um ambiente seguro e saudável para todos os usuários.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">4. Direitos Autorais e Propriedade Intelectual</h2>
      <p>
        Todo o conteúdo disponibilizado na plataforma, incluindo textos, imagens, design, logos, ícones, software e códigos, é de propriedade exclusiva do <strong>BoraProRacha</strong> ou de seus licenciadores. É proibido copiar, reproduzir, modificar, distribuir ou criar obras derivadas sem autorização expressa da plataforma.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">5. Limitação de Responsabilidade</h2>
      <p>
        O <strong>BoraProRacha</strong> se esforça para garantir a disponibilidade, segurança e precisão das informações, mas não se responsabiliza por:
      </p>
      <ul className="list-disc list-inside mb-2">
        <li>Danose diretos ou indiretos decorrentes do uso da plataforma;</li>
        <li>Perda de dados ou interrupções temporárias do serviço;</li>
        <li>Condutas de terceiros ou ações externas à plataforma.</li>
      </ul>
      <p>O usuário reconhece que utiliza o serviço por sua própria conta e risco.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">6. Suspensão ou Encerramento de Contas</h2>
      <p>
        A plataforma reserva-se o direito de suspender ou encerrar contas de usuários que:
      </p>
      <ul className="list-disc list-inside mb-2">
        <li>Descumpram qualquer termo destes Termos de Uso;</li>
        <li>Pratiquem atos ilícitos ou prejudiciais a outros usuários;</li>
        <li>Violarem direitos de propriedade intelectual da plataforma ou de terceiros.</li>
      </ul>
      <p>O encerramento de contas não exime o usuário de responsabilidades legais ou obrigações financeiras pendentes.</p>

      <h2 className="text-xl font-semibold mt-4 mb-2">7. Política de Pagamentos</h2>
      <p>
        Se aplicável, os serviços pagos da plataforma seguem as condições descritas:
      </p>
      <ul className="list-disc list-inside mb-2">
        <li>Pagamentos são processados de forma segura e transparente, por meio da respectiva loja de aplicativos;</li>
        <li>Não há reembolso para assinaturas ou serviços consumidos, salvo em casos previstos em lei;</li>
        <li>O usuário é responsável por manter informações de pagamento atualizadas e corretas.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-4 mb-2">8. Proteção de Dados</h2>
      <p>
        Todos os dados pessoais coletados são tratados de acordo com a <strong>Política de Privacidade</strong> da plataforma e em conformidade com a LGPD. O usuário tem direito a acessar, corrigir ou solicitar exclusão de seus dados pessoais, bem como revogar consentimentos previamente concedidos.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">9. Alterações dos Termos</h2>
      <p>
        O <strong>BoraProRacha</strong> pode atualizar estes Termos de Uso periodicamente. Mudanças relevantes serão comunicadas e os usuários deverão concordar com os novos termos para continuar utilizando a plataforma.
      </p>

      <h2 className="text-xl font-semibold mt-4 mb-2">10. Contato</h2>
      <p>
        Em caso de dúvidas sobre estes Termos de Uso ou sobre a plataforma, você pode entrar em contato pelo e-mail: <strong>contato@boraproracha.com.br</strong>.
      </p>
    </div>
  )
}
