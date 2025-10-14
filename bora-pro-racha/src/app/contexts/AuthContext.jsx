import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const API_BASE_URL = 'http://localhost:5000/api/v1'

  useEffect(() => {
    if (token) {
      // Verificar se o token é válido
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'        
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        // Token inválido
        console.warn('Perfil não carregado. Verifique o token ou CORS.')
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },        
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.access_token)
        setUser(data.user)
        localStorage.setItem('token', data.access_token)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.access_token)
        setUser(data.user)
        localStorage.setItem('token', data.access_token)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    credentials: 'include',
    ...options
  }

  try {
    const response = await fetch(url, config)
    
    // Verificar se a resposta tem conteúdo JSON
    let data
    try {
      data = await response.json()
    } catch (e) {
      data = { error: 'Resposta inválida do servidor' }
    }

    if (response.status === 401) {
      // Token expirado ou inválido
      logout()
      throw new Error('Sessão expirada')
    }

    if (response.status === 422) {
      // Tratar erro 422 sem quebrar a aplicação
      console.warn('Erro 422 - dados não processáveis:', data)
      return { error: data.error || 'Dados não puderam ser processados', data: [] }
    }

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição')
    }

    return data
  } catch (error) {
    console.error('Erro na API:', error)
    // Retornar dados vazios em vez de lançar erro para manter a aplicação funcionando
    return { error: error.message, data: [] }
  }
}

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    apiCall
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}