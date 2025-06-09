import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// --- Interfaces ---
export interface Site {
  id: number;
  name: string;
  location?: string;
}
export interface NewSiteData {
  name: string;
  location?: string;
}
export interface UpdateSiteData extends NewSiteData {
  id: number;
}

// --- State Definition ---
interface SitesState {
  sites: Site[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
  operationStatus: "idle" | "loading" | "succeeded" | "failed"; // Single status for CUD
  operationError: string | null | undefined;
}

const initialState: SitesState = {
  sites: [],
  status: "idle",
  error: null,
  operationStatus: "idle",
  operationError: null,
};

const API_BASE_URL = "http://localhost:8080/api/v1";

// --- Async Thunks ---
export const fetchSites = createAsyncThunk<
  Site[],
  void,
  { rejectValue: string }
>("sites/fetchSites", async (_, { rejectWithValue }) => {
  try {
    const r = await fetch(`${API_BASE_URL}/sites`);
    if (!r.ok) {
      return rejectWithValue("Failed to fetch sites.");
    }
    return await r.json();
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});
export const createSite = createAsyncThunk<
  Site,
  NewSiteData,
  { rejectValue: { message: string } }
>("sites/createSite", async (newData, { rejectWithValue }) => {
  try {
    const r = await fetch(`${API_BASE_URL}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
    if (!r.ok) {
      return rejectWithValue(await r.json());
    }
    return await r.json();
  } catch (e: any) {
    return rejectWithValue({ message: e.message });
  }
});
export const updateSite = createAsyncThunk<
  Site,
  UpdateSiteData,
  { rejectValue: { message: string } }
>("sites/updateSite", async (data, { rejectWithValue }) => {
  try {
    const { id, ...payload } = data;
    const r = await fetch(`${API_BASE_URL}/sites/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      return rejectWithValue(await r.json());
    }
    return await r.json();
  } catch (e: any) {
    return rejectWithValue({ message: e.message });
  }
});
export const deleteSite = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("sites/deleteSite", async (id, { rejectWithValue }) => {
  try {
    const r = await fetch(`${API_BASE_URL}/sites/${id}`, { method: "DELETE" });
    if (!r.ok) {
      return rejectWithValue((await r.json()).message || "Failed to delete.");
    }
    return id;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

// --- Slice Definition ---
const sitesSlice = createSlice({
  name: "sites",
  initialState,
  reducers: {
    resetOperationStatus: (state) => {
      state.operationStatus = "idle";
      state.operationError = null;
    },
  },
  extraReducers: (builder) => {
    const operationThunks = [createSite, updateSite, deleteSite];
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
      .addCase(createSite.fulfilled, (state, action: PayloadAction<Site>) => {
        state.operationStatus = "succeeded";
        state.sites.push(action.payload);
      })
      .addCase(updateSite.fulfilled, (state, action: PayloadAction<Site>) => {
        state.operationStatus = "succeeded";
        const i = state.sites.findIndex((s) => s.id === action.payload.id);
        if (i !== -1) state.sites[i] = action.payload;
      })
      .addCase(deleteSite.fulfilled, (state, action: PayloadAction<number>) => {
        state.operationStatus = "succeeded";
        state.sites = state.sites.filter((s) => s.id !== action.payload);
      });
  },
});

export const { resetOperationStatus } = sitesSlice.actions;
export default sitesSlice.reducer;

// --- Selectors ---
export const selectAllSites = (state: RootState) => state.sites.sites;
export const selectSitesStatus = (state: RootState) => state.sites.status;
export const selectSiteById = (state: RootState, siteId: number) =>
  state.sites.sites.find((s) => s.id === siteId);
export const selectSiteOperationStatus = (state: RootState) =>
  state.sites.operationStatus;
export const selectSiteOperationError = (state: RootState) =>
  state.sites.operationError;
