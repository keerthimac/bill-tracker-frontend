import { configureStore } from "@reduxjs/toolkit";
import sitesReducer from "../features/sites/sitesSlice";
import itemCategoriesReducer from "../features/itemCategories/itemCategoriesSlice";
import suppliersReducer from "../features/suppliers/suppliersSlice";
import purchaseBillsReducer from "../features/purchaseBills/purchaseBillsSlice"; // <<< IMPORT

export const store = configureStore({
  reducer: {
    sites: sitesReducer,
    itemCategories: itemCategoriesReducer,
    suppliers: suppliersReducer,
    purchaseBills: purchaseBillsReducer, // <<< ADD THE PURCHASE BILLS REDUCER
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
