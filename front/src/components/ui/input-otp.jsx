"use client"

import React, { useState } from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"

export default function OtpExample() {
  const [otp, setOtp] = useState("")     // valor aplicado
  const [draft, setDraft] = useState("") // digitando ao vivo

  const applyDraft = () => setOtp(draft)

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          applyDraft()
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      className="flex flex-col items-start gap-3"
    >
      <InputOTP
        maxLength={6}
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}  // opcional: dígitos e letras
        value={draft}                            // controlado pelo rascunho
        onChange={(val) => setDraft(val)}        // val já vem concatenado pela lib
        // onComplete={(val) => setOtp(val)}     // opcional: aplica quando completar 6
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <button
        type="button"
        onClick={applyDraft}
        className="ml-0 px-3 py-1.5 rounded border text-sm"
      >
        Aplicar
      </button>

      <div className="text-xs text-gray-500">
        Digitando: {draft || "—"} • Aplicado: {otp || "—"}
      </div>
    </div>
  )
}
