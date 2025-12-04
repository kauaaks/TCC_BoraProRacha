import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar, Plus, Trophy } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Qr({ value, size = 220 }) {
  if (!value) return null;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    value
  )}`;
  return <img src={src} alt="QR Code" className="rounded border" />;
}

export default function TeamRepDashboard({ data, teamId }) {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();

  const teamsCount = Array.isArray(data?.teams) ? data.teams.length : 0;

  // total de jogadores de todos os meus times
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const res = await apiCall("/teams/meustimes");
        const list = Array.isArray(res?.teams) ? res.teams : res || [];

        const membersCounts = await Promise.all(
          list.map(async (team) => {
            try {
              const mRes = await apiCall(`/teams/${team._id || team.id}/members`);
              const members = Array.isArray(mRes?.members) ? mRes.members : mRes || [];
              return members.length;
            } catch {
              return 0;
            }
          })
        );

        const sum = membersCounts.reduce((acc, n) => acc + n, 0);
        setTotalPlayers(sum);
      } catch {
        setTotalPlayers(0);
      }
    }

    loadPlayers();
  }, [apiCall]);

  const goToStats = () => {
    navigate("/Stats");
  };

  const goToMyTeams = () => {
    navigate("/my-team");
  };

    const goToGames = () => {
    navigate("/Games");
  };

  // criação de time
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    description: "",
    monthly_fee: "",
    firstMonth: "",
  });
  const setF = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const isYYYYMM = (s) => /^\d{4}-\d{2}$/.test(String(s || "").trim());
  const ymToDate = (ym) => {
    const m = String(ym || "").trim();
    if (!isYYYYMM(m)) return null;
    const [y, mm] = m.split("-").map(Number);
    return new Date(y, mm - 1, 1, 0, 0, 0, 0);
  };

  const criarTime = async () => {
    const { nome, description, monthly_fee, firstMonth } = form;
    if (!nome || !description || !monthly_fee || !firstMonth) {
      alert("Preencha nome, descrição, mensalidade e mês inicial (YYYY-MM).");
      return;
    }
    const d = ymToDate(firstMonth);
    if (!d) {
      alert("Mês inválido. Use YYYY-MM.");
      return;
    }
    try {
      setCreating(true);
      const body = {
        nome,
        description,
        monthly_fee: Number(monthly_fee),
        next_payment_date: d.toISOString(),
      };
      const res = await apiCall("/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res || res.error) {
        alert(res?.error || "Falha ao criar time");
        return;
      }
      setCreateOpen(false);
      setForm({ nome: "", description: "", monthly_fee: "", firstMonth: "" });
      alert("Time criado com sucesso!");
    } catch (e) {
      alert(e?.message || "Erro ao criar time");
    } finally {
      setCreating(false);
    }
  };

  const effectiveTeamId = useMemo(
    () => teamId || data?.teams?.[0]?.id || data?.teams?.[0]?._id || null,
    [teamId, data]
  );

  const fullName = useMemo(
    () => (user?.nome || user?.displayName || user?.name || "").trim(),
    [user]
  );
  const firstName = useMemo(
    () => (fullName ? fullName.split(" ")[0] : ""),
    [fullName]
  );

  useEffect(() => {
    const needsRefresh = !user?.nome && (user?.displayName || user?.uid);
    if (!needsRefresh) return;
    let ignore = false;
    (async () => {
      try {
        await apiCall("/users/me?t=" + Date.now()).catch(() => null);
      } catch {}
      if (!ignore) {
        // poderia setar algum estado de perfil, se necessário
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user?.nome, user?.displayName, user?.uid, apiCall]);

  const [invite, setInvite] = useState(null);
  const [open, setOpen] = useState(false);
  const inviteUrl = invite?.url || "";
  const inviteToken = invite?.token || "";
  const inviteExpires = invite?.expiraEm
    ? new Date(invite.expiraEm).toLocaleString("pt-BR")
    : null;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copiado!");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Copiado!");
    }
  };

  const gerarConvite = async () => {
    if (!effectiveTeamId) {
      alert("Selecione um time primeiro.");
      return;
    }
    try {
      const res = await apiCall("/invite/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeId: effectiveTeamId }),
      });
      if (res?.invite) setInvite(res.invite);
      else alert(res?.error || "Falha ao gerar convite");
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar convite");
    }
  };

  useEffect(() => {
    if (open) gerarConvite();
  }, [open]);

  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          BoraProRacha, {firstName}!
        </h1>
        <p className="text-gray-600">
          Representante •{" "}
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:shadow-md transition"
          variant="outline"
          onClick={goToMyTeams}
        >
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Times</CardTitle>
            <Users />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teamsCount}</div>
            <p className="text-sm text-gray-500 mt-1">
              Quantidade de times que você representa.
            </p>
          </CardContent>
        </Card>

        <Card variant="outline">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Jogadores nos seus times</CardTitle>
            <Users />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPlayers}</div>
            <p className="text-sm text-gray-500 mt-1">
              Soma de jogadores cadastrados em todos os seus times.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie seus times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Novo Time */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-20 flex-col space-y-2">
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">Novo Time</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar novo time</DialogTitle>
                  <DialogDescription>
                    Informe os dados básicos do seu time
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Nome</label>
                    <Input
                      value={form.nome}
                      onChange={setF("nome")}
                      placeholder="Ex: BoraProRacha FC"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Descrição</label>
                    <Input
                      value={form.description}
                      onChange={setF("description")}
                      placeholder="Ex: Time de Fut7 Amador"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Mensalidade (R$)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.monthly_fee}
                      onChange={setF("monthly_fee")}
                      placeholder="Ex: 50.00"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">
                      Primeiro mês (YYYY-MM)
                    </label>
                    <Input
                      value={form.firstMonth}
                      onChange={setF("firstMonth")}
                      placeholder="YYYY-MM"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setCreateOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={criarTime} disabled={creating}>
                      {creating ? "Criando..." : "Criar time"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Agendar jogo */}
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={goToGames}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Agendar Jogo</span>
            </Button>

            {/* Ver estatísticas */}
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={goToStats}
            >
              <Trophy className="w-6 h-6" />
              <span className="text-sm">Ver Estatísticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
