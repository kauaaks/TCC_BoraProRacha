import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getIdToken,
  updateProfile
} from "firebase/auth";
import { auth } from "../services/ConfigFirebase";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // expõe via context
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const API_BASE_URL = "http://localhost:5000";

  // helper: mescla dados do Firebase e do Mongo num objeto único para o app
  const mergeUser = (firebaseUser, mongoUser) => {
    if (!firebaseUser) return mongoUser || null;
    if (!mongoUser) return firebaseUser;
    return { ...firebaseUser, ...mongoUser };
  };

  // Busca usuário do Mongo pelo UID Firebase
  const fetchMongoUser = async (firebaseUid, idToken) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/firebase/${firebaseUid}`, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("Erro ao buscar usuário no MongoDB:", err);
      return null;
    }
  };

  // Observa sessão do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser, true);
          setToken(idToken);
          localStorage.setItem("token", idToken);

          const mongoUser = await fetchMongoUser(firebaseUser.uid, idToken);

          if (mongoUser?.nome && !firebaseUser.displayName) {
            await updateProfile(firebaseUser, { displayName: mongoUser.nome });
          }

          setUser(mergeUser(firebaseUser, mongoUser));
        } catch (err) {
          console.error("Erro ao carregar dados do usuário:", err);
          setUser(null);
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await getIdToken(firebaseUser);
      setToken(idToken);
      localStorage.setItem("token", idToken);

      const mongoUser = await fetchMongoUser(firebaseUser.uid, idToken);

      if (mongoUser?.nome && !firebaseUser.displayName) {
        await updateProfile(firebaseUser, { displayName: mongoUser.nome });
      }

      const merged = mergeUser(firebaseUser, mongoUser);
      setUser(merged);
      return { success: true, user: merged };
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, error: error.message };
    }
  };

  // Registro
  const register = async ({ email, password, nome, telefone, user_type }) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await getIdToken(firebaseUser);
      await updateProfile(firebaseUser, { displayName: nome });

      const res = await fetch(`${API_BASE_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          nome,
          telefone,
          user_type
        })
      });

      const data = await res.json();
      if (!res.ok) {
        await firebaseUser.delete();
        return { success: false, error: data.error || "Erro ao salvar usuário no MongoDB" };
      }

      const merged = mergeUser(firebaseUser, data);
      setUser(merged);
      setToken(idToken);
      localStorage.setItem("token", idToken);

      return { success: true, user: merged };
    } catch (error) {
      console.error("Erro no registro:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    }
  };

  // Requisições autenticadas (não força Content-Type quando body é FormData)
  const apiCall = async (endpoint, options = {}) => {
    const currentToken = token || localStorage.getItem("token");
    const isFormData = options?.body instanceof FormData;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
        ...(options.headers || {})
      },
      credentials: "include"
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: "Resposta inválida do servidor" };
    }

    if (res.status === 401) {
      console.warn("Token expirado, deslogando...");
      await logout();
      throw new Error("Sessão expirada");
    }

    if (!res.ok) {
      throw new Error(data.error || "Erro na requisição");
    }

    return data;
  };

  // Atualiza user do contexto após alterar no back
  const updateUser = (partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : partial));
  };

  // Sincroniza usuário consultando novamente o back
  const syncMongoUser = async () => {
    const current = auth.currentUser;
    if (!current) return null;
    const idToken = await getIdToken(current, true);
    const mongoUser = await fetchMongoUser(current.uid, idToken);
    const merged = mergeUser(current, mongoUser);
    setUser(merged);
    return merged;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    apiCall,
    setUser,        // exposto para casos como Profile
    updateUser,     // helper seguro
    syncMongoUser   // helper para revalidar no servidor
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
