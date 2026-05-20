// src/lib/validation.js

const licensePatterns = {
  'united states': /^[A-Z]{2}\d{6,8}$/,
  'united kingdom': /^\d{7}$/,
  'nigeria': /^MDCN\/\d{4,6}$/,
  'india': /^[A-Z]{2}\/\d{4,6}$/,
  'kenya': /^[A-Z]\d{5}$/,
  'canada': /^\d{5,6}$/,
  // add more as needed
}

export function validateLicenseNumber(license, country) {
  if (!license || !license.trim()) return 'License number is required.'
  const key = Object.keys(licensePatterns).find(k => country.toLowerCase().includes(k))
  if (key && !licensePatterns[key].test(license.trim())) {
    return `Invalid license format for ${country}. Expected like: ${licensePatterns[key]}`
  }
  return null
}