const Teams = require("../models/teams");
const Users = require("../models/user");
const Games = require("../models/games");

const DDD_TO_STATE = {
  "68": "AC",
  "96": "AP",
  "92": "AM", "97": "AM",
  "91": "PA", "93": "PA", "94": "PA",
  "69": "RO",
  "95": "RR",
  "63": "TO",
  "82": "AL",
  "71": "BA", "73": "BA", "74": "BA", "75": "BA", "77": "BA",
  "85": "CE", "88": "CE",
  "98": "MA", "99": "MA",
  "83": "PB",
  "81": "PE", "87": "PE",
  "86": "PI", "89": "PI",
  "84": "RN",
  "79": "SE",
  "61": "DF",
  "62": "GO", "64": "GO",
  "65": "MT", "66": "MT",
  "67": "MS",
  "27": "ES", "28": "ES",
  "31": "MG", "32": "MG", "33": "MG", "34": "MG", "35": "MG",
  "37": "MG", "38": "MG",
  "21": "RJ", "22": "RJ", "24": "RJ",
  "11": "SP", "12": "SP", "13": "SP", "14": "SP",
  "15": "SP", "16": "SP", "17": "SP", "18": "SP", "19": "SP",
  "41": "PR", "42": "PR", "43": "PR", "44": "PR", "45": "PR", "46": "PR",
  "47": "SC", "48": "SC", "49": "SC",
  "51": "RS", "53": "RS", "54": "RS", "55": "RS",
};

const STATE_TO_REGION = {
  AC: "Norte", AP: "Norte", AM: "Norte", PA: "Norte",
  RO: "Norte", RR: "Norte", TO: "Norte",
  AL: "Nordeste", BA: "Nordeste", CE: "Nordeste", MA: "Nordeste",
  PB: "Nordeste", PE: "Nordeste", PI: "Nordeste", RN: "Nordeste",
  SE: "Nordeste",
  DF: "Centro-Oeste", GO: "Centro-Oeste", MT: "Centro-Oeste", MS: "Centro-Oeste",
  ES: "Sudeste", MG: "Sudeste", RJ: "Sudeste", SP: "Sudeste",
  PR: "Sul", SC: "Sul", RS: "Sul",
};

const REGIONS_ORDER = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

function normalizePhone(phone) {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "");
}

function extractDDD(digits) {
  if (!digits) return null;
  if (digits.startsWith("55") && digits.length >= 12) {
   
    return digits.slice(2, 4);
  }
  if (digits.length >= 10) {

    return digits.slice(0, 2);
  }
  return null;
}

function getRegionFromPhone(phone) {
  const digits = normalizePhone(phone);
  const ddd = extractDDD(digits);
  if (!ddd) return null;
  const state = DDD_TO_STATE[ddd];
  if (!state) return null;
  return STATE_TO_REGION[state] || null;
}

function getStateFromPhone(phone) {
  const digits = normalizePhone(phone);
  const ddd = extractDDD(digits);
  if (!ddd) return null;
  return DDD_TO_STATE[ddd] || null;
}

async function getAdminOverviewStats() {
  try {
    const [totalTeams, totalPlayers, totalGames] = await Promise.all([
      Teams.countDocuments({}),
      Users.countDocuments({ user_type: "jogador" }),
      Games.countDocuments({}),
    ]);

    return {
      total_teams: totalTeams,
      total_players: totalPlayers,
      total_games: totalGames,
    };
  } catch (err) {
    console.error("[Service] Erro em getAdminOverviewStats:", err);
    throw new Error("Erro ao carregar estatísticas gerais do admin");
  }
}

