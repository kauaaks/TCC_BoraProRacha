import { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  getIdToken
} from 'firebase/auth'
import { auth } from '../services/ConfigFirebase'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  // Busca usuário no MongoDB pelo firebaseUid
  const fetchMongoUser = async (firebaseUid, idToken) => {
    try {
      const res = await fetch(`http://localhost:5000/users/firebase/${firebaseUid}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      if (!res.ok) {
        console.warn('Usuário não encontrado no Mongo', res.status)
        return null
      }
      const data = await res.json()
      return data
    } catch (err) {
      console.error('Erro fetchMongoUser:', err.message)
      return null
    }
  }

  // Monitora mudanças de estado do usuário Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await getIdToken(firebaseUser)
        setToken(idToken)
        localStorage.setItem('token', idToken)

        const mongoUser = await fetchMongoUser(firebaseUser.uid, idToken)
        setUser(mongoUser ? { ...firebaseUser, ...mongoUser } : firebaseUser)
      } else {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // Login via Firebase + busca Mongo
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      const idToken = await getIdToken(firebaseUser)
      setToken(idToken)
      localStorage.setItem('token', idToken)

      const mongoUser = await fetchMongoUser(firebaseUser.uid, idToken)
      setUser(mongoUser ? { ...firebaseUser, ...mongoUser } : firebaseUser)
      return { success: true }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: error.message }
    }
  }

  // Registro via Firebase + Mongo
  const register = async ({ email, password, nome, telefone, user_type }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      const idToken = await getIdToken(firebaseUser)

      // Envia dados restantes para a API (Mongo)
      const response = await fetch('http://localhost:5000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          nome,
          telefone,
          user_type
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Deleta usuário do Firebase se falhar
        await firebaseUser.delete()
        return { success: false, error: data.error || 'Falha ao salvar dados do usuário na API' }
      }

      setUser({ ...firebaseUser, ...data })
      setToken(idToken)
      localStorage.setItem('token', idToken)
      return { success: true }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, error: error.message }
    }
  }

  // Logout
  const logout = () => {
    signOut(auth)
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  // Requisições à API com token
  const apiCall = async (endpoint, options = {}) => {
    const API_BASE_URL = 'http://localhost:5000'
    const url = `${API_BASE_URL}${endpoint}`
    const currentToken = token || localStorage.getItem('token')

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    }

    try {
      const response = await fetch(url, config)
      let data
      try { data = await response.json() } 
      catch (e) { data = { error: 'Resposta inválida do servidor' } }

      if (response.status === 401) {
        logout()
        throw new Error('Sessão expirada')
      }
      if (!response.ok) throw new Error(data.error || 'Erro na requisição')

      return data
    } catch (error) {
      console.error('Erro na API:', error)
      return { error: error.message, data: [] }
    }
  }

  const value = { user, loading, login, register, logout, apiCall }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
