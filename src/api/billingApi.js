import API from './axiosConfig'

export const generateBill  = (orderId) => API.post(`/api/v1/billing/generate/${orderId}/`)
export const getBillDetail = (orderId) => API.get(`/api/v1/billing/detail/${orderId}/`)
export const markBillPaid  = (billId)  => API.patch(`/api/v1/billing/${billId}/paid/`)
// Add this to your existing billingApi.js
export const completeBill = (billId) => {
  return API.patch(`/api/v1/billing/${billId}/complete/`)
}