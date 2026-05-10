export const NG_ECONOMICS = {
  direct_home: {
    economy_consult_15min_price_ngn: 2000,
    premium_consult_15min_price_ngn: 5000,
    split_home: { doctor_pct: 0.6, platform_pct: 0.35, data_fee_pct: 0.05 },
  },
  facility_private: {
    consult_15min_price_ngn: 5000,
    split_clinic: { doctor_pct: 0.5, facility_pct: 0.3, platform_pct: 0.15, data_fee_pct: 0.05 },
  },
  facility_phc: {
    patient_copay_ngn: 500,
    facility_topup_ngn: 1000,
    total_price_ngn: 1500,
    split_phc: { doctor_ngn: 900, facility_ngn: 300, platform_ngn: 200, data_fee_ngn: 100 },
  },
  labs: {
    lab_commission_pct: 0.1,
  },
}

export function normalizeDurationMin(durationMin) {
  const parsed = Number(durationMin)
  if (!Number.isFinite(parsed)) return 15
  const rounded = Math.round(parsed)
  return Math.max(1, rounded)
}

export function calculateBillingBlocks(durationMin, blockMin = 15) {
  const minutes = normalizeDurationMin(durationMin)
  const block = Math.max(1, Math.round(blockMin))
  return Math.max(1, Math.ceil(minutes / block))
}

export function calculateConsultationAmountNgn({ channel, track, durationMin }) {
  const blocks = calculateBillingBlocks(durationMin, 15)

  if (channel === 'facility_phc') {
    return NG_ECONOMICS.facility_phc.total_price_ngn * blocks
  }

  if (channel === 'facility_private') {
    return NG_ECONOMICS.facility_private.consult_15min_price_ngn * blocks
  }

  // direct_home
  const pricing = NG_ECONOMICS.direct_home
  const unit = track === 'premium' ? pricing.premium_consult_15min_price_ngn : pricing.economy_consult_15min_price_ngn
  return unit * blocks
}

function splitWithRemainder(total, parts) {
  const keys = Object.keys(parts)
  const computed = {}
  let running = 0
  for (const key of keys) {
    const value = Math.round(total * parts[key])
    computed[key] = value
    running += value
  }
  // Adjust remainder into platform if present, otherwise into the first key.
  const remainder = total - running
  if (remainder !== 0) {
    const target = keys.includes('platform_ngn') ? 'platform_ngn' : keys[0]
    computed[target] = (computed[target] || 0) + remainder
  }
  return computed
}

export function calculateConsultationSplitNgn({ channel, track, durationMin }) {
  const blocks = calculateBillingBlocks(durationMin, 15)

  if (channel === 'facility_phc') {
    const unit = NG_ECONOMICS.facility_phc
    return {
      channel,
      track: 'economy',
      durationMin: normalizeDurationMin(durationMin),
      blocks,
      total_ngn: unit.total_price_ngn * blocks,
      patient_copay_ngn: unit.patient_copay_ngn * blocks,
      facility_topup_ngn: unit.facility_topup_ngn * blocks,
      doctor_ngn: unit.split_phc.doctor_ngn * blocks,
      facility_ngn: unit.split_phc.facility_ngn * blocks,
      platform_ngn: unit.split_phc.platform_ngn * blocks,
      data_fee_ngn: unit.split_phc.data_fee_ngn * blocks,
    }
  }

  const total = calculateConsultationAmountNgn({ channel, track, durationMin })

  if (channel === 'facility_private') {
    const s = NG_ECONOMICS.facility_private.split_clinic
    const computed = splitWithRemainder(total, {
      doctor_ngn: s.doctor_pct,
      facility_ngn: s.facility_pct,
      platform_ngn: s.platform_pct,
      data_fee_ngn: s.data_fee_pct,
    })
    return {
      channel,
      track: 'economy',
      durationMin: normalizeDurationMin(durationMin),
      blocks,
      total_ngn: total,
      patient_copay_ngn: total,
      facility_topup_ngn: 0,
      ...computed,
    }
  }

  // direct_home
  const s = NG_ECONOMICS.direct_home.split_home
  const computed = splitWithRemainder(total, {
    doctor_ngn: s.doctor_pct,
    platform_ngn: s.platform_pct,
    data_fee_ngn: s.data_fee_pct,
  })
  return {
    channel: 'direct_home',
    track: track === 'premium' ? 'premium' : 'economy',
    durationMin: normalizeDurationMin(durationMin),
    blocks,
    total_ngn: total,
    patient_copay_ngn: total,
    facility_topup_ngn: 0,
    facility_ngn: 0,
    ...computed,
  }
}

export function calculateLabCommissionNgn(totalPaidNgn) {
  const total = Math.max(0, Math.round(Number(totalPaidNgn) || 0))
  const commission = Math.round(total * NG_ECONOMICS.labs.lab_commission_pct)
  return {
    total_ngn: total,
    platform_commission_ngn: commission,
    facility_net_ngn: total - commission,
  }
}

