import API from './axiosConfig'

export const loginUser  = (data)    => API.post('/api/v1/auth/login/', data)
export const logoutUser = (refresh) => API.post('/api/v1/auth/logout/', { refresh })
export const getMe      = ()        => API.get('/api/v1/auth/me/')