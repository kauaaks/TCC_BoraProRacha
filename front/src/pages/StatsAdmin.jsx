import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { MdClose } from "react-icons/md";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const greenPalette = [
  "#164b2c", "#21633a", "#278048", "#2d9e57", "#30b768", "#36c978",
  "#3cdb87", "#5bd09a", "#7dd5ad", "#a1e2c3", "#b5efce", "#217144",
  "#1b6037", "#14502b", "#70a37f", "#405f43", "#2f4e3a", "#71c285",
  "#213a32", "#0c5528", "#37924d", "#13431e", "#145620", "#22703a",
  "#0d2910", "#499c57", "#53b671", "#59c07b"
];

const REGIOES = [
  {
    nome: "Norte",
    estados: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
    times: [2, 1, 7, 5, 3, 1, 2],
    jogadores: [17, 9, 32, 20, 11, 8, 13],
  },
  {
    nome: "Nordeste",
    estados: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
    times: [2, 8, 6, 4, 3, 5, 2, 3, 1],
    jogadores: [15, 38, 28, 18, 14, 20, 11, 12, 7],
  },
  {
    nome: "Centro-Oeste",
    estados: ["GO", "MT", "MS", "DF"],
    times: [5, 3, 2, 4],
    jogadores: [19, 13, 9, 16],
  },
  {
    nome: "Sudeste",
    estados: ["ES", "MG", "RJ", "SP"],
    times: [2, 6, 7, 9],
    jogadores: [12, 28, 25, 36],
  },
  {
    nome: "Sul",
    estados: ["PR", "RS", "SC"],
    times: [5, 6, 4],
    jogadores: [20, 21, 16],
  }
];

const fetchAdminStats = () =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: 1, title: "Times cadastrados", value: REGIOES.reduce((t, r) => t + r.times.reduce((a, b) => a + b, 0), 0) },
          { id: 2, title: "Jogadores", value: REGIOES.reduce((t, r) => t + r.jogadores.reduce((a, b) => a + b, 0), 0) },
          { id: 3, title: "Partidas registradas", value: 127 },
        ]),
      400
    )
  );

const fetchRegionSummary = () =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        labels: REGIOES.map((r) => r.nome),
        teams: REGIOES.map((r) => r.times.reduce((a, b) => a + b, 0)),
        players: REGIOES.map((r) => r.jogadores.reduce((a, b) => a + b, 0)),
      });
    }, 600)
  );

const getDetailByRegion = (index) => {
  const regiao = REGIOES[index];
  return {
    labels: regiao.estados,
    teams: regiao.times,
    players: regiao.jogadores,
  };
};

export default function EstatisticasAdminDrilldown() {
  const [stats, setStats] = useState([]);
  const [regionSummary, setRegionSummary] = useState(null);
  const [detail, setDetail] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regionIndex, setRegionIndex] = useState(0);

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchRegionSummary()]).then(
      ([stats, regional]) => {
        setStats(stats);
        setRegionSummary(regional);
        setLoading(false);
      }
    );
  }, []);

  const handleRegionClick = (elements) => {
    if (!regionSummary || !elements.length) return;
    const idx = elements[0].index;
    setDetail(getDetailByRegion(idx));
    setRegionIndex(idx);
    setOpenDetail(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Estatísticas Gerais</h1>
      <p className="text-gray-600 mt-1">
        Painel administrativo – visão por região e drilldown por estado.
      </p>
      {loading ? (
        <div className="text-center py-9">Carregando estatísticas...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 xl:grid-cols-5 gap-6 mt-6 mb-8">
            {stats.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center gap-2 border"
              >
                <span className="font-bold text-2xl text-primary">{s.value}</span>
                <span className="text-gray-700">{s.title}</span>
              </div>
            ))}
          </div>

          {/* Gráfico de barras: por região */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="font-bold text-lg mb-2">
              Times cadastrados por região (clique para ver detalhes)
            </h2>
            <Bar
              data={{
                labels: regionSummary.labels,
                datasets: [
                  {
                    label: "Times",
                    data: regionSummary.teams,
                    backgroundColor: "#21633a"
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                onClick: (_event, elements) => handleRegionClick(elements),
                hover: { mode: "nearest", intersect: true },
              }}
              height={90}
            />
          </div>

          {/* Drilldown por estado */}
          {openDetail && detail && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-lg">
                  Detalhes da região {regionSummary.labels[regionIndex]}
                </h2>
                <button
                  className="hover:bg-gray-100 rounded-full p-1 transition-all"
                  onClick={() => setOpenDetail(false)}
                  aria-label="Fechar"
                >
                  <MdClose size={24} color="#555" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <Bar
                    data={{
                      labels: detail.labels,
                      datasets: [
                        {
                          label: "Times",
                          data: detail.teams,
                          backgroundColor: "#278048",
                        },
                        {
                          label: "Jogadores",
                          data: detail.players,
                          backgroundColor: "#30b768",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: "top" } },
                    }}
                    height={80}
                  />
                </div>
                <div style={{ width: "340px", height: "280px", margin: "0 auto" }}>
                  <Pie
                    data={{
                      labels: detail.labels,
                      datasets: [
                        {
                          label: "Jogadores",
                          data: detail.players,
                          backgroundColor: greenPalette.slice(0, detail.labels.length),
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" } },
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

