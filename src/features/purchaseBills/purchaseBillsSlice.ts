import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// --- Helper Interfaces (matching your DTO structures for frontend state) ---
// These can be refined or imported from a central types file later

export interface ItemCategory_Ref {
  id: number;
  name: string;
}

export interface BillItem_Ref {
  // This matches BillItemResponseDTO
  id: number;
  // These fields will come from the backend based on the new structure
  masterMaterialId: number;
  masterMaterialCode?: string;
  masterMaterialName: string;
  itemCategoryName: string; // This is now a simple string derived by the backend

  quantity: number;
  unit: string;
  unitPrice: number;
  itemTotalPrice: number;
  grnReceivedForItem: boolean;
  remarks?: string;
}

interface Site_Ref {
  // For referencing within PurchaseBill
  id: number;
  name: string;
  location?: string;
}

interface Supplier_Ref {
  // For referencing within PurchaseBill
  id: number;
  name: string;
  // Add other supplier fields if needed for display in bill context
}

// Main PurchaseBill interface for state (matching PurchaseBillResponseDTO from backend)
export interface PurchaseBill {
  // ... (fields remain the same, but the structure of billItems inside will use the updated BillItem_Ref above)
  id: number;
  billNumber: string;
  billDate: string;
  supplier: Supplier_Ref;
  site: Site_Ref;
  billImagePath?: string;
  overallGrnStatus: string;
  grnHardcopyReceivedByPurchaser: boolean;
  grnHardcopyHandedToAccountant: boolean;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  billItems: BillItem_Ref[]; // This now uses the updated BillItem_Ref
}

// --- Interfaces for API Payloads ---

// For creating a new bill item (This is the key change for the request)
export interface NewBillItemData {
  // <<< UPDATED
  masterMaterialId: number; // Changed from materialName and itemCategoryId
  quantity: number;
  unit: string;
  unitPrice: number;
}

// For creating a new purchase bill (This now uses the updated NewBillItemData)
export interface NewPurchaseBillData {
  billNumber: string;
  billDate: string;
  supplierId: number;
  siteId: number;
  items: NewBillItemData[]; // <<< This now holds a list of the new item structure
}

// --- State Definition ---
interface PurchaseBillsState {
  bills: PurchaseBill[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null | undefined;
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  createError: string | null | undefined;
  selectedBill: PurchaseBill | null;
  selectedBillStatus: "idle" | "loading" | "succeeded" | "failed";
  selectedBillError: string | null | undefined;
  // NEW: Status for GRN updates (can be one generic or separate)
  grnItemUpdateStatus: "idle" | "loading" | "succeeded" | "failed";
  grnItemUpdateError: string | null | undefined;
  grnHeaderUpdateStatus: "idle" | "loading" | "succeeded" | "failed";
  grnHeaderUpdateError: string | null | undefined;
}

const initialState: PurchaseBillsState = {
  bills: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  selectedBill: null,
  selectedBillStatus: "idle",
  selectedBillError: null,
  grnItemUpdateStatus: "idle",
  grnItemUpdateError: null, // <<< NEW
  grnHeaderUpdateStatus: "idle",
  grnHeaderUpdateError: null, // <<< NEW
};

// --- API Base URL ---
const API_BASE_URL = "http://api/v1";

// --- Async Thunks ---

interface UpdateGrnItemPayload {
  billItemId: number;
  received: boolean;
  remarks?: string;
}

// Fetch all purchase bills
export const fetchPurchaseBills = createAsyncThunk<
  PurchaseBill[], // Return type
  void, // Argument type (or add filter params later)
  { rejectValue: string }
>("purchaseBills/fetchPurchaseBills", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/purchase-bills`);
    if (!response.ok) {
      let errorMsg = `Failed to fetch purchase bills: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {
        console.warn("Could not parse error from fetchPurchaseBills:", e);
      }
      return rejectWithValue(errorMsg);
    }
    const data: PurchaseBill[] = await response.json();
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.message || "Network error or failed to fetch purchase bills"
    );
  }
});

// Create a new purchase bill
export const createPurchaseBill = createAsyncThunk<
  PurchaseBill, // Return type: the created PurchaseBill object
  NewPurchaseBillData, // Argument type: data for the new purchase bill
  { rejectValue: { message: string; validationErrors?: string[] } }
>(
  "purchaseBills/createPurchaseBill",
  async (newBillData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBillData),
      });
      if (!response.ok) {
        const errorData = await response.json(); // Expecting ErrorResponseDTO
        return rejectWithValue({
          message:
            errorData.message || `HTTP error! Status: ${response.status}`,
          validationErrors: errorData.validationErrors,
        });
      }
      const createdBill: PurchaseBill = await response.json();
      return createdBill;
    } catch (err: any) {
      return rejectWithValue({
        message:
          err.message || "Network error or failed to create purchase bill",
      });
    }
  }
);

