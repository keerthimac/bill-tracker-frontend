import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// --- Interfaces (Exported for use in other files like forms) ---
export interface MasterMaterial {
  id: number;
  materialCode?: string;
  name: string;
  description?: string;
  defaultUnit: string;
  itemCategory: { id: number; name: string };
  brand?: { id: number; name: string };
}

export interface NewMasterMaterialData {
  name: string;
  defaultUnit: string;
  itemCategoryId: number;
  materialCode?: string;
  description?: string;
  brandId?: number | null;
}

export interface UpdateMasterMaterialData extends NewMasterMaterialData {
  id: number;
}

// --- State Definition ---
interface MasterMaterialsState {
  materials: MasterMaterial[];
  status: "idle" | "loading" | "succeeded" | "failed"; // For fetching the list
  error: string | null | undefined; // For fetching the list
  operationStatus: "idle" | "loading" | "succeeded" | "failed"; // For Create, Update, Delete
  operationError: string | null | undefined; // For Create, Update, Delete
}

const initialState: MasterMaterialsState = {
  materials: [],
  status: "idle",
  error: null,
  operationStatus: "idle",
  operationError: null,
};

const API_BASE_URL = "http://localhost:8080/api/v1";

// --- Async Thunks for API Calls ---

export const fetchMasterMaterials = createAsyncThunk<
  MasterMaterial[],
  void,
  { rejectValue: string }
>("masterMaterials/fetchMasterMaterials", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/master-materials`);
    if (!response.ok) {
      let errorMsg = `Failed to fetch master materials: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {}
      return rejectWithValue(errorMsg);
    }
    return (await response.json()) as MasterMaterial[];
  } catch (err: any) {
    return rejectWithValue(err.message || "An unknown network error occurred");
  }
});

export const createMasterMaterial = createAsyncThunk<
  MasterMaterial,
  NewMasterMaterialData,
  { rejectValue: { message: string } }
>(
  "masterMaterials/createMasterMaterial",
  async (newMaterialData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/master-materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMaterialData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Failed to create material.",
        });
      }
      return (await response.json()) as MasterMaterial;
    } catch (err: any) {
      return rejectWithValue({ message: err.message });
    }
  }
);

export const updateMasterMaterial = createAsyncThunk<
  MasterMaterial,
  UpdateMasterMaterialData,
  { rejectValue: { message: string } }
>(
  "masterMaterials/updateMasterMaterial",
  async (materialData, { rejectWithValue }) => {
    try {
      const { id, ...updatePayload } = materialData;
      const response = await fetch(`${API_BASE_URL}/master-materials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue({
          message: errorData.message || "Failed to update material.",
        });
      }
      return (await response.json()) as MasterMaterial;
    } catch (err: any) {
      return rejectWithValue({ message: err.message });
    }
  }
);

export const deleteMasterMaterial = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "masterMaterials/deleteMasterMaterial",
  async (materialId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/master-materials/${materialId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to delete material."
        );
      }
      return materialId; // Return the deleted ID on success
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// --- Slice Definition ---
const masterMaterialsSlice = createSlice({
  name: "masterMaterials",
  initialState,
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = "idle";
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    const operationThunks = [
      createMasterMaterial,
      updateMasterMaterial,
      deleteMasterMaterial,
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
            state.operationError =
              action.error.message || "An unknown error occurred.";
          }
        });
    });

    builder
      .addCase(fetchMasterMaterials.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchMasterMaterials.fulfilled,
        (state, action: PayloadAction<MasterMaterial[]>) => {
          state.status = "succeeded";
          state.materials = action.payload;
        }
      )
      .addCase(fetchMasterMaterials.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(
        createMasterMaterial.fulfilled,
        (state, action: PayloadAction<MasterMaterial>) => {
          state.operationStatus = "succeeded";
          state.materials.push(action.payload);
        }
      )
      .addCase(
        updateMasterMaterial.fulfilled,
        (state, action: PayloadAction<MasterMaterial>) => {
          state.operationStatus = "succeeded";
          const index = state.materials.findIndex(
            (m) => m.id === action.payload.id
          );
          if (index !== -1) {
            state.materials[index] = action.payload;
          }
        }
      )
      .addCase(
        deleteMasterMaterial.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.operationStatus = "succeeded";
          state.materials = state.materials.filter(
            (m) => m.id !== action.payload
          );
        }
      );
  },
});

// --- Exports ---
export const { resetOperationStatus } = masterMaterialsSlice.actions;
export default masterMaterialsSlice.reducer;

// --- Selectors ---
export const selectAllMasterMaterials = (state: RootState) =>
  state.masterMaterials.materials;
export const selectMasterMaterialsStatus = (state: RootState) =>
  state.masterMaterials.status;
export const selectMasterMaterialsError = (state: RootState) =>
  state.masterMaterials.error;
export const selectMasterMaterialById = (
  state: RootState,
  materialId: number
) =>
  state.masterMaterials.materials.find(
    (material) => material.id === materialId
  );
export const selectMasterMaterialOperationStatus = (state: RootState) =>
  state.masterMaterials.operationStatus;
export const selectMasterMaterialOperationError = (state: RootState) =>
  state.masterMaterials.operationError;
