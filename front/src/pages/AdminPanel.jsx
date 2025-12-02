import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react"; // no topo do arquivo


function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4 text-gray-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}

const mockCards = [
  { title: "Total de Usuários", value: 123 },
  { title: "Times Ativos", value: 18 },
  { title: "Usuários Pendentes", value: 4 },
];

const mockPendencias = [
  { id: 1, tipo: "Novo usuário", nome: "João Silva", data: "24/11/2025" },
  { id: 2, tipo: "Novo time", nome: "Real São Paulo", data: "24/11/2025" },
];

const mockLogs = [
  { id: 1, acao: "Usuário aprovado", usuario: "Admin", hora: "10:21" },
  { id: 2, acao: "Time deletado", usuario: "Admin", hora: "09:15" },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [pendencias, setPendencias] = useState([]);
  const [logs, setLogs] = useState([]);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openTeamModal, setOpenTeamModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setCards(mockCards);
      setPendencias(mockPendencias);
      setLogs(mockLogs);
    }, 350);
  }, []);

  if (!user || user.user_type !== "admin") {
    return <Navigate to="/" replace />;
  }

  const handleCreateUser = (e) => {
    e.preventDefault();
    setOpenUserModal(false);
    alert("Usuário criado (mock)");
  };
  const handleCreateTeam = (e) => {
    e.preventDefault();
    setOpenTeamModal(false);
    alert("Time criado (mock)");
  };

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold text-gray-900">Painel do Administrador</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-start shadow-sm"
          >
            <span className="font-semibold text-gray-600 text-base">{card.title}</span>
            <span className="font-bold text-2xl text-green-700 mt-2">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Pendências para aprovação</h2>
        {pendencias.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3 font-semibold text-gray-700 rounded-tl">Tipo</th>
                  <th className="py-2 px-3 font-semibold text-gray-700">Nome</th>
                  <th className="py-2 px-3 font-semibold text-gray-700">Data</th>
                  <th className="py-2 px-3 font-semibold text-gray-700 rounded-tr">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendencias.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                    <td className="py-2 px-3">{p.tipo}</td>
                    <td className="py-2 px-3">{p.nome}</td>
                    <td className="py-2 px-3">{p.data}</td>
                    <td className="py-2 px-3 flex gap-2">
                      <button
                        className="flex items-center gap-2 bg-green-800 hover:bg-green-700 text-white px-5 py-2 rounded-full font-semibold shadow transition-colors"
                      >
                        <Check className="w-5 h-5" />
                        Aprovar
                      </button>
                      <button
                        className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-5 py-2 rounded-full font-semibold shadow transition-colors"
                      >
                        <X className="w-5 h-5" />
                        Rejeitar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 py-2">Nenhuma pendência no momento.</p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Últimas atividades administrativas</h2>
        <ul className="pl-2 space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="text-gray-700">
              <span className="font-semibold text-green-700">{log.acao}</span>
              <span className="text-gray-600"> por {log.usuario} às {log.hora}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Ações rápidas</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setOpenUserModal(true)}
            className="bg-primary font-semibold text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Criar Usuário
          </button>
          <button
            onClick={() => setOpenTeamModal(true)}
            className="bg-primary font-semibold text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Criar Time
          </button>
          <button
            className="bg-gray-200 font-semibold text-gray-900 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            Gerenciar Papéis
          </button>
          <button
            className="bg-gray-200 font-semibold text-gray-900 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            Exportar Dados
          </button>
        </div>
      </div>

      <Modal
        open={openUserModal}
        onClose={() => setOpenUserModal(false)}
        title="Criar Usuário"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="email"
            placeholder="E-mail"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-green-700 text-white px-4 py-2 font-semibold rounded hover:bg-green-800 transition-colors"
          >
            Criar
          </button>
        </form>
      </Modal>

      <Modal
        open={openTeamModal}
        onClose={() => setOpenTeamModal(false)}
        title="Criar Time"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <input
            type="text"
            placeholder="Nome do Time"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-green-700 text-white px-4 py-2 font-semibold rounded hover:bg-green-800 transition-colors"
          >
            Criar Time
          </button>
        </form>
      </Modal>
    </div>
  );
}
