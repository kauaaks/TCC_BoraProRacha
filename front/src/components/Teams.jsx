import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Plus, Search, DollarSign, Calendar } from "lucide-react";

export default function Teams() {
  const { user, apiCall } = useAuth();
  const uid = user?.uid ? String(user.uid) : null;

  const [teams, setTeams] = useState([]);
  const [myTeams, setMyTeams] = useState([]); // /teams/meustimes
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newTeam, setNewTeam] = useState({
    nome: "",
    description: "",
    monthly_fee: 30
  });

  useEffect(() => {
    if (uid !== null) loadAll();
  }, [uid]);

  const loadAll = async (q) => {
    try {
      setLoading(true);
      const url = q && q.trim() ? `/teams?q=${encodeURIComponent(q.trim())}` : "/teams";

      const [allResp, mineResp] = await Promise.allSettled([
        apiCall(url),
        apiCall("/teams/meustimes")
      ]);

      const allList =
        allResp.status === "fulfilled" ? (allResp.value.teams || allResp.value || []) : [];
      const mineList =
        mineResp.status === "fulfilled" ? (mineResp.value.teams || mineResp.value || []) : [];

      setTeams(Array.isArray(allList) ? allList : []);
      setMyTeams(Array.isArray(mineList) ? mineList : []);

      if (allResp.status === "rejected") console.warn("Falha em /teams:", allResp.reason?.message);
      if (mineResp.status === "rejected") console.warn("Falha em /teams/meustimes:", mineResp.reason?.message);
    } catch (e) {
      console.error("Erro ao carregar times:", e);
      setError(e.message || "Erro ao carregar times");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uid === null) return;
    const t = setTimeout(() => loadAll(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm, uid]);

  // Normalização robusta: garante members como array e member_count sempre numérico
  const normalize = (t) => {
    const id = t._id || t.id || "";
    const createdBy = t.created_by || t.createdBy || t.owner_id || "";
    const toUidArray = (arr) =>
      (Array.isArray(arr) ? arr : [])
        .map((x) => {
          if (typeof x === "string" || typeof x === "number") return String(x);
          if (x && typeof x === "object") return String(x.firebaseUid || x.uid || x._id || x.id || "");
          return "";
        })
        .filter(Boolean);

    const membersSafe = Array.isArray(t.members) ? t.members : [];
    const repsRaw = Array.isArray(t.representatives) ? t.representatives : [];
    const representatives = toUidArray(repsRaw);

    return {
      id: String(id),
      nome: t.nome || t.name || "",
      description: t.description || "",
      monthly_fee: Number(t.monthly_fee ?? t.monthlyFee ?? 0),
      member_count: t.member_count ?? t.membersCount ?? membersSafe.length,
      is_active: typeof t.is_active === "boolean" ? t.is_active : t.isActive ?? true,
      created_at: t.created_at || t.createdAt || Date.now(),
      created_by: createdBy ? String(createdBy) : "",
      representatives,
      members: toUidArray(membersSafe) // nunca undefined
    };
  };

  const allNormalized = useMemo(() => (teams || []).map(normalize), [teams]);
  const myNormalized = useMemo(() => (myTeams || []).map(normalize), [myTeams]);

  const myTeamIds = useMemo(() => {
    const s = new Set();
    for (const t of myNormalized) if (t.id) s.add(t.id);
    return s;
  }, [myNormalized]);

  const myCreators = useMemo(() => {
    const s = new Set();
    for (const t of myNormalized) if (t.created_by) s.add(t.created_by);
    return s;
  }, [myNormalized]);

  const notMyTeams = useMemo(() => {
    if (!uid) return allNormalized;
    return allNormalized.filter((t) => {
      const idHit = t.id && myTeamIds.has(t.id);
      const ownerHit = t.created_by && (t.created_by === uid || myCreators.has(t.created_by));
      const repHit = (t.representatives || []).some((r) => r === uid);
      return !idHit && !ownerHit && !repHit;
    });
  }, [allNormalized, myTeamIds, myCreators, uid]);

  const q = searchTerm.trim().toLowerCase();
  const filteredTeams = useMemo(() => {
    const base = notMyTeams;
    if (!q) return base;
    return base.filter((t) => {
      const nome = (t.nome || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      return nome.includes(q) || desc.includes(q);
    });
  }, [notMyTeams, q]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getTeamStatusBadge = (team) => {
    if (!team.is_active) return <Badge variant="secondary">Inativo</Badge>;
    const memberCount = team.member_count || 0;
    if (memberCount >= 20) return <Badge className="bg-green-500">Completo</Badge>;
    if (memberCount >= 15) return <Badge className="bg-yellow-500">Quase Completo</Badge>;
    return <Badge variant="outline">Ativo</Badge>;
  };

  const canCreateTeam = () =>
    user?.user_type === "admin" ||
    user?.user_type === "representante_time" ||
    user?.user_type === "gestor_campo";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Times disponíveis</h1>
          <p className="text-gray-600 mt-1">Veja times de outros representantes</p>
        </div>

        {canCreateTeam() && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-appsociety-green hover:bg-green-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Time</DialogTitle>
                <DialogDescription>Preencha as informações básicas do time</DialogDescription>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  setSuccess("");
                  try {
                    const response = await apiCall("/teams", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        nome: newTeam.nome,
                        description: newTeam.description,
                        monthly_fee: parseFloat(newTeam.monthly_fee) || 0,
                        created_by: uid
                      })
                    });
                    if (response.error) return setError(response.error);
                    setSuccess("Time criado com sucesso!");
                    setNewTeam({ nome: "", description: "", monthly_fee: 30 });
                    setIsCreateDialogOpen(false);
                    loadAll(searchTerm);
                  } catch (err) {
                    console.error(err);
                    setError(err.message || "Erro ao criar time");
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Time</Label>
                  <Input
                    id="name"
                    value={newTeam.nome}
                    onChange={(e) => setNewTeam({ ...newTeam, nome: e.target.value })}
                    placeholder="Ex: Amigos FC"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    placeholder="Descrição do time..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_fee">Mensalidade (R$)</Label>
                  <Input
                    id="monthly_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newTeam.monthly_fee}
                    onChange={(e) =>
                      setNewTeam({ ...newTeam, monthly_fee: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-appsociety-green hover:bg-green-600">
                    Criar Time
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar times..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    <span>{team.nome}</span>
                  </CardTitle>
                  {team.description && (
                    <CardDescription className="text-sm">{team.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {team.is_active ? (
                    <Badge variant="outline">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>{team.member_count || 0} membros</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span>{formatCurrency(team.monthly_fee)}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span> Criado em {new Date(team.created_at).toLocaleDateString("pt-BR")} </span>
                </div>

                <div className="pt-2">
                  <Button variant="default" size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    Agendar jogo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {q ? "Nenhum time encontrado" : "Nenhum time disponível"}
          </h3>
          <p className="text-gray-600 mb-6">
            {q ? "Tente ajustar os termos de busca" : "Não há times de outros representantes no momento"}
          </p>
        </div>
      )}
    </div>
  );
}
