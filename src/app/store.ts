import { configureStore } from "@reduxjs/toolkit";
import sitesReducer from "../features/sites/sitesSlice";
import itemCategoriesReducer from "../features/itemCategories/itemCategoriesSlice";
import suppliersReducer from "../features/suppliers/suppliersSlice";
import purchaseBillsReducer from "../features/purchaseBills/purchaseBillsSlice"; // <<< IMPORT
import masterMaterialsReducer from "../features/masterMaterials/masterMaterialsSlice";
import brandsReducer from "../features/brands/brandsSlice"; // <<< IMPORT THE BRANDS REDUCER
import supplierPricesReducer from "../features/supplierPrices/supplierPricesSlice"; // <<< IMPORT THE SUPPLIER PRICES REDUCER

export const store = configureStore({
  reducer: {
    sites: sitesReducer,
    itemCategories: itemCategoriesReducer,
    suppliers: suppliersReducer,
    purchaseBills: purchaseBillsReducer,
    masterMaterials: masterMaterialsReducer,
    brands: brandsReducer,
    supplierPrices: supplierPricesReducer, // <<< ADD THE BRANDS REDUCER
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
