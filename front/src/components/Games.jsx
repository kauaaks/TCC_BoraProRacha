import React from "react";
import { useAuth } from "../contexts/AuthContext";
import GamesRepresentante from "../pages/GamesRepresentante";
import GamesJogador from "../pages/GamesJogador"; 

export default function Games() {
  const { user } = useAuth();

  if (!user) return <div>Carregando jogos...</div>;

  if (user.user_type === "representante_time") {
    return <GamesRepresentante />;
  }

  if (user.user_type === "jogador") {
   return <GamesJogador />;
  }

  return <div>Você não tem acesso à página de jogos.</div>;
}