import React from "react";
import { useAuth } from "../contexts/AuthContext";
import GamesRepresentante from "../pages/GamesRepresentante";
import GamesJogador from "../pages/GamesJogador"; // quando você criar
// import GamesAdmin from "./GamesAdmin";      // se quiser ter pra admin, opcional

export default function Games() {
  const { user } = useAuth();

  if (!user) return <div>Carregando jogos...</div>;

  if (user.user_type === "representante_time") {
    return <GamesRepresentante />;
  }

  if (user.user_type === "jogador") {
   return <GamesJogador />;
  }

  //if (user.user_type === "admin") {
    // opcional: pode ser uma lista geral de jogos
   // return <GamesAdmin />;
  //}

  return <div>Você não tem acesso à página de jogos.</div>;
}