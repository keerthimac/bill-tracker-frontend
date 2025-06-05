import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store'; // Adjust path if your store.ts is located differently

// --- Interfaces ---
interface ItemCategory {
    id: number;
    name: string;
    // Add any other fields from your ItemCategoryDTO if they exist
}

interface NewItemCategoryData {
    name: string;
}

interface UpdateItemCategoryData {
    id: number; // ID is needed to know which category to update
    name: string;
    // Include other updatable fields if ItemCategoryDTO for update has more
}

// --- State Definition ---
interface ItemCategoriesState {
    categories: ItemCategory[];
    // For fetching the list
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null | undefined;
    // For creating a new category
    createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    createError: string | null | undefined;
    // For updating an existing category
    updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    updateError: string | null | undefined;
}

const initialState: ItemCategoriesState = {
    categories: [],
    status: 'idle',
    error: null,
    createStatus: 'idle',
    createError: null,
    updateStatus: 'idle',
    updateError: null,
};

// --- API Base URL ---
const API_BASE_URL = 'http://localhost:8080/api/v1';

// --- Async Thunks ---

// Fetch all item categories
export const fetchItemCategories = createAsyncThunk<
    ItemCategory[], // Return type
    void,           // Argument type (none)
    { rejectValue: string } // Type for rejectWithValue payload
>('itemCategories/fetchItemCategories', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/item-categories`);
        if (!response.ok) {
            let errorMsg = `Failed to fetch item categories: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) { errorMsg = errorData.message; }
            } catch (e) { console.warn("Could not parse error response from fetchItemCategories:", e); }
            return rejectWithValue(errorMsg);
        }
        const data: ItemCategory[] = await response.json();
        return data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Network error or failed to fetch item categories');
    }
});

// Create a new item category
export const createItemCategory = createAsyncThunk<
    ItemCategory,           // Return type
    NewItemCategoryData,    // Argument type
    { rejectValue: { message: string, validationErrors?: string[] } }
>('itemCategories/createItemCategory', async (newItemCategoryData, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/item-categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItemCategoryData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue({
                message: errorData.message || `HTTP error! Status: ${response.status}`,
                validationErrors: errorData.validationErrors
            });
        }
        const createdCategory: ItemCategory = await response.json();
        return createdCategory;
    } catch (err: any) {
        return rejectWithValue({ message: err.message || 'Network error or failed to create item category' });
    }
});

// Update an existing item category
export const updateItemCategory = createAsyncThunk<
    ItemCategory,                // Return type
    UpdateItemCategoryData,      // Argument type
    { rejectValue: { message: string, validationErrors?: string[] } }
>('itemCategories/updateItemCategory', async (categoryData, { rejectWithValue }) => {
    try {
        const { id, ...updatePayload } = categoryData;
        const response = await fetch(`${API_BASE_URL}/item-categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload),
        });
        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue({
                message: errorData.message || `HTTP error! Status: ${response.status}`,
                validationErrors: errorData.validationErrors
            });
        }
        const updatedCategory: ItemCategory = await response.json();
        return updatedCategory;
    } catch (err: any) {
        return rejectWithValue({ message: err.message || 'Network error or failed to update item category' });
    }
});

// --- Slice Definition ---
const itemCategoriesSlice = createSlice({
    name: 'itemCategories',
    initialState,
    reducers: {
        resetCreateItemCategoryStatus: (state) => {
            state.createStatus = 'idle';
            state.createError = null;
        },
        resetUpdateItemCategoryStatus: (state) => {
            state.updateStatus = 'idle';
            state.updateError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Item Categories
            .addCase(fetchItemCategories.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchItemCategories.fulfilled, (state, action: PayloadAction<ItemCategory[]>) => {
                state.status = 'succeeded';
                state.categories = action.payload;
            })
            .addCase(fetchItemCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Create Item Category
            .addCase(createItemCategory.pending, (state) => {
                state.createStatus = 'loading';
                state.createError = null;
            })
            .addCase(createItemCategory.fulfilled, (state, action: PayloadAction<ItemCategory>) => {
                state.createStatus = 'succeeded';
                state.categories.push(action.payload);
            })
            .addCase(createItemCategory.rejected, (state, action) => {
                state.createStatus = 'failed';
                if (action.payload) { state.createError = action.payload.message; }
                else { state.createError = action.error.message; }
            })
            // Update Item Category
            .addCase(updateItemCategory.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(updateItemCategory.fulfilled, (state, action: PayloadAction<ItemCategory>) => {
                state.updateStatus = 'succeeded';
                const index = state.categories.findIndex(cat => cat.id === action.payload.id);
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            .addCase(updateItemCategory.rejected, (state, action) => {
                state.updateStatus = 'failed';
                if (action.payload) { state.updateError = action.payload.message; }
                else { state.updateError = action.error.message; }
            });
    },
});

// --- Exports ---
export const { resetCreateItemCategoryStatus, resetUpdateItemCategoryStatus } = itemCategoriesSlice.actions;

export default itemCategoriesSlice.reducer;

// Selectors
export const selectAllItemCategories = (state: RootState) => state.itemCategories.categories;
// Selectors for fetching the list
export const selectItemCategoriesStatus = (state: RootState) => state.itemCategories.status;
export const selectItemCategoriesError = (state: RootState) => state.itemCategories.error;
// Selectors for creating
export const selectCreateItemCategoryStatus = (state: RootState) => state.itemCategories.createStatus;
export const selectCreateItemCategoryError = (state: RootState) => state.itemCategories.createError;
// Selectors for updating
export const selectUpdateItemCategoryStatus = (state: RootState) => state.itemCategories.updateStatus;
export const selectUpdateItemCategoryError = (state: RootState) => state.itemCategories.updateError;
// Selector to find a single item category by ID
export const selectItemCategoryById = (state: RootState, categoryId: number) =>
    state.itemCategories.categories.find(category => category.id === categoryId);