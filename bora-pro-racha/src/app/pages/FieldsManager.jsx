import React from 'react'

export default function FieldsManager() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Gestão de Campos</h1>
      <p className="text-gray-600">Aqui você pode ver e gerenciar os campos disponíveis, agendamentos e relatórios.</p>

      {/* Exemplo de um card (pode expandir depois com dados reais) */}
      <div className="p-4 bg-white shadow rounded-lg">
        <h2 className="text-lg font-semibold">Campo Society Central</h2>
        <p className="text-sm text-gray-500">Rua Exemplo, 123 - Bairro - Cidade</p>
        <p className="text-sm text-gray-500">Horários disponíveis: 18h às 23h</p>
      </div>
    </div>
  )
}