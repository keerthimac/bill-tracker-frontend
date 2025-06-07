import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

// Import the new layout and all your existing pages
import DashboardLayout from "./components/layout/DashboardLayout";
import HomePage from "./pages/HomePage";
import SitesPage from "./pages/SitesPage";
import ItemCategoriesPage from "./pages/ItemCategoriesPage";
import SuppliersPage from "./pages/SuppliersPage";
import BrandsPage from "./pages/BrandsPage";
import MasterMaterialsPage from "./pages/MasterMaterialsPage";
import AddMasterMaterialForm from "./features/masterMaterials/AddMasterMaterialForm";
import PurchaseBillsPage from "./pages/PurchaseBillsPage";
import AddPurchaseBillForm from "./features/purchaseBills/AddPurchaseBillForm";
import PurchaseBillDetail from "./features/purchaseBills/PurchaseBillDetail";

// Edit form imports
import EditSiteForm from "./features/sites/EditSiteForm";
import EditItemCategoryForm from "./features/itemCategories/EditItemCategoryForm";
import EditSupplierForm from "./features/suppliers/EditSupplierForm";
import EditMasterMaterialForm from "./features/masterMaterials/EditMasterMaterialForm";
import SupplierPricesPage from "./pages/SupplierPricesPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        {/* All your pages are now children of the DashboardLayout */}
        <Route index element={<HomePage />} />

        <Route path="sites" element={<SitesPage />} />
        <Route path="sites/edit/:siteId" element={<EditSiteForm />} />

        <Route path="item-categories" element={<ItemCategoriesPage />} />
        <Route
          path="item-categories/edit/:categoryId"
          element={<EditItemCategoryForm />}
        />

        <Route path="suppliers" element={<SuppliersPage />} />
        <Route
          path="suppliers/edit/:supplierId"
          element={<EditSupplierForm />}
        />

        <Route path="brands" element={<BrandsPage />} />
        {/* We will add routes for add/edit Brands next */}

        <Route path="master-materials" element={<MasterMaterialsPage />} />
        <Route
          path="master-materials/add"
          element={<AddMasterMaterialForm />}
        />
        <Route
          path="master-materials/edit/:materialId"
          element={<EditMasterMaterialForm />}
        />

        <Route path="supplier-prices" element={<SupplierPricesPage />} />

        <Route path="purchase-bills" element={<PurchaseBillsPage />} />
        <Route path="purchase-bills/add" element={<AddPurchaseBillForm />} />
        <Route path="purchase-bills/:billId" element={<PurchaseBillDetail />} />

        {/* Catch-all 404 Page */}
        <Route
          path="*"
          element={
            <div>
              <h2>Page Not Found</h2>
              <Link to="/">Go Home</Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
