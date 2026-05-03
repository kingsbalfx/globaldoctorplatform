// Specialty-based design system with icons, colors, and logos
export const specialtyRegistry = {
  cardiology: {
    name: 'Cardiology',
    color: '#E74C3C',
    bgColor: '#FADBD8',
    icon: '❤️',
    logo: '🫀',
    description: 'Heart & Cardiovascular Health',
    gradient: 'from-red-500 to-rose-600',
  },
  dermatology: {
    name: 'Dermatology',
    color: '#E67E22',
    bgColor: '#FDEBD0',
    icon: '🧴',
    logo: '💆',
    description: 'Skin & Beauty Care',
    gradient: 'from-orange-500 to-yellow-500',
  },
  psychiatry: {
    name: 'Psychiatry',
    color: '#8E44AD',
    bgColor: '#EBDEF0',
    icon: '🧠',
    logo: '💭',
    description: 'Mental Health & Wellness',
    gradient: 'from-purple-500 to-indigo-600',
  },
  pediatrics: {
    name: 'Pediatrics',
    color: '#3498DB',
    bgColor: '#D6EAF8',
    icon: '👶',
    logo: '🧸',
    description: 'Children & Family Care',
    gradient: 'from-blue-400 to-cyan-500',
  },
  oncology: {
    name: 'Oncology',
    color: '#27AE60',
    bgColor: '#D5F4E6',
    icon: '🔬',
    logo: '🧬',
    description: 'Cancer & Tumor Research',
    gradient: 'from-green-500 to-teal-600',
  },
  orthopedics: {
    name: 'Orthopedics',
    color: '#34495E',
    bgColor: '#D5DBDB',
    icon: '🦴',
    logo: '🦵',
    description: 'Bone & Joint Care',
    gradient: 'from-slate-600 to-slate-700',
  },
  neurology: {
    name: 'Neurology',
    color: '#F39C12',
    bgColor: '#FCF3CF',
    icon: '🧪',
    logo: '⚡',
    description: 'Nerve & Brain Health',
    gradient: 'from-amber-500 to-orange-600',
  },
  obstetrics: {
    name: 'Obstetrics & Gynecology',
    color: '#E91E63',
    bgColor: '#FCE4EC',
    icon: '🤰',
    logo: '👩‍🤰',
    description: 'Women & Maternal Health',
    gradient: 'from-pink-500 to-rose-500',
  },
  ophthalmology: {
    name: 'Ophthalmology',
    color: '#1E90FF',
    bgColor: '#EBF5FB',
    icon: '👁️',
    logo: '🔭',
    description: 'Eye & Vision Care',
    gradient: 'from-blue-600 to-indigo-500',
  },
  general: {
    name: 'General Practitioner',
    color: '#16A085',
    bgColor: '#D1F2EB',
    icon: '⚕️',
    logo: '🏥',
    description: 'General Health Care',
    gradient: 'from-teal-500 to-green-600',
  },
}

export const getSpecialtyInfo = (specialty) => {
  const normalized = specialty?.toLowerCase().replace(/\s+/g, '') || 'general'
  return specialtyRegistry[normalized] || specialtyRegistry.general
}

export const getSpecialtyColor = (specialty) => {
  return getSpecialtyInfo(specialty).color
}

export const getSpecialtyBg = (specialty) => {
  return getSpecialtyInfo(specialty).bgColor
}

export const getSpecialtyGradient = (specialty) => {
  return getSpecialtyInfo(specialty).gradient
}

export const getSpecialtyLogo = (specialty) => {
  return getSpecialtyInfo(specialty).logo
}

export const getSpecialtyIcon = (specialty) => {
  return getSpecialtyInfo(specialty).icon
}