async function getTeamsAndPlayersByRegion() {
  const users = await Users.find({}, "firebaseUid telefone user_type").lean();

  const uidToRegion = new Map();
  for (const u of users) {
    const region = getRegionFromPhone(u.telefone);
    if (!region) continue;
    uidToRegion.set(u.firebaseUid, {
      region,
      user_type: u.user_type,
    });
  }

  const regionAgg = {};
  for (const r of REGIONS_ORDER) {
    regionAgg[r] = { teams: 0, players: 0 };
  }

  const teams = await Teams.find().lean();

  for (const team of teams) {
    let teamRegion = null;

    if (team.created_by?.uid) {
      const info = uidToRegion.get(team.created_by.uid);
      if (
        info &&
        (info.user_type === "representante_time" ||
          info.user_type === "gestor_campo")
      ) {
        teamRegion = info.region;
      }
    }

    if (!teamRegion && Array.isArray(team.members)) {
      for (const m of team.members) {
        if (m.user_type === "representante_time" || m.user_type === "gestor_campo") {
          const info = uidToRegion.get(m.uid);
          if (info?.region) {
            teamRegion = info.region;
            break;
          }
        }
      }
    }

    if (teamRegion && regionAgg[teamRegion]) {
      regionAgg[teamRegion].teams += 1;
    }

    if (Array.isArray(team.members)) {
      for (const m of team.members) {
        if (m.user_type !== "jogador") continue;
        const info = uidToRegion.get(m.uid);
        const playerRegion = info?.region;
        if (playerRegion && regionAgg[playerRegion]) {
          regionAgg[playerRegion].players += 1;
        }
      }
    }
  }

  return {
    labels: REGIONS_ORDER,
    teams: REGIONS_ORDER.map((r) => regionAgg[r]?.teams || 0),
    players: REGIONS_ORDER.map((r) => regionAgg[r]?.players || 0),
  };
}

async function getRegionDetail(regionName) {
  const region = String(regionName || "").trim();

  const users = await Users.find({}, "firebaseUid telefone user_type").lean();

  const uidToLocation = new Map();
  for (const u of users) {
    const state = getStateFromPhone(u.telefone);
    if (!state) continue;
    const reg = STATE_TO_REGION[state];
    if (!reg) continue;

    uidToLocation.set(u.firebaseUid, {
      state,
      region: reg,
      user_type: u.user_type,
    });
  }

  const stateAgg = {};
  const teams = await Teams.find().lean();

  for (const team of teams) {
    let teamState = null;
    let teamRegion = null;

    if (team.created_by?.uid) {
      const info = uidToLocation.get(team.created_by.uid);
      if (
        info &&
        (info.user_type === "representante_time" ||
          info.user_type === "gestor_campo")
      ) {
        teamState = info.state;
        teamRegion = info.region;
      }
    }

    if (!teamState && Array.isArray(team.members)) {
      for (const m of team.members) {
        if (m.user_type === "representante_time" || m.user_type === "gestor_campo") {
          const info = uidToLocation.get(m.uid);
          if (info) {
            teamState = info.state;
            teamRegion = info.region;
            break;
          }
        }
      }
    }

    if (teamRegion === region && teamState) {
      if (!stateAgg[teamState]) {
        stateAgg[teamState] = { teams: 0, players: 0 };
      }
      stateAgg[teamState].teams += 1;
    }

    if (Array.isArray(team.members)) {
      for (const m of team.members) {
        if (m.user_type !== "jogador") continue;
        const info = uidToLocation.get(m.uid);
        if (!info) continue;

        if (info.region === region && info.state) {
          if (!stateAgg[info.state]) {
            stateAgg[info.state] = { teams: 0, players: 0 };
          }
          stateAgg[info.state].players += 1;
        }
      }
    }
  }

  const labels = Object.keys(stateAgg).sort();
  const teamsArr = labels.map((uf) => stateAgg[uf].teams || 0);
  const playersArr = labels.map((uf) => stateAgg[uf].players || 0);

  return {
    labels,
    teams: teamsArr,
    players: playersArr,
  };
}

module.exports = {
  getAdminOverviewStats,
  getTeamsAndPlayersByRegion,
  getRegionDetail,
};
