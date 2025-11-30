// src/components/forms/TeamForm.jsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CriarTimeForm({ onCreated }) {
  const { apiCall } = useAuth();

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    description: "",
    monthly_fee: "",
    firstMonth: "", // YYYY-MM
  });

  const setF = (k) => (e) =>
    setForm((prev) => ({
      ...prev,
      [k]: e.target.value,
    }));

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

      setForm({ nome: "", description: "", monthly_fee: "", firstMonth: "" });
      alert("Time criado com sucesso!");

      if (onCreated) onCreated(res);
    } catch (e) {
      alert(e?.message || "Erro ao criar time");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Novo time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do time</label>
          <input
            type="text"
            value={form.nome}
            onChange={setF("nome")}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Ex: Galáticos FC"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            value={form.description}
            onChange={setF("description")}
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            placeholder="Breve descrição do time"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Mensalidade (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.monthly_fee}
              onChange={setF("monthly_fee")}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ex: 80"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mês inicial (YYYY-MM)
            </label>
            <input
              type="month"
              value={form.firstMonth}
              onChange={setF("firstMonth")}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={criarTime} disabled={creating}>
            {creating ? "Criando..." : "Criar time"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
