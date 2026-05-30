import API from './axiosConfig'

// Customer menu (no auth needed — uses axiosConfig baseURL)
export const getMenu = () => API.get('/api/v1/menu/')

// Admin CRUD (auth token attached automatically by axiosConfig interceptor)
export const menuApi = {
  getAll: () =>
    API.get('/api/v1/menu/')
      .then(r => ({ success: true, data: r.data.data }))
      .catch(e => ({ success: false, errors: e.response?.data })),

  createItem: (data) =>
    API.post('/api/v1/menu/items/', data)
      .then(r => ({ success: true, data: r.data.data }))
      .catch(e => ({ success: false, errors: e.response?.data })),

  updateItem: (id, data) =>
    API.patch(`/api/v1/menu/items/${id}/`, data)
      .then(r => ({ success: true, data: r.data.data }))
      .catch(e => ({ success: false, errors: e.response?.data })),

  deleteItem: (id) =>
    API.delete(`/api/v1/menu/items/${id}/`)
      .then(() => ({ success: true }))
      .catch(e => ({ success: false, errors: e.response?.data })),

  toggleItem: (id) =>
    API.patch(`/api/v1/menu/${id}/toggle/`)
      .then(() => ({ success: true }))
      .catch(() => ({ success: false })),
}