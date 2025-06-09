import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// --- Interfaces (Exported for use in other files) ---
export interface ItemCategory {
  id: number;
  name: string;
}

export interface NewItemCategoryData {
  name: string;
}

export interface UpdateItemCategoryData extends NewItemCategoryData {
  id: number;
}

// --- State Definition ---
interface ItemCategoriesState {
  categories: ItemCategory[];
  status: "idle" | "loading" | "succeeded" | "failed"; // For fetching the list
  error: string | null | undefined;
  operationStatus: "idle" | "loading" | "succeeded" | "failed"; // For CUD (Create, Update, Delete)
  operationError: string | null | undefined;
}

const initialState: ItemCategoriesState = {
  categories: [],
  status: "idle",
  error: null,
  operationStatus: "idle",
  operationError: null,
};

const API_BASE_URL = "http://localhost:8080/api/v1";

// --- Async Thunks for API Calls ---

export const fetchItemCategories = createAsyncThunk<
  ItemCategory[],
  void,
  { rejectValue: string }
>("itemCategories/fetchItemCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/item-categories`);
    if (!response.ok) {
      if (response.status === 204) return []; // Handle No Content
      const err = await response.text();
      return rejectWithValue(err || "Failed to fetch item categories.");
    }
    return await response.json();
  } catch (err: any) {
    return rejectWithValue(err.message || "An unknown network error occurred.");
  }
});

export const createItemCategory = createAsyncThunk<
  ItemCategory,
  NewItemCategoryData,
  { rejectValue: { message: string } }
>(
  "itemCategories/createItemCategory",
  async (newCategory, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/item-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(err);
      }
      return await response.json();
    } catch (err: any) {
      return rejectWithValue({ message: err.message });
    }
  }
);

export const updateItemCategory = createAsyncThunk<
  ItemCategory,
  UpdateItemCategoryData,
  { rejectValue: { message: string } }
>(
  "itemCategories/updateItemCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const { id, ...updateData } = categoryData;
      const response = await fetch(`${API_BASE_URL}/item-categories/${id}`, {
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
  }
);

export const deleteItemCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "itemCategories/deleteItemCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/item-categories/${categoryId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const err = await response.json();
        return rejectWithValue(
          err.message || "Failed to delete item category."
        );
      }
      return categoryId; // Return the deleted ID on success
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// --- Slice Definition ---
const itemCategoriesSlice = createSlice({
  name: "itemCategories",
  initialState,
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = "idle";
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    const operationThunks = [
      createItemCategory,
      updateItemCategory,
      deleteItemCategory,
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
      // Fetch List
      .addCase(fetchItemCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchItemCategories.fulfilled,
        (state, action: PayloadAction<ItemCategory[]>) => {
          state.status = "succeeded";
          state.categories = action.payload;
        }
      )
      .addCase(fetchItemCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      // CUD Success Cases
      .addCase(
        createItemCategory.fulfilled,
        (state, action: PayloadAction<ItemCategory>) => {
          state.operationStatus = "succeeded";
          state.categories.push(action.payload);
        }
      )
      .addCase(
        updateItemCategory.fulfilled,
        (state, action: PayloadAction<ItemCategory>) => {
          state.operationStatus = "succeeded";
          const index = state.categories.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) {
            state.categories[index] = action.payload;
          }
        }
      )
      .addCase(
        deleteItemCategory.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.operationStatus = "succeeded";
          state.categories = state.categories.filter(
            (c) => c.id !== action.payload
          );
        }
      );
  },
});

// --- Exports ---
export const { resetOperationStatus } = itemCategoriesSlice.actions;
export default itemCategoriesSlice.reducer;

// --- Selectors ---
export const selectAllItemCategories = (state: RootState) =>
  state.itemCategories.categories;
export const selectItemCategoriesStatus = (state: RootState) =>
  state.itemCategories.status;
export const selectItemCategoriesError = (state: RootState) =>
  state.itemCategories.error;
export const selectItemCategoryById = (state: RootState, categoryId: number) =>
  state.itemCategories.categories.find((c) => c.id === categoryId);
// Selectors for CUD operation status
export const selectItemCategoryOperationStatus = (state: RootState) =>
  state.itemCategories.operationStatus;
export const selectItemCategoryOperationError = (state: RootState) =>
  state.itemCategories.operationError;
