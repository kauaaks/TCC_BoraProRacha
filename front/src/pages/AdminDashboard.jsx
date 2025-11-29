import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  MapPin,
  CreditCard,
  ShieldAlert,
  BarChart3,
  PlusCircle,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, apiCall } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    teams: 0,
    fields: 0,
    payments: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user_type !== "admin") {
      navigate("/dashboard");
    } else {
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const [teamsRes, fieldsRes, paymentsRes, usersRes] = await Promise.all([
        apiCall("/teams"),             // GET /teams
        apiCall("/fields"),            // GET /fields  (mesmo padrão)
        apiCall("/payments"),          // GET /payments
        apiCall("/users/usuarios"),    // GET /users/usuarios (rota que você mostrou)
      ]);

      const teamsCount = teamsRes.teams?.length || 0;
      const fieldsCount = fieldsRes.fields?.length || 0;
      const paymentsCount = paymentsRes.payments?.length || 0;
      const usersCount =
        Array.isArray(usersRes.usuarios || usersRes.users)
          ? (usersRes.usuarios || usersRes.users).length
          : 0;

      setStats({
        teams: teamsCount,
        fields: fieldsCount,
        payments: paymentsCount,
        users: usersCount,
      });
    } catch (err) {
      console.error("Erro ao carregar estatísticas do admin:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="p-4">Carregando estatísticas...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Painel do Administrador
          </h1>
          <p className="text-gray-600">
            Visão geral dos times, campos, pagamentos e usuários.
          </p>
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={() => navigate("/teams")}
        >
          <CardHeader className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Times</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.teams}</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={() => navigate("/fields")}
        >
          <CardHeader className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <CardTitle>Campos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.fields}</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={() => navigate("/payments")}
        >
          <CardHeader className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <CardTitle>Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.payments}</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={() => navigate("/admin/users")}
        >
          <CardHeader className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.users}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas do admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={() => navigate("/admin/teams/new")}
        >
          <CardHeader className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            <CardTitle>Criar novo time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cadastre um time e defina representantes e jogadores desde o início.
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={() => navigate("/admin/users/new")}
        >
          <CardHeader className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <CardTitle>Criar novo usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Defina o tipo do usuário e opcionalmente já vincule a um time.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção futura (relatórios etc.) */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Próximos passos
        </h2>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
          <li>Criar relatórios de uso e receita.</li>
          <li>Gerenciar assinaturas e configurações globais.</li>
          <li>Controlar permissões e acesso de usuários.</li>
        </ul>
      </div>
    </div>
  );
}