export const fetchPurchaseBillById = createAsyncThunk<
  PurchaseBill, // Return type: the fetched PurchaseBill object
  number, // Argument type: the billId
  { rejectValue: string }
>(
  "purchaseBills/fetchPurchaseBillById",
  async (billId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-bills/${billId}`);
      if (!response.ok) {
        let errorMsg = `Failed to fetch purchase bill ${billId}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMsg = errorData.message;
          }
        } catch (e) {
          console.warn("Could not parse error from fetchPurchaseBillById:", e);
        }
        return rejectWithValue(errorMsg);
      }
      const data: PurchaseBill = await response.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.message ||
          `Network error or failed to fetch purchase bill ${billId}`
      );
    }
  }
);

export const updateGrnForItem = createAsyncThunk<
  PurchaseBill, // Backend returns the updated parent PurchaseBill
  UpdateGrnItemPayload,
  { rejectValue: string } // Or a structured error like for create/update
>("purchaseBills/updateGrnForItem", async (payload, { rejectWithValue }) => {
  try {
    const { billItemId, received, remarks } = payload;
    // Construct query parameters for remarks if present
    const queryParams = new URLSearchParams();
    queryParams.append("received", String(received));
    if (remarks !== undefined) {
      // Only add remarks if it's actually provided
      queryParams.append("remarks", remarks);
    }

    const response = await fetch(
      `${API_BASE_URL}/purchase-bills/items/${billItemId}/grn?${queryParams.toString()}`,
      {
        method: "PATCH", // As per backend controller
      }
    );
    if (!response.ok) {
      let errorMsg = `Failed to update GRN for item ${billItemId}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {}
      return rejectWithValue(errorMsg);
    }
    return (await response.json()) as PurchaseBill;
  } catch (err: any) {
    return rejectWithValue(
      err.message || `Network error updating GRN for item`
    );
  }
});

// NEW: Async thunk for updating GRN Hardcopy status for a Purchase Bill
interface UpdateGrnHardcopyPayload {
  billId: number;
  receivedByPurchaser: boolean;
  handedToAccountant: boolean;
}
export const updateGrnHardcopy = createAsyncThunk<
  PurchaseBill, // Backend returns the updated PurchaseBill
  UpdateGrnHardcopyPayload,
  { rejectValue: string }
>("purchaseBills/updateGrnHardcopy", async (payload, { rejectWithValue }) => {
  try {
    const { billId, receivedByPurchaser, handedToAccountant } = payload;
    const queryParams = new URLSearchParams();
    queryParams.append("receivedByPurchaser", String(receivedByPurchaser));
    queryParams.append("handedToAccountant", String(handedToAccountant));

    const response = await fetch(
      `${API_BASE_URL}/purchase-bills/${billId}/grn-hardcopy?${queryParams.toString()}`,
      {
        method: "PATCH", // As per backend controller
      }
    );
    if (!response.ok) {
      let errorMsg = `Failed to update GRN hardcopy status for bill ${billId}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMsg = errorData.message;
        }
      } catch (e) {}
      return rejectWithValue(errorMsg);
    }
    return (await response.json()) as PurchaseBill;
  } catch (err: any) {
    return rejectWithValue(
      err.message || `Network error updating GRN hardcopy status`
    );
  }
});

