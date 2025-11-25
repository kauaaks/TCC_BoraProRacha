import { useAuth } from '../contexts/AuthContext';
import StatsAdmin from '../pages/StatsAdmin'; 
import StatsRepresentante from '../pages/StatsRepresentante';  
import StatsJogador from '../pages/StatsJogador';             

export default function Stats() {
  const { user } = useAuth();

  if (!user) return <div>Carregando estatísticas...</div>;
  if (user.user_type === "admin") return <StatsAdmin />;
  if (user.user_type === "representante_time") return <StatsRepresentante />;
  if (user.user_type === "jogador") return <StatsJogador />;
  return <div>Você não tem acesso a essa página de estatísticas.</div>;
}
