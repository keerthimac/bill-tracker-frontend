import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// --- Interfaces ---
// Matches BrandResponseDTO from backend
export interface Brand {
  id: number;
  name: string;
  description?: string;
  brandImagePath?: string;
}

// For creating a new brand (matches BrandRequestDTO)
interface NewBrandData {
  name: string;
  description?: string;
  brandImagePath?: string;
}

// For updating an existing brand
interface UpdateBrandData extends NewBrandData {
  id: number;
}

// --- State Definition ---
interface BrandsState {
  brands: Brand[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
  // We can use a single 'operationStatus' for create, update, delete
  operationStatus: "idle" | "loading" | "succeeded" | "failed";
  operationError: string | null | undefined;
}

const initialState: BrandsState = {
  brands: [],
  status: "idle",
  error: null,
  operationStatus: "idle",
  operationError: null,
};

const API_BASE_URL = "http://api/v1";

// --- Async Thunks ---

export const fetchBrands = createAsyncThunk<
  Brand[],
  void,
  { rejectValue: string }
>("brands/fetchBrands", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`);
    if (!response.ok) {
      return rejectWithValue("Failed to fetch brands.");
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const createBrand = createAsyncThunk<
  Brand,
  NewBrandData,
  { rejectValue: { message: string } }
>("brands/createBrand", async (newBrand, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBrand),
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

export const updateBrand = createAsyncThunk<
  Brand,
  UpdateBrandData,
  { rejectValue: { message: string } }
>("brands/updateBrand", async (brandData, { rejectWithValue }) => {
  try {
    const { id, ...updateData } = brandData;
    const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
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

export const deleteBrand = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("brands/deleteBrand", async (brandId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/brands/${brandId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json();
      return rejectWithValue(err.message || "Failed to delete brand.");
    }
    return brandId; // Return deleted ID on success
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// --- Slice Definition ---
const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = "idle";
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    // Shared status for Create, Update, Delete
    const operationThunks = [createBrand, updateBrand, deleteBrand];
    operationThunks.forEach((thunk) => {
      builder.addCase(thunk.pending, (state) => {
        state.operationStatus = "loading";
        state.operationError = null;
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.operationStatus = "failed";
        if (
          typeof action.payload === "object" &&
          action.payload &&
          "message" in action.payload
        ) {
          state.operationError = (
            action.payload as { message: string }
          ).message;
        } else {
          state.operationError = action.payload || "An unknown error occurred.";
        }
      });
    });

    builder
      // Fetch
      .addCase(fetchBrands.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchBrands.fulfilled,
        (state, action: PayloadAction<Brand[]>) => {
          state.status = "succeeded";
          state.brands = action.payload;
        }
      )
      .addCase(fetchBrands.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      // Create
      .addCase(createBrand.fulfilled, (state, action: PayloadAction<Brand>) => {
        state.operationStatus = "succeeded";
        state.brands.push(action.payload);
      })
      // Update
      .addCase(updateBrand.fulfilled, (state, action: PayloadAction<Brand>) => {
        state.operationStatus = "succeeded";
        const index = state.brands.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.brands[index] = action.payload;
      })
      // Delete
      .addCase(
        deleteBrand.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.operationStatus = "succeeded";
          state.brands = state.brands.filter((b) => b.id !== action.payload);
        }
      );
  },
});

export const { resetOperationStatus } = brandsSlice.actions;
export default brandsSlice.reducer;

// --- Selectors ---
export const selectAllBrands = (state: RootState) => state.brands.brands;
export const selectBrandsStatus = (state: RootState) => state.brands.status;
export const selectBrandById = (state: RootState, brandId: number) =>
  state.brands.brands.find((b) => b.id === brandId);
export const selectBrandOperationStatus = (state: RootState) =>
  state.brands.operationStatus;
export const selectBrandOperationError = (state: RootState) =>
  state.brands.operationError;
