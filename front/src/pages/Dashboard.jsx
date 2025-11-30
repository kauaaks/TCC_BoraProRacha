import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import FieldManagerDashboard from "@/components/dashboards/FieldManagerDashboard";
import TeamRepDashboard from "@/components/dashboards/TeamRepDashboard";
import PlayerDashboard from "@/components/dashboards/PlayerDashboard";

export default function Dashboard() {
  const { user, apiCall } = useAuth();

  console.log("Usuário simplificado:", {
    uid: user.uid,
    email: user.email,
    user_type: user.user_type,
    displayName: user.displayName,
  });

  const [data, setData] = useState({ teams: [], games: [], payments: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [hasTeam, setHasTeam] = useState(false);

  // Checar times do jogador para mostrar banner se não tiver nenhum
  useEffect(() => {
    let alive = true;
    async function checkTeams() {
      if (!user || user.user_type !== "jogador") {
        if (alive) {
          setHasTeam(false);
          setLoadingTeams(false);
        }
        return;
      }
      try {
        const res = await apiCall("/teams/meustimes?t=" + Date.now()).catch(() =>
          apiCall("/teams/me?t=" + Date.now()),
        );
        const list = Array.isArray(res?.teams)
          ? res.teams
          : Array.isArray(res)
          ? res
          : [];
        if (alive) setHasTeam(list.length > 0);
      } catch {
        if (alive) setHasTeam(false);
      } finally {
        if (alive) setLoadingTeams(false);
      }
    }
    checkTeams();
    return () => {
      alive = false;
    };
  }, [user?.uid, user?.user_type, apiCall]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const promises = [];

        if (user?.user_type === "admin") {
          promises.push(
            apiCall("/teams"),
            apiCall("/games"),
            apiCall("/payments"),
            apiCall("/users/usuarios"), // ajuste para seu endpoint real de usuários
          );
        } else if (user?.user_type === "gestor_campo") {
          promises.push(apiCall("/fields"), apiCall("/games"), apiCall("/teams"));
        } else if (user?.user_type === "representante_time") {
          promises.push(apiCall("/teams"), apiCall("/games"), apiCall("/payments"));
        } else if (user?.user_type === "jogador") {
          promises.push(apiCall("/games"));
        }

        const results = await Promise.allSettled(promises);
        const [a, b, c, d] = results.map((r) =>
          r.status === "fulfilled" ? r.value : [],
        );

        if (user?.user_type === "admin") {
          setData({
            teams: Array.isArray(a?.teams) ? a.teams : Array.isArray(a) ? a : [],
            games: Array.isArray(b?.games) ? b.games : Array.isArray(b) ? b : [],
            payments: Array.isArray(c?.payments)
              ? c.payments
              : Array.isArray(c)
              ? c
              : [],
            users: Array.isArray(d?.users) ? d.users : Array.isArray(d) ? d : [],
          });
        } else {
          setData({
            teams: a?.teams || a?.fields || [],
            games: b?.games || [],
            payments: c?.payments || c?.teams || [],
            users: [],
          });
        }
      } catch (err) {
        console.error(err);
        setData({ teams: [], games: [], payments: [], users: [] });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, apiCall]);

  if (loading) return <div className="p-6">Carregando...</div>;

  if (user?.user_type === "jogador" && !loadingTeams && !hasTeam) {
    return (
      <div className="p-6">
        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-400 p-4 rounded shadow">
          <strong>Você ainda não faz parte de nenhum time!</strong>
          <div className="mt-2">
            Solicite o código/link do time a um representante e clique no botão abaixo
            para ingressar.
          </div>
          <button
            onClick={() => (window.location.href = "/invitations/join")}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700"
          >
            Entrar em um time
          </button>
        </div>
        <div>Sua área será liberada assim que você se associar a um time.</div>
      </div>
    );
  }

  if (user?.user_type === "admin") return <AdminDashboard data={data} />;
  if (user?.user_type === "gestor_campo")
    return <FieldManagerDashboard data={data} />;
  if (user?.user_type === "representante_time")
    return <TeamRepDashboard data={data} />;
  if (user?.user_type === "jogador") return <PlayerDashboard data={data} />;

  return <div className="p-6">Perfil de usuário desconhecido.</div>;
}
