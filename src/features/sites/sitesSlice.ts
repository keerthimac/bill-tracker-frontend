import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// Define the shape of your Site data (matches your SiteDTO)
interface Site {
  id: number;
  name: string;
  location?: string;
}

// Define the input type for creating a site (name is required, location is optional)
interface NewSiteData {
  name: string;
  location?: string;
}

// Define the state for this slice
interface SitesState {
  sites: Site[];
  status: "idle" | "loading" | "succeeded" | "failed"; // For fetching
  error: string | null | undefined;
  createStatus: "idle" | "loading" | "succeeded" | "failed"; // For creation
  createError: string | null | undefined; // For creation error
}

const initialState: SitesState = {
  sites: [],
  status: "idle",
  error: null,
  createStatus: "idle", // Initialize creation status
  createError: null, // Initialize creation error
};

const API_BASE_URL = "http://localhost:8080/api/v1";

// Async thunk for fetching sites (you already have this)
export const fetchSites = createAsyncThunk<
  Site[],
  void,
  { rejectValue: string }
>("sites/fetchSites", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sites`);
    if (!response.ok) {
      let errorMsg = response.statusText;
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
    const data: Site[] = await response.json();
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch sites");
  }
});

// NEW: Async thunk for creating a site
export const createSite = createAsyncThunk<
  Site, // Return type: the created Site object (from backend)
  NewSiteData, // Argument type: the data for the new site
  { rejectValue: { message: string; validationErrors?: string[] } } // Type for rejectWithValue payload
>("sites/createSite", async (newSiteData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSiteData),
    });
    if (!response.ok) {
      // Attempt to parse error from backend (could be ErrorResponseDTO)
      const errorData = await response.json();
      return rejectWithValue({
        message: errorData.message || `HTTP error! Status: ${response.status}`,
        validationErrors: errorData.validationErrors,
      });
    }
    const createdSite: Site = await response.json();
    return createdSite;
  } catch (err: any) {
    return rejectWithValue({
      message: err.message || "Failed to create site due to network error",
    });
  }
});

const sitesSlice = createSlice({
  name: "sites",
  initialState,
  reducers: {
    // Can add a reducer to reset createStatus if needed, e.g., after displaying an error
    resetCreateSiteStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetchSites (existing)
      .addCase(fetchSites.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSites.fulfilled, (state, action: PayloadAction<Site[]>) => {
        state.status = "succeeded";
        state.sites = action.payload;
      })
      .addCase(fetchSites.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      // NEW: Cases for createSite
      .addCase(createSite.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createSite.fulfilled, (state, action: PayloadAction<Site>) => {
        state.createStatus = "succeeded";
        state.sites.push(action.payload); // Add the new site to the array
        // Optionally, if you want to keep the list sorted by name or ID:
        // state.sites.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(createSite.rejected, (state, action) => {
        state.createStatus = "failed";
        if (action.payload) {
          state.createError = action.payload.message;
          // If you want to store validation errors separately:
          // state.validationErrors = action.payload.validationErrors;
        } else {
          state.createError = action.error.message;
        }
      });
  },
});

export const { resetCreateSiteStatus } = sitesSlice.actions; // Export new synchronous action

export default sitesSlice.reducer;

// Existing selectors
export const selectAllSites = (state: RootState) => state.sites.sites;
export const selectSitesStatus = (state: RootState) => state.sites.status;
export const selectSitesError = (state: RootState) => state.sites.error;

// NEW: Selectors for creation status/error
export const selectCreateSiteStatus = (state: RootState) =>
  state.sites.createStatus;
export const selectCreateSiteError = (state: RootState) =>
  state.sites.createError;
