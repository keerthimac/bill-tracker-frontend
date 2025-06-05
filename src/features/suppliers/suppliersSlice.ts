import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store"; // Adjust path if your store.ts is located differently

// Define the shape of your Supplier data (matches your SupplierResponseDTO)
interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
}

// Define the input type for creating a new supplier
interface NewSupplierData {
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
}

interface UpdateSupplierData extends NewSupplierData {
  id: number; // ID is crucial for knowing which supplier to update
}

// Define the state for this slice
interface SuppliersState {
  suppliers: Supplier[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  createError: string | null | undefined;
  updateStatus: "idle" | "loading" | "succeeded" | "failed"; // <<< NEW
  updateError: string | null | undefined; // <<< NEW
}

const initialState: SuppliersState = {
  suppliers: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  updateStatus: "idle", // <<< NEW
  updateError: null, // <<< NEW
};

// Define your API base URL
const API_BASE_URL = "http://localhost:8080/api/v1";

// Async thunk for fetching suppliers
export const fetchSuppliers = createAsyncThunk<
  Supplier[], // Return type
  void, // Argument type
  { rejectValue: string }
>("suppliers/fetchSuppliers", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers`);
    if (!response.ok) {
      let errorMsg = `Failed to fetch suppliers: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {
        console.warn("Could not parse error response from fetchSuppliers:", e);
      }
      return rejectWithValue(errorMsg);
    }
    const data: Supplier[] = await response.json();
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.message || "Network error or failed to fetch suppliers"
    );
  }
});

// Async thunk for creating a supplier
export const createSupplier = createAsyncThunk<
  Supplier, // Return type: the created Supplier object
  NewSupplierData, // Argument type: data for the new supplier
  { rejectValue: { message: string; validationErrors?: string[] } }
>("suppliers/createSupplier", async (newSupplierData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSupplierData),
    });
    if (!response.ok) {
      const errorData = await response.json(); // Expecting ErrorResponseDTO
      return rejectWithValue({
        message: errorData.message || `HTTP error! Status: ${response.status}`,
        validationErrors: errorData.validationErrors,
      });
    }
    const createdSupplier: Supplier = await response.json();
    return createdSupplier;
  } catch (err: any) {
    return rejectWithValue({
      message: err.message || "Network error or failed to create supplier",
    });
  }
});

export const updateSupplier = createAsyncThunk<
  Supplier,
  UpdateSupplierData,
  { rejectValue: { message: string; validationErrors?: string[] } }
>("suppliers/updateSupplier", async (supplierData, { rejectWithValue }) => {
  try {
    const { id, ...updateData } = supplierData;
    const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue({
        message: errorData.message || `HTTP error! Status: ${response.status}`,
        validationErrors: errorData.validationErrors,
      });
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue({
      message: err.message || "Failed to update supplier",
    });
  }
});

export const deleteSupplier = createAsyncThunk<
  number, // Return type: the ID of the deleted supplier
  number, // Argument type: the ID of the supplier to delete
  { rejectValue: string }
>("suppliers/deleteSupplier", async (supplierId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      let errorMsg = `Failed to delete supplier: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {
        /* Ignore */
      }
      return rejectWithValue(errorMsg);
    }
    return supplierId; // Return the ID to filter out from state
  } catch (err: any) {
    return rejectWithValue(
      err.message || "Network error or failed to delete supplier"
    );
  }
});

// Create the slice
const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    resetCreateSupplierStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
    resetUpdateSupplierStatus: (state) => {
      state.updateStatus = "idle";
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // (Keep existing cases for fetch, create, update)
      .addCase(fetchSuppliers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(createSupplier.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.suppliers.push(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.createStatus = "failed";
        if (action.payload) state.createError = action.payload.message;
        else state.createError = action.error.message;
      })
      .addCase(updateSupplier.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const index = state.suppliers.findIndex(
          (sup) => sup.id === action.payload.id
        );
        if (index !== -1) {
          state.suppliers[index] = action.payload;
        }
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.updateStatus = "failed";
        if (action.payload) state.updateError = action.payload.message;
        else state.updateError = action.error.message;
      })
      // NEW: Cases for deleteSupplier
      .addCase(deleteSupplier.pending, (state) => {
        // Optional: manage delete status
      })
      .addCase(
        deleteSupplier.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.suppliers = state.suppliers.filter(
            (supplier) => supplier.id !== action.payload
          );
        }
      )
      .addCase(deleteSupplier.rejected, (state, action) => {
        // Optional: manage delete error
        console.error(
          "Failed to delete supplier from slice:",
          action.payload || action.error.message
        );
      });
  },
});

export const { resetCreateSupplierStatus, resetUpdateSupplierStatus } =
  suppliersSlice.actions;
export default suppliersSlice.reducer;

// Export selectors
export const selectAllSuppliers = (state: RootState) =>
  state.suppliers.suppliers;
export const selectSuppliersStatus = (state: RootState) =>
  state.suppliers.status; // For fetching
export const selectSuppliersError = (state: RootState) => state.suppliers.error; // For fetching

// Selectors for creation status/error
export const selectCreateSupplierStatus = (state: RootState) =>
  state.suppliers.createStatus;
export const selectCreateSupplierError = (state: RootState) =>
  state.suppliers.createError;

// Selectors for update status/error
export const selectUpdateSupplierStatus = (state: RootState) =>
  state.suppliers.updateStatus;
export const selectUpdateSupplierError = (state: RootState) =>
  state.suppliers.updateError;

// Selector to find a single supplier by ID
export const selectSupplierById = (state: RootState, supplierId: number) =>
  state.suppliers.suppliers.find((supplier) => supplier.id === supplierId);
