// src/components/forms/CriarUsuarioForm.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CriarUsuarioForm() {
  const { apiCall } = useAuth();

  const [creating, setCreating] = useState(false);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    user_type: "jogador",
    email: "",
    password: "",
    team_id: "",
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await apiCall("/teams");
        const list = res?.teams || (Array.isArray(res) ? res : []);
        setTeams(list);
      } catch (e) {
        console.error("Erro ao carregar times para o form de usuário:", e);
      }
    };
    fetchTeams();
  }, [apiCall]);

  const setF = (k) => (e) =>
    setForm((prev) => ({
      ...prev,
      [k]: e.target ? e.target.value : e,
    }));

  const criarUsuario = async () => {
    const { nome, telefone, user_type, email, password, team_id } = form;

    if (!nome || !telefone || !user_type || !email || !password) {
      alert("Preencha nome, telefone, tipo de usuário, e-mail e senha.");
      return;
    }

    try {
      setCreating(true);

      const body = {
        nome,
        telefone,
        user_type,
        email,
        password,
        team_id: team_id || null,
      };

      const res = await apiCall("/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res || res.error) {
        alert(res?.error || "Falha ao criar usuário");
        return;
      }

      alert("Usuário criado com sucesso!");
      setForm({
        nome: "",
        telefone: "",
        user_type: "jogador",
        email: "",
        password: "",
        team_id: "",
      });
    } catch (e) {
      alert(e?.message || "Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Novo usuário (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={form.nome}
            onChange={setF("nome")}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Nome completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input
            type="text"
            value={form.telefone}
            onChange={setF("telefone")}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de usuário</label>
          <select
            value={form.user_type}
            onChange={setF("user_type")}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="jogador">Jogador</option>
            <option value="representante_time">Representante de time</option>
            <option value="gestor_campo">Gestor de campo</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            value={form.email}
            onChange={setF("email")}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            value={form.password}
            onChange={setF("password")}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Senha inicial do usuário"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Vincular a um time (opcional)
          </label>
          <select
            value={form.team_id}
            onChange={setF("team_id")}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="">Nenhum</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <Button onClick={criarUsuario} disabled={creating}>
            {creating ? "Criando..." : "Criar usuário"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
