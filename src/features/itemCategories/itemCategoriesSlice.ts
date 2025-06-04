import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store"; // Adjust path if your store.ts is located differently

// Define the shape of your ItemCategory data (matches your ItemCategoryDTO)
interface ItemCategory {
  id: number;
  name: string;
  // Add any other fields from your ItemCategoryDTO if they exist
}

// Define the input type for creating an item category
interface NewItemCategoryData {
  name: string;
}

// Define the state for this slice
interface ItemCategoriesState {
  categories: ItemCategory[];
  status: "idle" | "loading" | "succeeded" | "failed"; // For fetching list
  error: string | null | undefined; // Error for fetching list
  createStatus: "idle" | "loading" | "succeeded" | "failed"; // For creation operation
  createError: string | null | undefined; // Error for creation operation
}

const initialState: ItemCategoriesState = {
  categories: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
};

// Define your API base URL (consider moving to a central config file later)
const API_BASE_URL = "http://localhost:8080/api/v1";

// Async thunk for fetching item categories
export const fetchItemCategories = createAsyncThunk<
  ItemCategory[], // Return type of the payload creator
  void, // First argument to the payload creator (void for no argument)
  { rejectValue: string } // Optional: type for rejectWithValue payload
>("itemCategories/fetchItemCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/item-categories`);
    if (!response.ok) {
      let errorMsg = `Failed to fetch item categories: ${response.statusText}`; // Default error
      try {
        // Try to parse a more specific error message from backend's ErrorResponseDTO
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {
        // If parsing JSON fails, stick with the default statusText error
        console.warn(
          "Could not parse error response from fetchItemCategories:",
          e
        );
      }
      return rejectWithValue(errorMsg);
    }
    const data: ItemCategory[] = await response.json();
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.message || "Network error or failed to fetch item categories"
    );
  }
});

// Async thunk for creating an item category
export const createItemCategory = createAsyncThunk<
  ItemCategory, // Return type: the created ItemCategory object (from backend)
  NewItemCategoryData, // Argument type: the data for the new item category
  { rejectValue: { message: string; validationErrors?: string[] } } // Type for rejectWithValue payload
>(
  "itemCategories/createItemCategory",
  async (newItemCategoryData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/item-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItemCategoryData),
      });
      if (!response.ok) {
        const errorData = await response.json(); // Expecting ErrorResponseDTO structure
        return rejectWithValue({
          message:
            errorData.message || `HTTP error! Status: ${response.status}`,
          validationErrors: errorData.validationErrors,
        });
      }
      const createdItemCategory: ItemCategory = await response.json();
      return createdItemCategory;
    } catch (err: any) {
      // This catch is for network errors or if response.json() itself fails before errorData can be processed
      return rejectWithValue({
        message:
          err.message || "Network error or failed to create item category",
      });
    }
  }
);

// Create the slice
const itemCategoriesSlice = createSlice({
  name: "itemCategories",
  initialState,
  reducers: {
    // Synchronous action to reset the creation status/error, e.g., after an error has been displayed
    resetCreateItemCategoryStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetchItemCategories
      .addCase(fetchItemCategories.pending, (state) => {
        state.status = "loading";
        state.error = null; // Clear previous fetch errors
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
        state.error = action.payload || action.error.message; // Use rejectWithValue payload or default error
      })
      // Cases for createItemCategory
      .addCase(createItemCategory.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null; // Clear previous create errors
      })
      .addCase(
        createItemCategory.fulfilled,
        (state, action: PayloadAction<ItemCategory>) => {
          state.createStatus = "succeeded";
          state.categories.push(action.payload); // Add the new category to the list
          // Optionally, sort the list if needed:
          // state.categories.sort((a, b) => a.name.localeCompare(b.name));
        }
      )
      .addCase(createItemCategory.rejected, (state, action) => {
        state.createStatus = "failed";
        if (action.payload) {
          // Error payload from rejectWithValue
          state.createError = action.payload.message;
          // You could also store action.payload.validationErrors if needed
        } else {
          // Generic error from thunk
          state.createError = action.error.message;
        }
      });
  },
});

// Export synchronous actions
export const { resetCreateItemCategoryStatus } = itemCategoriesSlice.actions;

// Export the reducer
export default itemCategoriesSlice.reducer;

// Export selectors to easily access data from this slice in your components
export const selectAllItemCategories = (state: RootState) =>
  state.itemCategories.categories;
export const selectItemCategoriesStatus = (state: RootState) =>
  state.itemCategories.status; // For fetching
export const selectItemCategoriesError = (state: RootState) =>
  state.itemCategories.error; // For fetching

// Selectors for creation status/error
export const selectCreateItemCategoryStatus = (state: RootState) =>
  state.itemCategories.createStatus;
export const selectCreateItemCategoryError = (state: RootState) =>
  state.itemCategories.createError;
