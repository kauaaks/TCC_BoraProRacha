import { createContext, useContext, useState, useEffect } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  getIdToken,
  updateProfile
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

  // 🔹 Função para buscar usuário do Mongo pelo UID Firebase
  const fetchMongoUser = async (firebaseUid, idToken) => {
    try {
      const res = await fetch(`http://localhost:5000/users/firebase/${firebaseUid}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })

      if (!res.ok) {
        console.warn('Usuário não encontrado no MongoDB. Código:', res.status)
        return null
      }

      return await res.json()
    } catch (err) {
      console.error('Erro ao buscar usuário no MongoDB:', err)
      return null
    }
  }

  // 🔹 Monitora mudanças de login do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser, true)
          setToken(idToken)
          localStorage.setItem('token', idToken)

          const mongoUser = await fetchMongoUser(firebaseUser.uid, idToken)

          // 🔹 Sincroniza displayName com nome do Mongo, se necessário
          if (mongoUser?.nome && !firebaseUser.displayName) {
            await updateProfile(firebaseUser, { displayName: mongoUser.nome })
          }

          const mergedUser = mongoUser
            ? { ...firebaseUser, ...mongoUser }
            : firebaseUser
            
          setUser(mergedUser)
        } catch (err) {
          console.error('Erro ao carregar dados do usuário:', err)
          setUser(null)
        }
      } else {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // 🔹 Login
  const login = async (email, password) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await getIdToken(firebaseUser)
      setToken(idToken)
      localStorage.setItem('token', idToken)

      const mongoUser = await fetchMongoUser(firebaseUser.uid, idToken)

      if (mongoUser?.nome && !firebaseUser.displayName)
        await updateProfile(firebaseUser, { displayName: mongoUser.nome })

      const mergedUser = mongoUser ? { ...firebaseUser, ...mongoUser } : firebaseUser
      setUser(mergedUser)

      return { success: true, user: mergedUser }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: error.message }
    }
  }

  // 🔹 Registro
  const register = async ({ email, password, nome, telefone, user_type }) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await getIdToken(firebaseUser)

      // 🔸 Atualiza nome no Firebase
      await updateProfile(firebaseUser, { displayName: nome })

      const res = await fetch('http://localhost:5000/users/', {
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

      const data = await res.json()
      if (!res.ok) {
        await firebaseUser.delete()
        return { success: false, error: data.error || 'Erro ao salvar usuário no MongoDB' }
      }

      const mergedUser = { ...firebaseUser, ...data }
      setUser(mergedUser)
      setToken(idToken)
      localStorage.setItem('token', idToken)

      return { success: true, user: mergedUser }
    } catch (error) {
      console.error('Erro no registro:', error)
      return { success: false, error: error.message }
    }
  }

  // 🔹 Logout
  const logout = async () => {
    try {
      await signOut(auth)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
    }
  }

  // 🔹 Requisições à API autenticadas
  const apiCall = async (endpoint, options = {}) => {
    const API_BASE_URL = 'http://localhost:5000'
    const currentToken = token || localStorage.getItem('token')

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        ...options.headers,
      },
      credentials: 'include',
    })

    let data
    try {
      data = await res.json()
    } catch {
      data = { error: 'Resposta inválida do servidor' }
    }

    if (res.status === 401) {
      console.warn('Token expirado, deslogando...')
      logout()
      throw new Error('Sessão expirada')
    }

    if (!res.ok) {
      throw new Error(data.error || 'Erro na requisição')
    }

    return data
  }

  const value = { user, loading, login, register, logout, apiCall }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
