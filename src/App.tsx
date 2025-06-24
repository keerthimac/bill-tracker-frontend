//import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './app/hooks';
import { selectIsLoggedIn, selectCurrentUser } from './features/auth/authSlice';

import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
// Import all your existing pages
import HomePage from './pages/HomePage';
import SitesPage from './pages/SitesPage';
import ItemCategoriesPage from './pages/ItemCategoriesPage';
import SuppliersPage from './pages/SuppliersPage';
import BrandsPage from './pages/BrandsPage';
import MasterMaterialsPage from './pages/MasterMaterialsPage';
import SupplierPricesPage from './pages/SupplierPricesPage';
import PurchaseBillsPage from './pages/PurchaseBillsPage';
import PurchaseBillDetail from './features/purchaseBills/PurchaseBillDetail';
import AddPurchaseBillForm from './features/purchaseBills/AddPurchaseBillForm';

// A component to protect routes
const ProtectedRoute = () => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  return isLoggedIn ? <DashboardLayout /> : <Navigate to="/login" replace />;
};

function App() {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute />}>
        {/* All app routes are now children of the protected route */}
        <Route index element={<HomePage />} />
        
        {/* Example of role-based access for some routes */}
        { (currentUser?.role === 'admin') && (
            <>
                <Route path="sites" element={<SitesPage />} />
                <Route path="item-categories" element={<ItemCategoriesPage />} />
                <Route path="brands" element={<BrandsPage />} />
                <Route path="supplier-prices" element={<SupplierPricesPage />} />
            </>
        )}

        {/* Routes accessible by all logged-in users in this example */}
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="master-materials" element={<MasterMaterialsPage />} />
        <Route path="purchase-bills" element={<PurchaseBillsPage />} />
        <Route path="purchase-bills/add" element={<AddPurchaseBillForm />} />
        <Route path="purchase-bills/:billId" element={<PurchaseBillDetail />} />

      </Route>
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;