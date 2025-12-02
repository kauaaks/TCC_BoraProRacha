import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Pencil, Image as ImageIcon, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Profile() {
  const { user, apiCall, refreshUser } = useAuth();

  const displayName = user?.nome || user?.displayName || "";
  const username =
    user?.username ||
    (displayName?.replace(/\s/g, "").toLowerCase() ||
      user?.email?.split("@")[0]);

  const initialAvatar = user?.avatar
    ? `${API_BASE_URL}${user.avatar}`
    : undefined;

  const [showNameModal, setShowNameModal] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Modal Trocar Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl(`${API_BASE_URL}${user.avatar}`);
    }
  }, [user?.avatar]);

  useEffect(() => {
    if (user) {
      setName(user?.nome || user?.displayName || "");
      setNewEmail(user?.email || "");
    }
  }, [user]);

  const openName = () => {
    setName(user?.nome || user?.displayName || "");
    setShowNameModal(true);
  };

  // Atualiza apenas no backend (Mongo), usando /users/me
  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Informe um nome válido.");
      return;
    }

    try {
      setLoading(true);

      const res = await apiCall("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: trimmed }),
      });

      if (res?.error) {
        alert(res.error || "Falha ao atualizar nome");
        return;
      }

      await refreshUser();
      setShowNameModal(false);
    } catch (err) {
      console.error("Erro ao atualizar nome:", err);
      alert("Erro ao atualizar nome. Tente novamente.");
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

      if (!res?.success) {
        alert(res?.message || "Falha ao atualizar avatar");
        return;
      }

      const updatedUser = await refreshUser();

      if (updatedUser?.avatar) {
        setAvatarUrl(`${API_BASE_URL}${updatedUser.avatar}`);
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

  // Troca de e-mail: reautentica no Firebase, dispara verificação e depois atualiza o backend
  const saveEmail = async () => {
    try {
      setEmailLoading(true);

      const trimmedEmail = newEmail.trim();

      if (!trimmedEmail) {
        alert("Informe um e-mail válido.");
        return;
      }

      if (trimmedEmail.toLowerCase() === user.email.toLowerCase()) {
        alert("O novo e-mail é igual ao atual.");
        return;
      }

      if (!emailPassword.trim()) {
        alert("Digite sua senha atual para confirmar.");
        return;
      }

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Usuário não autenticado. Faça login novamente.");
        return;
      }

      // reautentica com a senha atual
      const credential = EmailAuthProvider.credential(
        user.email,
        emailPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // dispara e-mail de verificação para o NOVO e-mail
      await verifyBeforeUpdateEmail(currentUser, trimmedEmail, {
        url: window.location.origin + "/profile",
        handleCodeInApp: false,
      });

      // atualiza e-mail no backend
      const res = await apiCall("/users/me/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: trimmedEmail }),
      });

      if (res?.error) {
        alert(
          res.error || "Não foi possível atualizar o e-mail no servidor."
        );
        return;
      }

      await refreshUser();

      setShowEmailModal(false);
      alert(
        "Enviamos um link de confirmação para o novo e-mail. Confirme lá para concluir a troca."
      );
    } catch (err) {
      console.error("Erro ao atualizar e-mail:", err);
      if (err.code === "auth/wrong-password") {
        alert("Senha atual incorreta.");
      } else if (err.code === "auth/email-already-in-use") {
        alert("Este e-mail já está em uso.");
      } else if (err.code === "auth/invalid-email") {
        alert("E-mail inválido.");
      } else if (err.code === "auth/operation-not-allowed") {
        alert(
          "Operação não permitida na configuração atual do Firebase. Verifique as opções de login do projeto."
        );
      } else {
        alert("Erro ao atualizar e-mail. Tente novamente.");
      }
    } finally {
      setEmailLoading(false);
    }
  };

  // Troca de senha
  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert("Preencha todos os campos da senha");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("A confirmação não corresponde à nova senha.");
      return;
    }
    if (newPassword === currentPassword) {
      alert("A nova senha deve ser diferente da senha atual.");
      return;
    }
    if (newPassword.length < 8) {
      alert("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setPasswordLoading(true);
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("Usuário não autenticado. Faça login novamente.");
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, newPassword);

      alert("Senha atualizada com sucesso!");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/wrong-password") {
        alert("Senha atual incorreta.");
      } else if (err.code === "auth/weak-password") {
        alert("Senha nova muito fraca.");
      } else {
        alert("Erro ao atualizar senha. Tente novamente.");
      }
    } finally {
      setPasswordLoading(false);
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

          <div className="flex items-center justify-between">
            <span className="font-normal text-sm text-gray-600 w-40">
              Senha
            </span>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs border border-gray-200 shadow"
            >
              <Lock className="w-4 h-4" />
              Trocar senha
            </button>
          </div>
        </div>

        {/* Rodapé e links */}
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

      {/* Modal Trocar Nome */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
            <h3 className="font-bold text-2xl text-gray-700 select-none">
              Alterar nome completo
            </h3>
            <input
              className="rounded-lg border border-black-300 p-3 placeholder:text-black-300 focus:outline-none focus:ring-2 focus:ring-appsociety-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
            <div className="flex justify-end gap-4 pt-4 border-t border-black-200">
              <button
                onClick={() => setShowNameModal(false)}
                className="px-6 py-3 font-semibold rounded-full border border-green-400 text-appsociety-green transition hover:bg-green-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveName}
                disabled={loading || !name?.trim()}
                className="px-6 py-3 font-semibold rounded-full bg-appsociety-green text-white shadow-md transition hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Trocar E-mail */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
            <h3 className="font-bold text-2xl text-gray-700 select-none">
              Alterar e-mail
            </h3>

            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 select-none">
              Novo e-mail
            </label>
            <input
              className="rounded-lg border border-black-300 p-3 placeholder:text-black-300 focus:outline-none focus:ring-2 focus:ring-appsociety-black"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="novoemail@exemplo.com"
            />

            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 select-none">
              Senha atual
            </label>
            <input
              className="rounded-lg border border-black-300 p-3 placeholder:text-black-300 focus:outline-none focus:ring-2 focus:ring-appsociety-black"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Digite sua senha"
            />

            <div className="flex justify-end gap-4 pt-4 border-t border-black-200">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-6 py-3 font-semibold rounded-full border border-green-400 text-appsociety-green transition hover:bg-green-50 disabled:opacity-50"
                disabled={emailLoading}
              >
                Cancelar
              </button>
              <button
                onClick={saveEmail}
                disabled={
                  emailLoading || !newEmail.trim() || !emailPassword.trim()
                }
                className="px-6 py-3 font-semibold rounded-full bg-appsociety-green text-white shadow-md transition hover:bg-green-700 disabled:opacity-50"
              >
                {emailLoading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Trocar Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col gap-6">
            <h3 className="font-bold text-2xl text-gray-700 select-none">
              Trocar Senha
            </h3>

            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 select-none">
              Senha atual
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="rounded-lg border border-black-700 p-3 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-appsociety-green"
                autoComplete="current-password"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 select-none">
              Nova senha
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha (mínimo 8 caracteres)"
                className="rounded-lg border border-black-700 p-3 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-appsociety-green"
                autoComplete="new-password"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700 select-none">
              Confirmar nova senha
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="rounded-lg border border-black-700 p-3 placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-appsociety-green"
                autoComplete="new-password"
              />
            </label>

            <div className="flex justify-end gap-4 pt-4 border-t border-black-200">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={passwordLoading}
                className="px-6 py-3 font-semibold rounded-full border border-green-400 text-appsociety-green transition hover:bg-green-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={savePassword}
                disabled={passwordLoading}
                className="px-6 py-3 font-semibold rounded-full bg-appsociety-green text-white shadow-md transition hover:bg-green-700 disabled:opacity-50"
              >
                {passwordLoading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
