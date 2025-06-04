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

// Define the state for this slice
interface SuppliersState {
  suppliers: Supplier[];
  status: "idle" | "loading" | "succeeded" | "failed"; // For fetching list
  error: string | null | undefined; // Error for fetching list
  createStatus: "idle" | "loading" | "succeeded" | "failed"; // For creation operation
  createError: string | null | undefined; // Error for creation operation
}

const initialState: SuppliersState = {
  suppliers: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
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

// Create the slice
const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    // Synchronous action to reset the creation status/error
    resetCreateSupplierStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetchSuppliers
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
      // Cases for createSupplier
      .addCase(createSupplier.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(
        createSupplier.fulfilled,
        (state, action: PayloadAction<Supplier>) => {
          state.createStatus = "succeeded";
          state.suppliers.push(action.payload); // Add the new supplier to the list
          // Optionally, sort:
          // state.suppliers.sort((a, b) => a.name.localeCompare(b.name));
        }
      )
      .addCase(createSupplier.rejected, (state, action) => {
        state.createStatus = "failed";
        if (action.payload) {
          // Error payload from rejectWithValue
          state.createError = action.payload.message;
          // You could also store action.payload.validationErrors if needed for display
        } else {
          // Generic error from thunk
          state.createError = action.error.message;
        }
      });
  },
});

// Export synchronous actions
export const { resetCreateSupplierStatus } = suppliersSlice.actions;

// Export the reducer
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
