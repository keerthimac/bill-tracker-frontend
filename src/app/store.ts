import { configureStore } from "@reduxjs/toolkit";
import sitesReducer from "../features/sites/sitesSlice";
import itemCategoriesReducer from "../features/itemCategories/itemCategoriesSlice";
import suppliersReducer from "../features/suppliers/suppliersSlice"; // <<< Ensure this import is correct

export const store = configureStore({
  reducer: {
    sites: sitesReducer,
    itemCategories: itemCategoriesReducer,
    suppliers: suppliersReducer, // <<< Ensure this key 'suppliers' matches what your selectors expect (e.g., state.suppliers.suppliers)
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
