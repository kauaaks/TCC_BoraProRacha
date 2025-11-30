import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  Calendar,
  BarChart3,
  CreditCard,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard({ data }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.user_type !== "admin") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const primeiroNome = (user?.nome || user?.displayName || "")
    .split(" ")[0]
    .trim();

  const goToStats = () => navigate("/stats");
  const goToPayments = () => navigate("/payments");
  const goToTeamsList = () => navigate("/teams");
  const goToNewTeam = () => navigate("/teams/new");
  const goToGames = () => navigate("/games");
  const goToUsers = () => navigate("/users/usuarios"); 

  const teamsCount = data?.teams?.length || 0;
  const usersCount = data?.users?.length || 0;

  return (
    <div className="space-y-6 fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          BoraProRacha, {primeiroNome || "Administrador"}!
        </h1>
        <p className="text-gray-600">
          Administrador •{" "}
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={goToTeamsList}
        >
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Times</CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamsCount}</div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={goToUsers}
        >
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Usuários</CardTitle>
            <Users className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={goToStats}
        >
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Estatísticas</CardTitle>
            <BarChart3 className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Ver relatórios e desempenho dos jogos
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition"
          onClick={goToPayments}
        >
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Financeiro</CardTitle>
            <CreditCard className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              Acompanhar mensalidades e recebimentos
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie entidades do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={goToNewTeam}
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">Novo time</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={goToGames}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Agendar jogo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
