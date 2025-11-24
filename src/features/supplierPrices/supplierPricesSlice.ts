import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// --- Interfaces (matching backend DTOs) ---

// This is the main data object we will manage in this slice
export interface SupplierPrice {
  id: number;
  supplier: { id: number; name: string };
  masterMaterial: { id: number; name: string; materialCode?: string };
  price: number;
  unit: string;
  effectiveFromDate: string; // ISO Date string
  effectiveToDate?: string | null; // ISO Date string
  isActive: boolean;
}

// For creating a new price entry
export interface NewSupplierPriceData {
  supplierId: number;
  masterMaterialId: number;
  price: number;
  unit: string;
  effectiveFromDate: string;
  effectiveToDate?: string | null;
  isActive?: boolean;
}

// For updating an existing price entry
export interface UpdateSupplierPriceData extends NewSupplierPriceData {
  id: number;
}

// --- State Definition ---
interface SupplierPricesState {
  pricesForSelectedSupplier: SupplierPrice[];
  selectedSupplierId: number | null;
  status: "idle" | "loading" | "succeeded" | "failed"; // For fetching prices
  error: string | null | undefined;
  operationStatus: "idle" | "loading" | "succeeded" | "failed"; // For CUD operations
  operationError: string | null | undefined;
}

const initialState: SupplierPricesState = {
  pricesForSelectedSupplier: [],
  selectedSupplierId: null,
  status: "idle",
  error: null,
  operationStatus: "idle",
  operationError: null,
};

const API_BASE_URL = "http://api/v1";

// --- Async Thunks ---

export const fetchPricesBySupplier = createAsyncThunk<
  SupplierPrice[],
  number,
  { rejectValue: string }
>("supplierPrices/fetchBySupplier", async (supplierId, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/supplier-prices/by-supplier/${supplierId}`
    );
    if (!response.ok) {
      return rejectWithValue("Failed to fetch prices for supplier.");
    }
    // 204 No Content is a valid success response
    if (response.status === 204) return [];
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const addSupplierPrice = createAsyncThunk<
  SupplierPrice,
  NewSupplierPriceData,
  { rejectValue: { message: string } }
>("supplierPrices/addPrice", async (newPriceData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/supplier-prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPriceData),
    });
    if (!response.ok) {
      const err = await response.json();
      return rejectWithValue(err);
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue({ message: err.message });
  }
});

export const updateSupplierPrice = createAsyncThunk<
  SupplierPrice,
  UpdateSupplierPriceData,
  { rejectValue: { message: string } }
>("supplierPrices/updatePrice", async (priceData, { rejectWithValue }) => {
  try {
    const { id, ...updateData } = priceData;
    const response = await fetch(`${API_BASE_URL}/supplier-prices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const err = await response.json();
      return rejectWithValue(err);
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue({ message: err.message });
  }
});

export const deactivateSupplierPrice = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>("supplierPrices/deactivatePrice", async (priceId, { rejectWithValue }) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/supplier-prices/${priceId}/deactivate`,
      { method: "PATCH" }
    );
    if (!response.ok) {
      const err = await response.json();
      return rejectWithValue(err.message || "Failed to deactivate price.");
    }
    // No content is returned on success, so we don't return anything
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// --- Slice Definition ---
const supplierPricesSlice = createSlice({
  name: "supplierPrices",
  initialState,
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = "idle";
      state.operationError = null;
    },
    clearSupplierPrices: (state) => {
      state.pricesForSelectedSupplier = [];
      state.selectedSupplierId = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const operationThunks = [
      addSupplierPrice,
      updateSupplierPrice,
      deactivateSupplierPrice,
    ];
    operationThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.operationStatus = "loading";
          state.operationError = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.operationStatus = "failed";
          const payload = action.payload as
            | { message: string }
            | string
            | undefined;
          if (typeof payload === "object" && payload?.message) {
            state.operationError = payload.message;
          } else if (typeof payload === "string") {
            state.operationError = payload;
          } else {
            state.operationError = "An unknown error occurred.";
          }
        });
    });

    builder
      .addCase(fetchPricesBySupplier.pending, (state, action) => {
        state.status = "loading";
        state.selectedSupplierId = action.meta.arg; // The supplierId passed to the thunk
        state.error = null;
      })
      .addCase(
        fetchPricesBySupplier.fulfilled,
        (state, action: PayloadAction<SupplierPrice[]>) => {
          state.status = "succeeded";
          state.pricesForSelectedSupplier = action.payload;
        }
      )
      .addCase(fetchPricesBySupplier.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      // For CUD, we don't know if the operation affects the currently selected supplier's list,
      // so we set the status to succeeded and let the UI component decide to refetch the list.
      .addCase(addSupplierPrice.fulfilled, (state) => {
        state.operationStatus = "succeeded";
      })
      .addCase(updateSupplierPrice.fulfilled, (state) => {
        state.operationStatus = "succeeded";
      })
      .addCase(deactivateSupplierPrice.fulfilled, (state) => {
        state.operationStatus = "succeeded";
      });
  },
});

// --- Exports ---
export const { resetOperationStatus, clearSupplierPrices } =
  supplierPricesSlice.actions;
export default supplierPricesSlice.reducer;

// --- Selectors ---
export const selectPricesForSupplier = (state: RootState) =>
  state.supplierPrices.pricesForSelectedSupplier;
export const selectPricesFetchStatus = (state: RootState) =>
  state.supplierPrices.status;
export const selectPricesOperationStatus = (state: RootState) =>
  state.supplierPrices.operationStatus;
export const selectPricesOperationError = (state: RootState) =>
  state.supplierPrices.operationError;
