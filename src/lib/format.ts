export function normalizeHref(raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value
  if (value.includes('@') && !value.includes('/')) return `mailto:${value}`
  if (/^\+?[\d\s().-]{7,}$/.test(value)) return `tel:${value.replace(/[^\d+]/g, '')}`
  return `https://${value.replace(/^\/+/, '')}`
}

export function displayUrl(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '')
}

export function locationLine(city: string, country: string): string {
  return [city.trim(), country.trim()].filter(Boolean).join(', ')
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function displayPhone(phone: string): string {
  return phone.trim()
}

export function emailHref(email: string): string {
  return `mailto:${email.trim()}`
}

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
