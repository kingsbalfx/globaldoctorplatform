export const specialtyRegistry = {
  cardiology: {
    name: 'Cardiology',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'CARD',
    logo: 'CARD',
    description: 'Heart and cardiovascular care',
    gradient: 'from-red-600 to-rose-600',
  },
  dermatology: {
    name: 'Dermatology',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    icon: 'DERM',
    logo: 'DERM',
    description: 'Skin, hair, and nail care',
    gradient: 'from-orange-600 to-amber-500',
  },
  psychiatry: {
    name: 'Psychiatry',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    icon: 'PSY',
    logo: 'PSY',
    description: 'Mental health and wellness',
    gradient: 'from-violet-600 to-indigo-600',
  },
  pediatrics: {
    name: 'Pediatrics',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    icon: 'PED',
    logo: 'PED',
    description: 'Children and family care',
    gradient: 'from-sky-600 to-cyan-500',
  },
  oncology: {
    name: 'Oncology',
    color: '#059669',
    bgColor: '#D1FAE5',
    icon: 'ONC',
    logo: 'ONC',
    description: 'Cancer care and tumor review',
    gradient: 'from-emerald-600 to-teal-600',
  },
  orthopedics: {
    name: 'Orthopedics',
    color: '#475569',
    bgColor: '#E2E8F0',
    icon: 'ORTH',
    logo: 'ORTH',
    description: 'Bone, joint, and mobility care',
    gradient: 'from-slate-600 to-slate-700',
  },
  neurology: {
    name: 'Neurology',
    color: '#D97706',
    bgColor: '#FEF3C7',
    icon: 'NEU',
    logo: 'NEU',
    description: 'Brain, nerve, and spine care',
    gradient: 'from-amber-600 to-orange-600',
  },
  urology: {
    name: 'Urology',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    icon: 'URO',
    logo: 'URO',
    description: 'Urinary and male reproductive care',
    gradient: 'from-blue-600 to-cyan-600',
  },
  obstetrics: {
    name: 'Obstetrics & Gynecology',
    color: '#DB2777',
    bgColor: '#FCE7F3',
    icon: 'OBG',
    logo: 'OBG',
    description: 'Women and maternal health',
    gradient: 'from-pink-600 to-rose-500',
  },
  ophthalmology: {
    name: 'Ophthalmology',
    color: '#1D4ED8',
    bgColor: '#DBEAFE',
    icon: 'EYE',
    logo: 'EYE',
    description: 'Eye and vision care',
    gradient: 'from-blue-700 to-indigo-500',
  },
  general: {
    name: 'General Practitioner',
    color: '#0F766E',
    bgColor: '#CCFBF1',
    icon: 'GEN',
    logo: 'GEN',
    description: 'General medical care',
    gradient: 'from-teal-600 to-emerald-600',
  },
}

export const getSpecialtyInfo = (specialty) => {
  const normalized = String(specialty || 'general')
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z]/g, '')

  if (normalized.includes('general')) return specialtyRegistry.general
  if (normalized.includes('obgyn') || normalized.includes('obstetrics') || normalized.includes('gynecology')) return specialtyRegistry.obstetrics
  return specialtyRegistry[normalized] || specialtyRegistry.general
}

export const getSpecialtyColor = (specialty) => getSpecialtyInfo(specialty).color
export const getSpecialtyBg = (specialty) => getSpecialtyInfo(specialty).bgColor
export const getSpecialtyGradient = (specialty) => getSpecialtyInfo(specialty).gradient
export const getSpecialtyLogo = (specialty) => getSpecialtyInfo(specialty).logo
export const getSpecialtyIcon = (specialty) => getSpecialtyInfo(specialty).icon
