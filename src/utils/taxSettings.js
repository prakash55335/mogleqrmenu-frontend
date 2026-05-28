const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1'

export async function fetchTaxSettings() {
  try {
    const res  = await fetch(`${BASE}/billing/tax-settings/`)
    const data = await res.json()
    return data.success
      ? data.data
      : { cgst: 0, sgst: 0, enabled: false }
  } catch {
    return { cgst: 0, sgst: 0, enabled: false }
  }
}

export async function updateTaxSettings(settings) {
  const res = await fetch(`${BASE}/billing/tax-settings/`, {
    method:  'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization:  `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify(settings),
  })
  return res.json()
}

export function calculateTax(subtotal, tax) {
  if (!tax?.enabled) return { cgst: 0, sgst: 0, grandTotal: subtotal }
  const cgst = (subtotal * tax.cgst) / 100
  const sgst = (subtotal * tax.sgst) / 100
  return { cgst, sgst, grandTotal: subtotal + cgst + sgst }
}