import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Pencil, Image as ImageIcon } from "lucide-react";

export default function Profile() {
  const { user, apiCall, setUser } = useAuth();

  // exibição
  const displayName = user?.nome || user?.displayName || "";
  const username =
    user?.username ||
    (displayName?.replace(/\s/g, "").toLowerCase() ||
      user?.email?.split("@")[0]);

  // estado local
  const [showNameModal, setShowNameModal] = useState(false);
  const [name, setName] = useState(displayName);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const openName = () => {
    setName(user?.nome || user?.displayName || "");
    setShowNameModal(true);
  };

  const saveName = async () => {
    try {
      setLoading(true);
      // Backend: PATCH /users/me aceita { nome }
      const res = await apiCall("/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: name })
      });
      if (res?.user) {
        setUser(res.user); // atualiza contexto → dashboard reflete novo nome
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
      return;
    }
    const fd = new FormData();
    fd.append("avatar", file);

    // Ajuste esta rota quando criar o endpoint de avatar no back
    const res = await apiCall("/users/me/avatar", { method: "PUT", body: fd });
    if (res?.user) {
      setUser(res.user);
    } else {
      alert(res?.message || "Falha ao atualizar avatar");
    }
    e.target.value = "";
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
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00B04F] to-[#2196F3] flex items-center justify-center text-xl font-bold text-white shadow">
              {displayName?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
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
              className="ml-auto px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-xs border border-gray-200 shadow"
            >
              <ImageIcon className="w-4 h-4" />
              Alterar avatar
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
            <span className="font-medium text-gray-800">{user?.email}</span>
            <div className="w-28" />
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4 text-gray-800">Sistema</h2>
        <div className="text-gray-400 mb-2">
          Bora Pro Racha © {new Date().getFullYear()}
        </div>
        <div className="flex gap-2">
          <a href="#" className="text-xs underline hover:text-[#00B04F]">
            Termos de Uso
          </a>
          <span>·</span>
          <a href="#" className="text-xs underline hover:text-[#2196F3]">
            Política de Privacidade
          </a>
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
    </div>
  );
}
