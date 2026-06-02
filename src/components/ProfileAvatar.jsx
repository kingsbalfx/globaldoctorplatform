import { Stethoscope, UserRound } from 'lucide-react'

export function getProfileGender(person = {}) {
  const raw = String(person.gender || person.sex || person.gender_identity || '').trim().toLowerCase()
  if (['female', 'woman', 'girl', 'f'].includes(raw)) return 'female'
  if (['male', 'man', 'boy', 'm'].includes(raw)) return 'male'
  if (raw) return 'other'
  return 'unspecified'
}

export function getProfilePhoto(person = {}) {
  return (
    person.profilePhotoUrl ||
    person.profile_photo_url ||
    person.avatarUrl ||
    person.avatar_url ||
    person.photoUrl ||
    person.photo_url ||
    person.passportDataUrl ||
    person.passport_data_url ||
    ''
  )
}

export function getGenderLabel(person = {}) {
  const gender = getProfileGender(person)
  if (gender === 'female') return 'Female'
  if (gender === 'male') return 'Male'
  if (gender === 'other') return 'Other'
  return 'Sex not set'
}

const sizeClasses = {
  sm: { wrap: 'h-10 w-10', icon: 'h-5 w-5', badge: 'h-4 w-4' },
  md: { wrap: 'h-12 w-12', icon: 'h-6 w-6', badge: 'h-5 w-5' },
  lg: { wrap: 'h-16 w-16', icon: 'h-8 w-8', badge: 'h-6 w-6' },
}

function getPalette(gender, role) {
  if (gender === 'female') return 'from-rose-100 via-fuchsia-50 to-amber-100 text-rose-700 ring-rose-200'
  if (gender === 'male') return 'from-sky-100 via-cyan-50 to-emerald-100 text-sky-700 ring-sky-200'
  if (role === 'doctor') return 'from-teal-100 via-white to-indigo-100 text-teal-700 ring-teal-200'
  return 'from-emerald-100 via-white to-violet-100 text-emerald-700 ring-emerald-200'
}

function getRingClass(gender, role) {
  if (gender === 'female') return 'ring-rose-200'
  if (gender === 'male') return 'ring-sky-200'
  if (role === 'doctor') return 'ring-teal-200'
  return 'ring-emerald-200'
}

function GenderIcon({ gender, className }) {
  return <UserRound className={className} aria-hidden="true" />
}

function GenderMark({ gender }) {
  if (gender === 'female') return 'F'
  if (gender === 'male') return 'M'
  if (gender === 'other') return 'O'
  return ''
}

function ProfileAvatar({ person = {}, role = 'patient', size = 'md', showLabel = false, className = '' }) {
  const gender = getProfileGender(person)
  const photo = getProfilePhoto(person)
  const label = getGenderLabel(person)
  const classes = sizeClasses[size] || sizeClasses.md
  const palette = getPalette(gender, role)
  const ringClass = getRingClass(gender, role)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative shrink-0 ${classes.wrap}`}>
        {photo ? (
          <img
            src={photo}
            alt={`${person.name || role} profile`}
            className={`h-full w-full rounded-2xl object-cover ring-2 ${ringClass}`}
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br ${palette} ring-2`}>
            {role === 'doctor' && gender === 'unspecified' ? (
              <Stethoscope className={classes.icon} aria-hidden="true" />
            ) : (
              <GenderIcon gender={gender} className={classes.icon} />
            )}
          </div>
        )}
        <span className={`absolute -bottom-1 -right-1 flex ${classes.badge} items-center justify-center rounded-full bg-white shadow ring-1 ring-slate-200`}>
          {gender === 'unspecified' ? (
            <GenderIcon gender={gender} className="h-3 w-3 text-slate-700" />
          ) : (
            <span className="text-[10px] font-black leading-none text-slate-700">{GenderMark({ gender })}</span>
          )}
        </span>
      </div>
      {showLabel && (
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
          {label}
        </span>
      )}
    </div>
  )
}

export default ProfileAvatar
