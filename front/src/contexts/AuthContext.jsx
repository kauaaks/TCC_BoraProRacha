import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getIdToken,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../services/ConfigFirebase";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const API_BASE_URL = "http://localhost:5000";

  const mergeUser = (firebaseUser, mongoUser) => {
    if (!firebaseUser) return mongoUser || null;
    if (!mongoUser) return firebaseUser;

    return {
      ...firebaseUser,
      ...mongoUser,
      nome: mongoUser.nome || firebaseUser.displayName || "",
    };
  };

  const fetchMongoUser = async (firebaseUid, idToken) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/firebase/${firebaseUid}?t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (!res.ok) return null;

      const data = await res.json();
      return data.user || data;
    } catch (err) {
      console.error("Erro ao buscar usuário no MongoDB:", err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser, true);
          setToken(idToken);
          localStorage.setItem("token", idToken);

          const mongoUser = await fetchMongoUser(firebaseUser.uid, idToken);

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


  const login = async (email, password) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await getIdToken(firebaseUser);

      setToken(idToken);
      localStorage.setItem("token", idToken);

      const mongoUser = await fetchMongoUser(firebaseUser.uid, idToken);

      const merged = mergeUser(firebaseUser, mongoUser);
      setUser(merged);


      await refreshUser();

      return { success: true, user: merged };
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, error: error.message };
    }
  };

 
  const register = async ({ email, password, nome, telefone, user_type }) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      const idToken = await getIdToken(firebaseUser);


      try { await updateProfile(firebaseUser, { displayName: nome }); } catch {}

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
        try { await firebaseUser.delete() } catch {}
        return { success: false, error: data.error || "Erro ao salvar usuário no MongoDB" };
      }

      const merged = mergeUser(firebaseUser, data);

      setUser(merged);
      setToken(idToken);
      localStorage.setItem("token", idToken);

      await refreshUser();

      return { success: true, user: merged };
    } catch (error) {
      console.error("Erro no registro:", error);
      return { success: false, error: error.message };
    }
  };


  const resetPassword = async (email) => {
    try {
      const actionCodeSettings = {
        url: "http://localhost:5173/login",
        handleCodeInApp: true
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      return { success: true };
    } catch (error) {
      console.error("Erro ao enviar redefinição de senha:", error);
      return { success: false, error: "Erro ao enviar email" };
    }
  };

 
  const logout = async () => {
    try {
      await signOut(auth);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    }
  };


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
      credentials: "include",
      cache: "no-store"
    });

    const data = await res.json().catch(() => ({ error: "Resposta inválida" }));

    if (!res.ok) throw new Error(data.error || "Erro na requisição");

    return data;
  };

  const updateUser = (partial) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : partial));
  };

  const syncMongoUser = async () => {
    const current = auth.currentUser;
    if (!current) return null;

    const idToken = await getIdToken(current, true);
    const mongoUser = await fetchMongoUser(current.uid, idToken);

    const merged = mergeUser(current, mongoUser);

    setUser(merged);
    return merged;
  };

  const refreshUser = async () => {
    const current = auth.currentUser;

    if (current) {
      try { await current.reload(); }
      catch (err) {
        console.error("Erro ao recarregar Firebase:", err);
      }
    }

    return await syncMongoUser();
  };

  const value = {
    user,
    loading,
    login,
    register,
    resetPassword,
    logout,
    apiCall,
    setUser,
    updateUser,
    syncMongoUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
