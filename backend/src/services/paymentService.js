const mongoose = require("mongoose");
const payments = require("../models/payments");
const Times = require("../models/teams");
const Users = require("../models/user");
const fs = require("fs");
const path = require("path");

function assertMonth(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("month inválido. Use YYYY-MM.");
}
const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
const USERS_UID_FIELD = "firebaseUid";

function toYearMonth(dateLike) {
  const d = new Date(dateLike || Date.now());
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

async function listarPagamentos() {
  return await payments.find();
}

async function buscarPagamento(id) {
  const payment = await payments.findById(id);
  if (!payment) throw new Error("pagamento não encontrado.");
  return payment;
}

async function criarPagamento(dados) {
  const { user_id, team_id, amount, due_date, month, status, payment_method } =
    dados;
  if (!user_id || !team_id || !amount || !due_date || !month)
    throw new Error("preencha user_id, team_id, amount, due_date e month.");
  assertMonth(month);

  const jaExiste = await payments.findOne({ team_id, user_id, month });
  if (jaExiste)
    throw new Error(
      "pagamento já cadastrado para esse time/usuário neste mês."
    );

  const novo = await payments.create({
    user_id,
    team_id,
    amount,
    due_date,
    month,
    status: status || "pending",
    payment_method: payment_method || null,
  });
  return novo;
}

async function atualizarPagamento(id, NovosDados) {
  const payment = await payments.findByIdAndUpdate(id, NovosDados, {
    new: true,
    runValidators: true,
  });
  if (!payment) throw new Error("pagamento não encontrado.");
  return payment;
}

async function deletarPagamento(id) {
  const payment = await payments.findByIdAndDelete(id);
  if (!payment) throw new Error("pagamento não encontrado.");
  return { message: "pagamento deletado com sucesso." };
}

async function marcarPago({ team_id, user_id, month, rep_id }) {
  assertMonth(month);
  const updated = await payments.findOneAndUpdate(
    { team_id, user_id, month },
    {
      $set: { status: "paid", paid_at: new Date(), confirmed_by: rep_id || null },
      $setOnInsert: {
        amount: 0,
        due_date: new Date(`${month}-15T03:00:00.000Z`),
        receipt_url: null,
        payment_method: null,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return updated;
}

async function marcarNaoPago({ team_id, user_id, month, rep_id }) {
  assertMonth(month);
  const updated = await payments.findOneAndUpdate(
    { team_id, user_id, month },
    {
      $set: { status: "unpaid", paid_at: null, confirmed_by: rep_id || null },
      $setOnInsert: {
        amount: 0,
        due_date: new Date(`${month}-15T03:00:00.000Z`),
        receipt_url: null,
        payment_method: null,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return updated;
}

async function anexarComprovante({ team_id, user_id, month, receipt_url, ctx }) {
  assertMonth(month);
  if (!receipt_url) throw new Error("receipt_url obrigatório.");

  if (!user_id && ctx && (ctx.id || ctx._id || ctx.uid)) {
    user_id = ctx.id || ctx._id || ctx.uid;
  }
  if (!user_id) throw new Error("identificador de usuário ausente.");

  let userObjectId = null;
  if (isObjectId(user_id)) {
    userObjectId = new mongoose.Types.ObjectId(user_id);
  } else if (typeof user_id === "string" && isObjectId(user_id.toString())) {
    userObjectId = new mongoose.Types.ObjectId(user_id.toString());
  } else {
    const uid = String(user_id || "").trim();
    if (!uid) throw new Error("identificador de usuário ausente.");
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid })
      .select("_id")
      .lean();
    if (!u?._id) throw new Error("usuário não encontrado (uid).");
    userObjectId = u._id;
  }

  const teamFilter = isObjectId(team_id)
    ? new mongoose.Types.ObjectId(team_id)
    : team_id;

  let doc = await payments.findOne({
    team_id: teamFilter,
    user_id: userObjectId,
    month,
  });

  if (!doc) {
    doc = await payments.create({
      team_id: teamFilter,
      user_id: userObjectId,
      month,
      amount: 0,
      due_date: new Date(`${month}-15T03:00:00.000Z`),
      status: "awaiting_approval",
      receipt_url,
    });
    return doc;
  }

  if (doc.status !== "paid") {
    doc.status = "awaiting_approval";
  }
  doc.receipt_url = receipt_url;
  await doc.save();
  return doc;
}

async function removerComprovante({ team_id, user_id, month, ctx }) {
  assertMonth(month);

  if (!user_id && ctx && (ctx.id || ctx._id || ctx.uid)) {
    user_id = ctx.id || ctx._id || ctx.uid;
  }
  if (!user_id) throw new Error("identificador de usuário ausente.");

  let userObjectId = null;
  if (isObjectId(user_id)) {
    userObjectId = new mongoose.Types.ObjectId(user_id);
  } else if (typeof user_id === "string" && isObjectId(user_id.toString())) {
    userObjectId = new mongoose.Types.ObjectId(user_id.toString());
  } else {
    const uid = String(user_id || "").trim();
    if (!uid) throw new Error("identificador de usuário ausente.");
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid })
      .select("_id user_type")
      .lean();
    if (!u?._id) throw new Error("usuário não encontrado (uid).");
    userObjectId = u._id;
  }

  const teamFilter = isObjectId(team_id)
    ? new mongoose.Types.ObjectId(team_id)
    : team_id;

  const doc = await payments.findOne({
    team_id: teamFilter,
    user_id: userObjectId,
    month,
  });
  if (!doc) throw new Error("registro de pagamento do mês não encontrado.");

  if (ctx && ctx.user_type && ctx.user_type !== "jogador") {
    throw new Error("apenas jogadores podem remover o próprio comprovante.");
  }

  if (doc.receipt_url && doc.receipt_url.startsWith("/uploads/")) {
    try {
      const abs = path.resolve(process.cwd(), "." + doc.receipt_url);
      fs.unlink(abs, () => {});
    } catch (e) {
    }
  }

  doc.receipt_url = null;
  doc.paid_at = null;
  if (doc.status !== "paid") {
    doc.status = "pending";
  }
  await doc.save();

  return { ok: true };
}

async function listarPorTimeEMes({ team_id, month }) {
  assertMonth(month);

  const team = await Times.findById(team_id).lean();
  if (!team) throw new Error("time não encontrado.");

  const uids = (team.members || []).map((m) =>
    typeof m === "object" ? m.uid || m.firebaseUid || "" : String(m || "")
  );
  const users = await Users.find({ [USERS_UID_FIELD]: { $in: uids } })
    .select("_id nome email " + USERS_UID_FIELD)
    .lean();
  const byUid = new Map(users.map((u) => [u[USERS_UID_FIELD], u]));

  const pays = await payments.find({ team_id, month }).lean();
  const payByUserId = new Map(pays.map((p) => [String(p.user_id), p]));

  const defaultDue = new Date(`${month}-15T03:00:00.000Z`);
  const today = new Date();

  const toInsert = [];

  const items = (team.members || [])
    .filter((m) =>
      ["jogador", "representante_time", "admin"].includes(
        typeof m === "object" ? m.user_type : m?.user_type
      )
    )
    .map((m) => {
      const uid =
        typeof m === "object" ? m.uid || m.firebaseUid || m._id || m.id : m;
      const uidStr = String(uid || "");
      const u = byUid.get(uidStr);
      const p = u ? payByUserId.get(String(u._id)) : null;

      const amount = p?.amount ?? (team.monthly_fee || 0);
      const due_date = p?.due_date ?? defaultDue;

      let status = p?.status ?? "pending";
      if (!p && due_date && today >= new Date(due_date)) status = "unpaid";

      if (!p && u && u._id) {
        toInsert.push({
          user_id: u._id,
          team_id: team._id,
          month,
          amount,
          due_date,
          status,
        });
      }

      return {
        _id: p?._id || null,
        user_id: u
          ? { _id: u._id, nome: u.nome, email: u.email }
          : { _id: null, nome: "Sem cadastro", email: "" },
        amount,
        due_date,
        status,
        receipt_url: p?.receipt_url || null,
        paid_at: p?.paid_at || null,
      };
    });

  if (toInsert.length) {
    try {
      await payments.insertMany(toInsert, { ordered: false });
    } catch (e) {
      if (e.code !== 11000) {
        console.error("[listarPorTimeEMes] erro ao inserir pendentes:", e);
      }
    }
  }

  return items;
}

async function listarDoUsuarioNoMes({ user_id, month }) {
  assertMonth(month);
  let userObjectId = null;
  if (isObjectId(user_id)) userObjectId = new mongoose.Types.ObjectId(user_id);
  else if (typeof user_id === "string" && isObjectId(user_id.toString()))
    userObjectId = new mongoose.Types.ObjectId(user_id.toString());
  else {
    const uid = String(user_id || "").trim();
    if (!uid) throw new Error("identificador de usuário ausente.");
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid })
      .select("_id")
      .lean();
    if (!u?._id) throw new Error("usuário não encontrado (uid).");
    userObjectId = u._id;
  }
  return await payments.find({ user_id: userObjectId, month });
}

async function listarDoUsuarioNoMesPorTime({ user_id, team_id, month }) {
  assertMonth(month);
  const teamFilter = isObjectId(team_id)
    ? new mongoose.Types.ObjectId(team_id)
    : team_id;

  let userObjectId = null;
  if (isObjectId(user_id)) userObjectId = new mongoose.Types.ObjectId(user_id);
  else if (typeof user_id === "string" && isObjectId(user_id.toString()))
    userObjectId = new mongoose.Types.ObjectId(user_id.toString());
  else {
    const uid = String(user_id || "").trim();
    if (!uid) throw new Error("identificador de usuário ausente.");
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid })
      .select("_id")
      .lean();
    if (!u?._id) throw new Error("usuário não encontrado (uid).");
    userObjectId = u._id;
  }
  return await payments.find({
    user_id: userObjectId,
    team_id: teamFilter,
    month,
  });
}

