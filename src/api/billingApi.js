// import API from './axiosConfig'

// export const generateBill = (orderId) =>
//   API.post(`/api/v1/billing/generate/${orderId}/`)

// export const getBillDetail = (orderId) =>
//   API.get(`/api/v1/billing/detail/${orderId}/`)

// export const markBillPaid = (billId) =>
//   API.patch(`/api/v1/billing/${billId}/paid/`)

// // Save grand_total (with tax) to the bill
// export const saveBillTotal = (billId, grandTotal) =>
//   API.patch(`/api/v1/billing/${billId}/save-total/`, { grand_total: grandTotal })

// export const completeBill = (orderId) =>
//   API.post(`/api/v1/billing/complete/${orderId}/`)



// import API from './axiosConfig'

// export const generateBill = (orderId) =>
//   API.post(`/api/v1/billing/generate/${orderId}/`)

// export const getBillDetail = (orderId) =>
//   API.get(`/api/v1/billing/detail/${orderId}/`)

// export const markBillPaid = (billId) =>
//   API.patch(`/api/v1/billing/${billId}/paid/`)

// // ✅ This now calls complete which saves grand_total + marks paid + marks order billed
// export const saveBillTotal = (billId, grandTotal) =>
//   API.patch(`/api/v1/billing/${billId}/complete/`, { grand_total: grandTotal })

// export const completeBill = (orderId) =>
//   API.post(`/api/v1/billing/complete/${orderId}/`)

import API from './axiosConfig'

export const generateBill = (orderId) =>
  API.post(`/api/v1/billing/generate/${orderId}/`)

export const getBillDetail = (orderId) =>
  API.get(`/api/v1/billing/detail/${orderId}/`)

export const markBillPaid = (billId) =>
  API.patch(`/api/v1/billing/${billId}/paid/`)

// ✅ Keep this - used by BillingPage.jsx
export const saveBillTotal = (billId, grandTotal) =>
  API.patch(`/api/v1/billing/${billId}/complete/`, { grand_total: grandTotal })

// ✅ Used by BillPrint.jsx
export const completeBill = (billId, grandTotal) =>
  API.patch(`/api/v1/billing/${billId}/complete/`, { grand_total: grandTotal })