import React, { useEffect, useState } from 'react'

const mockPayments = [
  { id: 1, month: 'Novembro/2025', amount: 50, status: 'Pendente', due: '15/11/2025' },
  { id: 2, month: 'Outubro/2025', amount: 50, status: 'Pago', due: '15/10/2025', paidOn: '14/10/2025' },
  { id: 3, month: 'Setembro/2025', amount: 50, status: 'Aguardando Verificação', due: '15/09/2025' }
]

const badgeColors = {
  Pendente: 'bg-yellow-100 text-yellow-800',
  Pago: 'bg-green-100 text-green-800',
  'Aguardando Verificação': 'bg-blue-100 text-blue-800'
}

export default function Financeiro() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setPayments(mockPayments)
      setLoading(false)
    }, 800)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
      <p className="text-gray-600 mt-1">Acompanhe seus pagamentos e situação financeira.</p>
      {loading ? (
        <div className="text-center py-9">Carregando informações...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {payments.map(payment => (
            <div key={payment.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col gap-2 border">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{payment.month}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${badgeColors[payment.status] || 'bg-gray-100 text-gray-600'}`}>{payment.status}</span>
              </div>
              <div className="text-gray-500 text-sm">Vencimento: {payment.due}</div>
              <div className="text-gray-700 text-sm">Valor: <span className="font-medium">R$ {payment.amount},00</span></div>
              {payment.status === 'Pago' && (
                <div className="text-green-600 text-xs">Pago em {payment.paidOn}</div>
              )}
              {/* Adicione botão de envio de comprovante aqui se for o caso */}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
