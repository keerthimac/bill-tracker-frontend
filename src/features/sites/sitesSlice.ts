import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store'; // Adjust path if your store.ts is elsewhere

// --- Interfaces ---
interface Site {
    id: number;
    name: string;
    location?: string;
}

interface NewSiteData {
    name: string;
    location?: string;
}

interface UpdateSiteData {
    id: number; // ID is needed to know which site to update
    name: string;
    location?: string;
}

// --- State Definition ---
interface SitesState {
    sites: Site[];
    // For fetching the list of sites
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null | undefined;
    // For creating a new site
    createStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    createError: string | null | undefined;
    // For updating an existing site
    updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    updateError: string | null | undefined;
}

const initialState: SitesState = {
    sites: [],
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

// Fetch all sites
export const fetchSites = createAsyncThunk<
    Site[], // Return type
    void,   // Argument type (none for this thunk)
    { rejectValue: string } // Type for rejectWithValue payload
>('sites/fetchSites', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/sites`);
        if (!response.ok) {
            let errorMsg = `Failed to fetch sites: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) { errorMsg = errorData.message; }
            } catch (e) { console.warn("Could not parse error response from fetchSites:", e); }
            return rejectWithValue(errorMsg);
        }
        const data: Site[] = await response.json();
        return data;
    } catch (err: any) {
        return rejectWithValue(err.message || 'Network error or failed to fetch sites');
    }
});

// Create a new site
export const createSite = createAsyncThunk<
    Site,           // Return type: the created Site object
    NewSiteData,    // Argument type: data for the new site
    { rejectValue: { message: string, validationErrors?: string[] } }
>('sites/createSite', async (newSiteData, { rejectWithValue }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/sites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSiteData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            return rejectWithValue({
                message: errorData.message || `HTTP error! Status: ${response.status}`,
                validationErrors: errorData.validationErrors
            });
        }
        const createdSite: Site = await response.json();
        return createdSite;
    } catch (err: any) {
        return rejectWithValue({ message: err.message || 'Network error or failed to create site' });
    }
});

// Update an existing site
export const updateSite = createAsyncThunk<
    Site,                // Return type: the updated Site object
    UpdateSiteData,      // Argument type: includes id and updated data
    { rejectValue: { message: string, validationErrors?: string[] } }
>('sites/updateSite', async (siteData, { rejectWithValue }) => {
    try {
        const { id, ...updatePayload } = siteData; // Separate id from the data to be sent in body
        const response = await fetch(`${API_BASE_URL}/sites/${id}`, {
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
        const updatedSite: Site = await response.json();
        return updatedSite;
    } catch (err: any) {
        return rejectWithValue({ message: err.message || 'Network error or failed to update site' });
    }
});


// --- Slice Definition ---
const sitesSlice = createSlice({
    name: 'sites',
    initialState,
    reducers: {
        resetCreateSiteStatus: (state) => {
            state.createStatus = 'idle';
            state.createError = null;
        },
        resetUpdateSiteStatus: (state) => {
            state.updateStatus = 'idle';
            state.updateError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Sites
            .addCase(fetchSites.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSites.fulfilled, (state, action: PayloadAction<Site[]>) => {
                state.status = 'succeeded';
                state.sites = action.payload;
            })
            .addCase(fetchSites.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            // Create Site
            .addCase(createSite.pending, (state) => {
                state.createStatus = 'loading';
                state.createError = null;
            })
            .addCase(createSite.fulfilled, (state, action: PayloadAction<Site>) => {
                state.createStatus = 'succeeded';
                state.sites.push(action.payload);
                // Optionally sort if desired: state.sites.sort((a, b) => a.name.localeCompare(b.name));
            })
            .addCase(createSite.rejected, (state, action) => {
                state.createStatus = 'failed';
                if (action.payload) { state.createError = action.payload.message; }
                else { state.createError = action.error.message; }
            })
            // Update Site
            .addCase(updateSite.pending, (state) => {
                state.updateStatus = 'loading';
                state.updateError = null;
            })
            .addCase(updateSite.fulfilled, (state, action: PayloadAction<Site>) => {
                state.updateStatus = 'succeeded';
                const index = state.sites.findIndex(site => site.id === action.payload.id);
                if (index !== -1) {
                    state.sites[index] = action.payload; // Update the site in the array
                }
            })
            .addCase(updateSite.rejected, (state, action) => {
                state.updateStatus = 'failed';
                if (action.payload) { state.updateError = action.payload.message; }
                else { state.updateError = action.error.message; }
            });
    },
});

// --- Exports ---
export const { resetCreateSiteStatus, resetUpdateSiteStatus } = sitesSlice.actions;

export default sitesSlice.reducer;

// Selectors
export const selectAllSites = (state: RootState) => state.sites.sites;
// Selectors for fetching the list
export const selectSitesStatus = (state: RootState) => state.sites.status;
export const selectSitesError = (state: RootState) => state.sites.error;
// Selectors for creating a site
export const selectCreateSiteStatus = (state: RootState) => state.sites.createStatus;
export const selectCreateSiteError = (state: RootState) => state.sites.createError;
// Selectors for updating a site
export const selectUpdateSiteStatus = (state: RootState) => state.sites.updateStatus;
export const selectUpdateSiteError = (state: RootState) => state.sites.updateError;
// Selector to find a single site by ID
export const selectSiteById = (state: RootState, siteId: number) =>
    state.sites.sites.find(site => site.id === siteId);