// --- Slice Definition ---
const purchaseBillsSlice = createSlice({
  name: "purchaseBills",
  initialState, // Assuming initialState includes all necessary status fields
  reducers: {
    resetCreatePurchaseBillStatus: (state) => {
      state.createStatus = "idle";
      state.createError = null;
    },
    clearSelectedPurchaseBill: (state) => {
      state.selectedBill = null;
      state.selectedBillStatus = "idle";
      state.selectedBillError = null;
    },
    resetGrnItemUpdateStatus: (state) => {
      state.grnItemUpdateStatus = "idle";
      state.grnItemUpdateError = null;
    },
    resetGrnHeaderUpdateStatus: (state) => {
      state.grnHeaderUpdateStatus = "idle";
      state.grnHeaderUpdateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetchPurchaseBills (fetch list)
      .addCase(fetchPurchaseBills.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchPurchaseBills.fulfilled,
        (state, action: PayloadAction<PurchaseBill[]>) => {
          state.status = "succeeded";
          state.bills = action.payload;
        }
      )
      .addCase(fetchPurchaseBills.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })

      // Cases for createPurchaseBill
      .addCase(createPurchaseBill.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(
        createPurchaseBill.fulfilled,
        (state, action: PayloadAction<PurchaseBill>) => {
          state.createStatus = "succeeded";
          state.bills.push(action.payload);
        }
      )
      .addCase(createPurchaseBill.rejected, (state, action) => {
        state.createStatus = "failed";
        if (action.payload) {
          state.createError = action.payload.message;
        } else {
          state.createError = action.error.message;
        }
      })

      // Cases for fetchPurchaseBillById (fetch single bill)
      .addCase(fetchPurchaseBillById.pending, (state) => {
        state.selectedBillStatus = "loading";
        state.selectedBillError = null;
        // state.selectedBill = null; // Optional: clear previous selectedBill while loading new one
      })
      .addCase(
        fetchPurchaseBillById.fulfilled,
        (state, action: PayloadAction<PurchaseBill>) => {
          state.selectedBillStatus = "succeeded";
          state.selectedBill = action.payload;
        }
      )
      .addCase(fetchPurchaseBillById.rejected, (state, action) => {
        state.selectedBillStatus = "failed";
        state.selectedBillError = action.payload || action.error.message;
      })

      // Cases for updateGrnForItem
      .addCase(updateGrnForItem.pending, (state) => {
        state.grnItemUpdateStatus = "loading";
        state.grnItemUpdateError = null;
      })
      .addCase(
        updateGrnForItem.fulfilled,
        (state, action: PayloadAction<PurchaseBill>) => {
          state.grnItemUpdateStatus = "succeeded";
          state.selectedBill = action.payload; // Update the currently viewed bill
          const index = state.bills.findIndex(
            (bill) => bill.id === action.payload.id
          );
          if (index !== -1) {
            state.bills[index] = action.payload; // Also update in the main list
          }
        }
      )
      .addCase(updateGrnForItem.rejected, (state, action) => {
        state.grnItemUpdateStatus = "failed";
        state.grnItemUpdateError = action.payload || action.error.message;
      })

      // Cases for updateGrnHardcopy
      .addCase(updateGrnHardcopy.pending, (state) => {
        state.grnHeaderUpdateStatus = "loading";
        state.grnHeaderUpdateError = null;
      })
      .addCase(
        updateGrnHardcopy.fulfilled,
        (state, action: PayloadAction<PurchaseBill>) => {
          state.grnHeaderUpdateStatus = "succeeded";
          state.selectedBill = action.payload; // Update the currently viewed bill
          const index = state.bills.findIndex(
            (bill) => bill.id === action.payload.id
          );
          if (index !== -1) {
            state.bills[index] = action.payload; // Also update in the main list
          }
        }
      )
      .addCase(updateGrnHardcopy.rejected, (state, action) => {
        state.grnHeaderUpdateStatus = "failed";
        state.grnHeaderUpdateError = action.payload || action.error.message;
      });
  },
});

export const {
  resetCreatePurchaseBillStatus,
  clearSelectedPurchaseBill,
  resetGrnItemUpdateStatus, // <<< EXPORT NEW
  resetGrnHeaderUpdateStatus, // <<< EXPORT NEW
} = purchaseBillsSlice.actions; // <<< EXPORT NEW ACTION

export default purchaseBillsSlice.reducer;

// (Keep existing selectors: selectAllPurchaseBills, selectPurchaseBillsStatus, etc.)
export const selectAllPurchaseBills = (state: RootState) =>
  state.purchaseBills.bills;
export const selectPurchaseBillsStatus = (state: RootState) =>
  state.purchaseBills.status;
export const selectPurchaseBillsError = (state: RootState) =>
  state.purchaseBills.error;
export const selectCreatePurchaseBillStatus = (state: RootState) =>
  state.purchaseBills.createStatus;
export const selectCreatePurchaseBillError = (state: RootState) =>
  state.purchaseBills.createError;

// NEW: Selectors for the currently selected purchase bill
export const selectCurrentPurchaseBill = (state: RootState) =>
  state.purchaseBills.selectedBill;
export const selectCurrentPurchaseBillStatus = (state: RootState) =>
  state.purchaseBills.selectedBillStatus;
export const selectCurrentPurchaseBillError = (state: RootState) =>
  state.purchaseBills.selectedBillError;

// NEW: Selectors for GRN update statuses
export const selectGrnItemUpdateStatus = (state: RootState) =>
  state.purchaseBills.grnItemUpdateStatus;
export const selectGrnItemUpdateError = (state: RootState) =>
  state.purchaseBills.grnItemUpdateError;
export const selectGrnHeaderUpdateStatus = (state: RootState) =>
  state.purchaseBills.grnHeaderUpdateStatus;
export const selectGrnHeaderUpdateError = (state: RootState) =>
  state.purchaseBills.grnHeaderUpdateError;
