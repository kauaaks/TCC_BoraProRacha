import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Eye, CheckCircle2, XCircle, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const toAbsolute = (u) => (u?.startsWith?.('http') ? u : `${API_BASE_URL}${u || ''}`)

const toLabel = (status, dueISO) => {
  if (status === 'paid') return 'Pago'
  if (status === 'awaiting_approval') return 'Aguardando Verificação'
  if (status === 'unpaid') return 'Não pago'
  if (status === 'pending') {
    const today = new Date()
    const due = dueISO ? new Date(dueISO) : null
    if (due && today >= due) return 'Não pago'
    return 'Pendente'
  }
  return 'Pendente'
}

const badgeColors = {
  'Pendente': 'bg-yellow-100 text-yellow-800',
  'Pago': 'bg-green-100 text-green-800',
  'Não pago': 'bg-red-100 text-red-800',
  'Aguardando Verificação': 'bg-blue-100 text-blue-800',
  'Esperando aprovação': 'bg-blue-100 text-blue-800',
}

const fmtBRL = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v || 0))
const ymToLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  const data = new Date(y, m - 1, 1)
  return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}
const getCurrentMonth = () => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${m}`
}

export default function Financeiro() {
  const { user, apiCall } = useAuth()
  const role = user?.user_type
  const isRep = role === 'representante_time'
  const isJog = role === 'jogador'

  const [teams, setTeams] = useState([])
  const [teamId, setTeamId] = useState('')

  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(getCurrentMonth())

  const [files, setFiles] = useState({})
  const [uploading, setUploading] = useState({})

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [openMonth, setOpenMonth] = useState('')

  const [preview, setPreview] = useState({ open:false, src:'', title:'' })
  const [searchMember, setSearchMember] = useState('')

  const normalizeTeams = (raw) => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw
    if (Array.isArray(raw.teams)) return raw.teams
    return []
  }

  const isTeamOfRepresentative = (team, currentUid) => {
    if (!currentUid) return false
    if (String(team?.created_by?.uid || '') === String(currentUid) &&
        team?.created_by?.user_type === 'representante_time') {
      return true
    }
    if (Array.isArray(team?.members) &&
        team.members.some(m => String(m?.uid || '') === String(currentUid) &&
                               m?.user_type === 'representante_time')) {
      return true
    }
    return false
  }

  useEffect(() => {
    ;(async () => {
      try {
        const res = await apiCall('/teams/meustimes').catch(() => ([]))
        const list = normalizeTeams(res)
        const currentUid = String(user?.uid || '')
        const final = isRep ? list.filter(t => isTeamOfRepresentative(t, currentUid)) : list
        const display = (isRep && final.length === 0 && list.length > 0) ? list : final
        setTeams(display)
        if (display.length) setTeamId(String(display[0].id || display[0]._id))
      } catch {
        setTeams([])
      }
    })()
  }, [isRep, user?.uid])

  const loadCycles = async () => {
    setLoading(true)
    try {
      if (!teamId || !month) { setPayments([]); return }
      const res = await apiCall(`/payments/user?month=${encodeURIComponent(month)}&teamId=${encodeURIComponent(teamId)}&t=${Date.now()}`)
      const items = Array.isArray(res?.items) ? res.items : []
      setPayments(items.map((p, idx) => ({
        id: p._id || idx,
        month: p.month,
        amount: p.amount,
        status: p.status,
        due: p.due_date,
        paid_at: p.paid_at,
        receipt_url: p.receipt_url,
        team_id: p.team_id,
      })))
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCycles() }, [teamId, month])

  const onFileChange = (paymentId, file) => setFiles(prev => ({ ...prev, [paymentId]: file || null }))

  const uploadReceipt = async (payment) => {
    const file = files[payment.id]
    if (!file) return alert('Selecione uma imagem de comprovante')
    try {
      setUploading(prev => ({ ...prev, [payment.id]: true }))

      const form = new FormData()
      form.append('file', file)
      form.append('month', payment.month)
      if (teamId) form.append('teamId', teamId)

      
      if (user?.uid) form.append('userId', user.uid)

      await apiCall('/payments/receipt/upload', { method: 'POST', body: form })
      await loadCycles()
      onFileChange(payment.id, null)
    } catch (e) {
      alert(e?.message || 'Falha ao enviar comprovante')
    } finally {
      setUploading(prev => ({ ...prev, [payment.id]: false }))
    }
  }

  
  const removeReceipt = async (payment) => {
    if (!payment?.receipt_url) return
    const ok = window.confirm('Remover comprovante? Essa ação não pode ser desfeita.')
    if (!ok) return
    try {
      await apiCall('/payments/receipt', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: payment.team_id || teamId,
          month: payment.month
          
        })
      })
      await loadCycles()
      setPreview(p => (p.src && payment.receipt_url && p.src.endsWith(payment.receipt_url) ? { open:false, src:'', title:'' } : p))
    } catch (e) {
      alert(e?.message || 'Falha ao remover comprovante')
    }
  }

  
  const openMonthMembers = async (m) => {
    if (!isRep) return
    if (!teamId) return alert('Selecione um time.')
    setOpenMonth(m)
    setMembersLoading(true)
    try {
      const r = await apiCall(`/payments/team/${teamId}?month=${encodeURIComponent(m)}&t=${Date.now()}`)
      const arr = Array.isArray(r?.items) ? r.items : []
      setMembers(arr)
    } finally {
      setMembersLoading(false)
    }
  }

  const markPaid = async (uid) => {
    await apiCall('/payments/mark-paid', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ team_id: teamId, user_id: uid, month: openMonth || month })
    })
    await openMonthMembers(openMonth || month)
  }

  const markUnpaid = async (uid) => {
    await apiCall('/payments/mark-unpaid', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ team_id: teamId, user_id: uid, month: openMonth || month })
    })
    await openMonthMembers(openMonth || month)
  }

  const cards = useMemo(() => {
    return payments.map((payment) => {
      const label = toLabel(payment.status, payment.due)
      const dueBR = payment.due ? new Date(payment.due).toLocaleDateString('pt-BR') : '--'
      const paidOnBR = payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('pt-BR') : null
      const monthLabel = payment.month ? ymToLabel(payment.month) : (payment.monthLabel || '')
      return { ...payment, label, dueBR, paidOnBR, monthLabel }
    })
  }, [payments])

  const filteredMembers = useMemo(() => {
    const q = searchMember.trim().toLowerCase()
    if (!q) return members
    return members.filter(i => (i.user_id?.nome || '').toLowerCase().includes(q))
  }, [members, searchMember])

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
      <p className="text-gray-600 mt-1">
        {isRep ? 'Selecione um time, escolha o mês e revise os pagamentos.' : 'Selecione um time, escolha o mês e envie o comprovante.'}
      </p>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
        {teams.map((t) => {
          const id = String(t.id || t._id)
          const active = teamId === id
          return (
            <div
              key={id}
              className={`p-4 rounded-lg border bg-white flex items-center justify-between cursor-pointer ${active ? 'ring-2 ring-emerald-500' : 'hover:shadow'} transition`}
              onClick={() => setTeamId(id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-medium">{t.nome || t.name}</div>
                  <div className="text-xs text-gray-500">{t.description || 'Time'}</div>
                </div>
              </div>
              {active && <span className="text-xs text-emerald-700 font-medium">Selecionado</span>}
            </div>
          )
        })}
        {teams.length === 0 && (
          <div className="text-sm text-gray-500">Nenhum time disponível.</div>
        )}
      </div>

     
      <div className="mt-2 flex items-center gap-3">
        <div className="w-52">
          <label className="text-sm text-gray-600">Mês (YYYY-MM)</label>
          <Input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="YYYY-MM" />
        </div>
        <Button variant="outline" onClick={loadCycles}>Atualizar</Button>
      </div>

      {loading ? (
        <div className="text-center py-9">Carregando informações...</div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 ${isRep ? 'mt-4' : 'mt-6'}`}>
          {cards.map(payment => (
            <div
              key={payment.id}
              className={`bg-white rounded-xl shadow-md p-5 flex flex-col gap-3 border ${isRep ? 'cursor-pointer hover:shadow-lg transition' : ''}`}
              onClick={() => isRep && openMonthMembers(payment.month)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{payment.monthLabel || payment.month}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeColors[payment.label] || 'bg-gray-100 text-gray-600'}`}>{payment.label}</span>
              </div>

              <div className="text-gray-500 text-sm">Vencimento: {payment.dueBR}</div>
              <div className="text-gray-700 text-sm">
                Valor: <span className="font-medium">{fmtBRL(payment.amount)}</span>
              </div>
              {payment.label === 'Pago' && payment.paidOnBR && (
                <div className="text-green-600 text-xs">Pago em {payment.paidOnBR}</div>
              )}

              {isJog && (
                <div className="mt-1" onClick={(e)=> e.stopPropagation()}>
                  <label className="text-sm text-gray-600">Comprovante</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="file" accept="image/*" onChange={(e) => setFiles(prev => ({ ...prev, [payment.id]: e.target.files?.[0] || null }))} />
                    <Button size="sm" onClick={() => uploadReceipt(payment)} disabled={uploading[payment.id]}>
                      <Upload className="w-4 h-4 mr-2" /> {uploading[payment.id] ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </div>

                  {payment.receipt_url && (
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        className="text-xs text-blue-600 underline"
                        onClick={()=> setPreview({ open:true, src: toAbsolute(payment.receipt_url), title: `Comprovante - ${payment.monthLabel || payment.month}` })}
                      >
                        Ver comprovante
                      </button>
                      <button
                        className="text-xs text-red-600 underline"
                        onClick={()=> removeReceipt(payment)}
                      >
                        Remover comprovante
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {cards.length === 0 && (
            <div className="text-sm text-gray-500">Nenhum ciclo encontrado para este mês.</div>
          )}
        </div>
      )}

      {isRep && cards.length === 0 && (
        <div className="mt-2">
          <Button size="sm" onClick={() => openMonthMembers(month)}>
            Ver membros do mês
          </Button>
        </div>
      )}

      {isRep && openMonth && (
        <div className="space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Membros — {ymToLabel(openMonth)}</h2>
            <div className="w-64">
              <Input placeholder="Buscar membro" value={searchMember} onChange={(e)=>setSearchMember(e.target.value)} />
            </div>
          </div>

          {membersLoading ? (
            <div className="text-gray-500 py-4">Carregando membros...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhum membro encontrado.</div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((row) => {
                const rawStatus = row.status === 'awaiting_approval' ? 'awaiting_approval' : row.status
                const label = toLabel(rawStatus, row.due_date)
                const nome = row.user_id?.nome || 'Jogador'
                const color = badgeColors[label] || 'bg-gray-100 text-gray-700'
                const dueBR = row.due_date ? new Date(row.due_date).toLocaleDateString('pt-BR') : '--'
                const paidAt = row.paid_at ? new Date(row.paid_at).toLocaleDateString('pt-BR') : null
                const uid = row.user_id?._id || row.user_id

                return (
                  <div key={uid} className="p-3 rounded-md border bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-sm font-bold">
                        {nome.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{nome}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${color}`}>{label === 'Aguardando Verificação' ? 'Esperando aprovação' : label}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Vencimento: {dueBR} • Valor: {fmtBRL(row.amount)}
                          {paidAt && <span className="ml-2 text-green-700">Pago em {paidAt}</span>}
                        </div>
                        {row.receipt_url && (
                          <button
                            className="text-xs text-blue-600 underline mt-1 flex items-center gap-1"
                            onClick={()=> setPreview({ open:true, src: toAbsolute(row.receipt_url), title: `Comprovante - ${nome}` })}
                          >
                            <Eye className="w-3 h-3" /> Ver comprovante
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={()=>markUnpaid(uid)}>
                        <XCircle className="w-4 h-4 mr-1" /> Não pago
                      </Button>
                      <Button size="sm" onClick={()=>markPaid(uid)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Pago
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={preview.open} onOpenChange={(o)=>setPreview(p=>({...p, open:o}))}>
        <DialogContent className="max-w-xl" aria-describedby="receipt-desc">
          <DialogHeader>
            <DialogTitle>{preview.title}</DialogTitle>
          </DialogHeader>
          <p id="receipt-desc" className="sr-only">Comprovante enviado pelo jogador</p>
          <div className="w-full">
            {preview.src ? (
              <img src={preview.src} alt="Comprovante" className="w-full rounded border" />
            ) : (
              <div className="text-sm text-gray-500">Sem imagem</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
