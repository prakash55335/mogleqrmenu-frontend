import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import { CartProvider }  from './context/CartContext'
import { Toaster }       from 'react-hot-toast'
import ProtectedRoute    from './components/layout/ProtectedRoute'

// ── Customer Pages ───────────────────────────────────────────
import MenuPage           from './pages/customer/MenuPage'
import CartPage           from './pages/customer/CartPage'
import OrderConfirmed     from './pages/customer/OrderConfirmed'
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage'
import FeedbackPage       from './pages/customer/FeedbackPage'

// ── Admin Pages ──────────────────────────────────────────────
import LoginPage   from './pages/admin/LoginPage'
import OrderPage   from './pages/admin/OrderPage'
import BillingPage from './pages/admin/BillingPage'
import BillPrint   from './pages/admin/BillPrint'
import TablesPage  from './pages/admin/TablesPage'
import MenuManagementPage from './pages/admin/MenuManagementPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#18181b',
                color: '#fff',
                border: '1px solid #27272a',
              },
              success: {
                iconTheme: { primary: '#facc15', secondary: '#000' },
              },
            }}
          />
          <Routes>

            {/* ── PUBLIC CUSTOMER ROUTES (no auth needed) ── */}
            <Route path="/menu"            element={<MenuPage />} />
            <Route path="/cart"            element={<CartPage />} />
            <Route path="/order-confirmed" element={<OrderConfirmed />} />
            <Route path="/my-orders"       element={<CustomerOrdersPage />} />
            <Route path="/feedback"        element={<FeedbackPage />} />

            {/* ── ADMIN LOGIN (public) ── */}
            <Route path="/admin/login" element={<Navigate to="/" replace />} />

            {/* ── ADMIN ORDERS ── */}
            <Route path="/admin/orders" element={
              <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
                <OrderPage />
              </ProtectedRoute>
            } />

            {/* ── ADMIN BILLING ── */}
            <Route path="/admin/billing" element={
              <ProtectedRoute allowedRoles={['admin', 'billing']}>
                <BillingPage />
              </ProtectedRoute>
            } />

            {/* ── BILL PRINT ── */}
            <Route path="/admin/bill/:orderId" element={
              <ProtectedRoute allowedRoles={['admin', 'billing']}>
                <BillPrint />
              </ProtectedRoute>
            } />



            <Route path="/admin/menu" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <MenuManagementPage />
                    </ProtectedRoute>
            } />

            {/* ── ADMIN TABLES ── */}
            
            <Route path="/admin/tables" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TablesPage />
              </ProtectedRoute>
            } />

            {/* ── ROOT & CATCH ALL ── */}
          <Route path="/"  element={<LoginPage />} />
          <Route path="*"  element={<Navigate to="/" replace />} />

          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}










