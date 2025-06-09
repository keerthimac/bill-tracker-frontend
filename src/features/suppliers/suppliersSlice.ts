import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// --- Interfaces ---
export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
}
export interface NewSupplierData {
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
}
export interface UpdateSupplierData extends NewSupplierData {
  id: number;
}

// --- State Definition ---
interface SuppliersState {
  suppliers: Supplier[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
  operationStatus: "idle" | "loading" | "succeeded" | "failed"; // Single status for CUD
  operationError: string | null | undefined;
}

const initialState: SuppliersState = {
  suppliers: [],
  status: "idle",
  error: null,
  operationStatus: "idle",
  operationError: null,
};

const API_BASE_URL = "http://localhost:8080/api/v1";

// --- Async Thunks ---
export const fetchSuppliers = createAsyncThunk<
  Supplier[],
  void,
  { rejectValue: string }
>("suppliers/fetchSuppliers", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers`);
    if (!response.ok) {
      if (response.status === 204) return [];
      return rejectWithValue("Failed to fetch suppliers.");
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const createSupplier = createAsyncThunk<
  Supplier,
  NewSupplierData,
  { rejectValue: { message: string } }
>("suppliers/createSupplier", async (newSupplier, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSupplier),
    });
    if (!response.ok) {
      return rejectWithValue(await response.json());
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue({ message: err.message });
  }
});

export const updateSupplier = createAsyncThunk<
  Supplier,
  UpdateSupplierData,
  { rejectValue: { message: string } }
>("suppliers/updateSupplier", async (supplierData, { rejectWithValue }) => {
  try {
    const { id, ...updateData } = supplierData;
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      return rejectWithValue(await response.json());
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue({ message: err.message });
  }
});

export const deleteSupplier = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("suppliers/deleteSupplier", async (supplierId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json();
      return rejectWithValue(err.message || "Failed to delete supplier.");
    }
    return supplierId;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// --- Slice Definition ---
const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = "idle";
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    const operationThunks = [createSupplier, updateSupplier, deleteSupplier];
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
      .addCase(fetchSuppliers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchSuppliers.fulfilled,
        (state, action: PayloadAction<Supplier[]>) => {
          state.status = "succeeded";
          state.suppliers = action.payload;
        }
      )
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(
        createSupplier.fulfilled,
        (state, action: PayloadAction<Supplier>) => {
          state.operationStatus = "succeeded";
          state.suppliers.push(action.payload);
        }
      )
      .addCase(
        updateSupplier.fulfilled,
        (state, action: PayloadAction<Supplier>) => {
          state.operationStatus = "succeeded";
          const i = state.suppliers.findIndex(
            (s) => s.id === action.payload.id
          );
          if (i !== -1) state.suppliers[i] = action.payload;
        }
      )
      .addCase(
        deleteSupplier.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.operationStatus = "succeeded";
          state.suppliers = state.suppliers.filter(
            (s) => s.id !== action.payload
          );
        }
      );
  },
});

export const { resetOperationStatus } = suppliersSlice.actions;
export default suppliersSlice.reducer;

// --- Selectors ---
export const selectAllSuppliers = (state: RootState) =>
  state.suppliers.suppliers;
export const selectSuppliersStatus = (state: RootState) =>
  state.suppliers.status;
export const selectSupplierById = (state: RootState, supplierId: number) =>
  state.suppliers.suppliers.find((s) => s.id === supplierId);
export const selectSupplierOperationStatus = (state: RootState) =>
  state.suppliers.operationStatus;
export const selectSupplierOperationError = (state: RootState) =>
  state.suppliers.operationError;
