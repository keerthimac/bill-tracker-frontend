import { Routes, Route, Link } from "react-router-dom"; // Ensure Link is imported if used directly here, though likely in Layout
import "./App.css";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SitesPage from "./pages/SitesPage";
import ItemCategoriesPage from "./pages/ItemCategoriesPage";
import SuppliersPage from "./pages/SuppliersPage";
import EditSiteForm from "./features/sites/EditSiteForm"; // <<< IMPORT EditSiteForm
import EditItemCategoryForm from "./features/itemCategories/EditItemCategoryForm";
import EditSupplierForm from "./features/suppliers/EditSupplierForm";
import PurchaseBillsPage from "./pages/PurchaseBillsPage";
import AddPurchaseBillForm from "./features/purchaseBills/AddPurchaseBillForm";
import PurchaseBillDetail from "./features/purchaseBills/PurchaseBillDetail";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
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
          <Route path="purchase-bills" element={<PurchaseBillsPage />} />{" "}
          <Route path="purchase-bills/add" element={<AddPurchaseBillForm />} />
          <Route
            path="purchase-bills/:billId"
            element={<PurchaseBillDetail />}
          />
          {/* <Route path="purchase-bills/:billId" element={<PurchaseBillDetailPage />} /> */}
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
    </>
  );
}

export default App;
