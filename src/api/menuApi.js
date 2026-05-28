const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
})

// ── Customer menu (no auth needed) ──
export const getMenu = () =>
  fetch(`${BASE}/menu/`).then(r => r.json())

// ── Admin CRUD (auth required) ──
export const menuApi = {
  getAll: () =>
    fetch(`${BASE}/menu/`).then(r => r.json()),

  createItem: (data) =>
    fetch(`${BASE}/menu/items/`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(data),
    }).then(r => r.json()),

  updateItem: (id, data) =>
    fetch(`${BASE}/menu/items/${id}/`, {
      method:  'PATCH',
      headers: authHeaders(),
      body:    JSON.stringify(data),
    }).then(r => r.json()),

  deleteItem: (id) =>
    fetch(`${BASE}/menu/items/${id}/`, {
      method:  'DELETE',
      headers: authHeaders(),
    }).then(r => r.json()),

  toggleItem: (id) =>
    fetch(`${BASE}/menu/${id}/toggle/`, {
      method:  'PATCH',
      headers: authHeaders(),
    }).then(r => r.json()),
}