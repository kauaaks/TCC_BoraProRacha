import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Smartphone, Pencil, Image as ImageIcon } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  // username fallback
  const username = user?.username || (user?.displayName?.replace(/\s/g, '').toLowerCase() || user?.email?.split('@')[0])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-14 px-4">
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8" style={{ boxShadow: '0 2px 24px rgba(32, 56, 96, 0.08)' }}>
        {/* Seção: Conta */}
        <h2 className="text-xl font-bold mb-6 text-gray-800">Conta</h2>
        <div className="border-b border-gray-200 pb-6 mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00B04F] to-[#2196F3] flex items-center justify-center text-xl font-bold text-white shadow">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="font-semibold text-base text-gray-900">{user?.displayName}</div>
              <div className="text-sm text-gray-500">{username}</div>
            </div>
            <button className="ml-auto px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs border border-gray-200 shadow">
              <ImageIcon className="w-4 h-4" />
              Alterar avatar
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-normal text-sm text-gray-600 w-40">Nome completo</span>
            <span className="font-medium text-gray-800">{user?.displayName}</span>
            <button className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs border border-gray-200 shadow">
              <Pencil className="w-4 h-4" />
              Mudar nome completo
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-normal text-sm text-gray-600 w-40">Nome de usuário</span>
            <span className="font-medium text-gray-800">{username}</span>
            <button className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs border border-gray-200 shadow">
              <Pencil className="w-4 h-4" />
              Mudar nome de usuário
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-normal text-sm text-gray-600 w-40">E-mail</span>
            <span className="font-medium text-gray-800">{user?.email}</span>
            {/* Botão editar só se quiser adicionar */}
            <div className="w-28"></div>
          </div>
        </div>

        {/* Seção: Sistema/opções */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Sistema</h2>
        <div className="text-gray-400 mb-2">Bora Pro Racha © {new Date().getFullYear()}</div>
        <div className="flex gap-2">
          <a href="#" className="text-xs underline hover:text-[#00B04F]">Termos de Uso</a>
          <span>·</span>
          <a href="#" className="text-xs underline hover:text-[#2196F3]">Política de Privacidade</a>
        </div>
      </div>
    </div>
  )
}
