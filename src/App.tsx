import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/Layout'
import {
  CustomRequestsPage,
  CampaignsPage,
  CustomersPage,
  DashboardPage,
  LoginPage,
  OrdersPage,
  ProductsPage,
  VouchersPage,
} from './pages'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/vouchers" element={<VouchersPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/custom-requests" element={<CustomRequestsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