async function listarCiclosDoUsuario({ user_id, team_id, month }) {
  assertMonth(month);

  let userObjectId = null;
  if (isObjectId(user_id)) userObjectId = new mongoose.Types.ObjectId(user_id);
  else if (typeof user_id === "string" && isObjectId(user_id.toString()))
    userObjectId = new mongoose.Types.ObjectId(user_id.toString());
  else {
    const uid = String(user_id || "").trim();
    if (!uid) throw new Error("identificador de usuário ausente.");
    const u = await Users.findOne({ [USERS_UID_FIELD]: uid })
      .select("_id")
      .lean();
    if (!u?._id) throw new Error("usuário não encontrado (uid).");
    userObjectId = u._id;
  }

  let teamFilter = null;
  let filter = { user_id: userObjectId, month };

  if (team_id) {
    teamFilter = isObjectId(team_id)
      ? new mongoose.Types.ObjectId(team_id)
      : team_id;
    filter = { user_id: userObjectId, team_id: teamFilter, month };
  }

  let docs = await payments.find(filter);

  if (!docs.length && teamFilter) {
    await listarPorTimeEMes({ team_id: teamFilter, month });
    docs = await payments.find(filter);
  }

  return docs;
}

module.exports = {
  listarPagamentos,
  buscarPagamento,
  criarPagamento,
  atualizarPagamento,
  deletarPagamento,
  marcarPago,
  marcarNaoPago,
  anexarComprovante,
  removerComprovante,
  listarPorTimeEMes,
  listarDoUsuarioNoMes,
  listarDoUsuarioNoMesPorTime,
  listarCiclosDoUsuario,
};
