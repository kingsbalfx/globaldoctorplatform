export const CONSULTATION_TOKENS_PER_USD = 10
export const GP_MAX_CONSULTATION_TOKENS = 20
export const SPECIALIST_MIN_CONSULTATION_TOKENS = 40
export const SPECIALIST_PREMIUM_DEFAULT_TOKENS = 60

export function isGeneralPractitioner(specialty) {
  const normalized = String(specialty || '').toLowerCase().replace(/[^a-z]/g, '')
  return normalized === 'gp'
    || normalized.includes('generalpractitioner')
    || normalized.includes('generalpractice')
    || normalized.includes('familymedicine')
}

export function getFairConsultationTokens(doctor, type = 'basic') {
  const premium = ['premium', 'priority'].includes(String(type || '').toLowerCase())
  const configured = Number(doctor?.price?.[premium ? 'premium' : 'basic'] ?? doctor?.consultation_fee ?? doctor?.fee)

  if (isGeneralPractitioner(doctor?.specialty)) {
    if (!Number.isFinite(configured) || configured <= 0) return GP_MAX_CONSULTATION_TOKENS
    return Math.max(1, Math.min(GP_MAX_CONSULTATION_TOKENS, Math.round(configured)))
  }

  const specialistDefault = premium ? SPECIALIST_PREMIUM_DEFAULT_TOKENS : SPECIALIST_MIN_CONSULTATION_TOKENS
  if (!Number.isFinite(configured) || configured <= 0) return specialistDefault
  return Math.max(SPECIALIST_MIN_CONSULTATION_TOKENS, Math.round(configured))
}

export function consultationTokensToUsd(tokens) {
  return Number((Math.max(0, Number(tokens) || 0) / CONSULTATION_TOKENS_PER_USD).toFixed(2))
}
