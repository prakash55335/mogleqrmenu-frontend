import API from './axiosConfig'

export const placeOrder        = (data)            => API.post('/api/v1/orders/place/', data)
export const getPendingOrders  = ()                => API.get('/api/v1/orders/pending/')
export const getReadyOrders    = ()                => API.get('/api/v1/orders/ready/')
export const updateOrderStatus = (orderId, status) => API.patch(`/api/v1/orders/${orderId}/status/`, { status })