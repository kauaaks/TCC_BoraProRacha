import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Pencil, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
} from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Profile() {
  const { user, apiCall, setUser } = useAuth();

  const displayName = user?.nome || user?.displayName || "";
  const username =
    user?.username ||
    (displayName?.replace(/\s/g, "").toLowerCase() ||
      user?.email?.split("@")[0]);

  const initialAvatar =
    user?.avatar ? `${API_BASE_URL}${user.avatar}` : undefined;

  const [showNameModal, setShowNameModal] = useState(false);
  const [name, setName] = useState(displayName);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(`${API_BASE_URL}${user.avatar}`);
    }
  }, [user?.avatar]);

  const openName = () => {
    setName(user?.nome || user?.displayName || "");
    setShowNameModal(true);
  };

  const saveName = async () => {
    try {
      setLoading(true);
      const res = await apiCall("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: name }),
      });
      if (res?.user) {
        setUser(res.user);
        setShowNameModal(false);
      } else {
        alert(res?.message || "Falha ao atualizar nome");
      }
    } finally {
      setLoading(false);
    }
  };

  const onPickAvatar = () => fileInputRef.current?.click();

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Imagem até 2MB");
      e.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setAvatarUrl(localPreview);

    const fd = new FormData();
    fd.append("avatar", file);

    try {
      setUploadingAvatar(true);
      const res = await apiCall("/perfil/avatar", {
        method: "PATCH",
        body: fd,
      });

      if (res?.success && res?.user) {
        setUser(res.user);
        if (res.user.avatar) {
          setAvatarUrl(`${API_BASE_URL}${res.user.avatar}`);
        }
      } else {
        alert(res?.message || "Falha ao atualizar avatar");
      }
    } catch (err) {
      console.error("Erro ao atualizar avatar:", err);
      alert("Erro ao atualizar avatar");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const openEmailModal = () => {
    setNewEmail(user?.email || "");
    setEmailPassword("");
    setShowEmailModal(true);
  };

  const saveEmail = async () => {
    try {
      setEmailLoading(true);

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !user?.email) {
        alert("Usuário não autenticado. Faça login novamente.");
        return;
      }

      const trimmedEmail = newEmail.trim();

      if (!trimmedEmail) {
        alert("Informe um e-mail válido.");
        return;
      }

      if (trimmedEmail.toLowerCase() === user.email.toLowerCase()) {
        alert("O novo e-mail é igual ao atual.");
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        emailPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      await verifyBeforeUpdateEmail(currentUser, trimmedEmail, {
        url: window.location.origin + "/profile",
        handleCodeInApp: false,
      }); 

      const res = await apiCall("/users/me/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: trimmedEmail }),
      });

      if (res?.error) {
        alert(res.error || "Não foi possível atualizar o e-mail no servidor");
        return;
      }

      setUser((prev) => ({
        ...prev,
        email: trimmedEmail,
      }));

      setShowEmailModal(false);
      alert(
        "Enviamos um link de confirmação para o novo e-mail. Só depois de clicar nele o login será atualizado."
      );
    } catch (err) {
      console.error("Erro ao atualizar e-mail:", err);

      if (err?.code === "auth/wrong-password") {
        alert("Senha incorreta. Tente novamente.");
      } else if (err?.code === "auth/invalid-email") {
        alert("E-mail inválido.");
      } else if (err?.code === "auth/email-already-in-use") {
        alert("Este e-mail já está em uso em outra conta.");
      } else if (err?.code === "auth/requires-recent-login") {
        alert(
          "Por segurança, faça login novamente e tente mudar o e-mail de novo."
        );
      } else if (err?.code === "auth/operation-not-allowed") {
        alert(
          "O Firebase exige verificação do novo e-mail. Verifique se recebeu o link de confirmação."
        );
      } else {
        alert("Erro ao atualizar e-mail. Tente novamente.");
      }
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-14 px-4">
      <div
        className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        style={{ boxShadow: "0 2px 24px rgba(32, 56, 96, 0.08)" }}
      >
        <h2 className="text-xl font-bold mb-6 text-gray-800">Conta</h2>

        <div className="border-b border-gray-200 pb-6 mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover bg-gray-200 shadow"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00B04F] to-[#2196F3] flex items-center justify-center text-xl font-bold text-white shadow">
                {displayName?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U"}
              </div>
            )}

            <div>
              <div className="font-semibold text-base text-gray-900">
                {displayName}
              </div>
              <div className="text-sm text-gray-500">{username}</div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
            <button
              onClick={onPickAvatar}
              disabled={uploadingAvatar}
              className="ml-auto px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs border border-gray-200 shadow disabled:opacity-60"
            >
              <ImageIcon className="w-4 h-4" />
              {uploadingAvatar ? "Enviando..." : "Alterar avatar"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-normal text-sm text-gray-600 w-40">
              Nome completo
            </span>
            <span className="font-medium text-gray-800">{displayName}</span>
            <button
              onClick={openName}
              className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs border border-gray-200 shadow"
            >
              <Pencil className="w-4 h-4" />
              Mudar nome completo
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-normal text-sm text-gray-600 w-40">
              E-mail
            </span>
            <span className="font-medium text-gray-800 truncate max-w-xs">
              {user?.email}
            </span>
            <button
              onClick={openEmailModal}
              className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs border border-gray-200 shadow"
            >
              <Pencil className="w-4 h-4" />
              Mudar e-mail
            </button>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4 text-gray-800">Sistema</h2>
        <div className="text-gray-400 mb-2">
          BoraProRacha© {new Date().getFullYear()}
        </div>
        <div className="flex gap-2">
          <Link
            to="/terms-of-use"
            className="text-xs underline hover:text-[#00B04F]"
          >
            Termos de Uso
          </Link>
          <span>|</span>
          <Link
            to="/privacy-policy"
            className="text-xs underline hover:text-[#2196F3]"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>

      {showNameModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <h3 className="font-semibold mb-3">Alterar nome completo</h3>
            <input
              className="w-full border rounded px-3 py-2 mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNameModal(false)}
                className="px-3 py-2 rounded border"
              >
                Cancelar
              </button>
              <button
                onClick={saveName}
                disabled={loading || !name?.trim()}
                className="px-3 py-2 rounded bg-[#00B04F] text-white disabled:opacity-60"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm">
            <h3 className="font-semibold mb-3">Alterar e-mail</h3>

            <label className="text-sm text-gray-700 mb-1 block">
              Novo e-mail
            </label>
            <input
              className="w-full border rounded px-3 py-2 mb-3"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novoemail@exemplo.com"
            />

            <label className="text-sm text-gray-700 mb-1 block">
              Senha atual
            </label>
            <input
              className="w-full border rounded px-3 py-2 mb-4"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Digite sua senha"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-3 py-2 rounded border"
                disabled={emailLoading}
              >
                Cancelar
              </button>
              <button
                onClick={saveEmail}
                disabled={
                  emailLoading || !newEmail.trim() || !emailPassword.trim()
                }
                className="px-3 py-2 rounded bg-[#00B04F] text-white disabled:opacity-60"
              >
                {emailLoading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
