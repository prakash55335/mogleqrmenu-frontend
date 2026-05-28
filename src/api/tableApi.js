import API from './axiosConfig'

export const getTables = () => API.get('/api/v1/tables/')