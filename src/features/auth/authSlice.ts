import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// --- Interfaces ---
export interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'purchase_officer' | 'admin' | 'supervisor';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

// Explicit types for thunk payloads
interface LoginSuccessPayload {
    user: User;
    token: string;
}

interface LoginRejectPayload {
    message: string;
}

// --- Load user from storage ---
const loadUserFromStorage = (): { token: string | null; user: User | null } => {
    const token = localStorage.getItem("authToken");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
        try {
            return { token, user: JSON.parse(userJson) };
        } catch (e) {
            return { token: null, user: null };
        }
    }
    return { token: null, user: null };
};

const initialUserAndToken = loadUserFromStorage();

const initialState: AuthState = {
  user: initialUserAndToken.user,
  token: initialUserAndToken.token,
  isLoggedIn: !!initialUserAndToken.token,
  isLoading: false,
  error: null,
};

// --- Async Thunks (Real API Integration) ---
export const loginUser = createAsyncThunk<
    LoginSuccessPayload,
    { username: string; password: string },
    { rejectValue: LoginRejectPayload }
>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Login failed" }));
        return rejectWithValue({ 
          message: errorData.message || `Login failed with status ${response.status}` 
        });
      }

      const data = await response.json();
      
      // Assuming backend returns: { token: string, user: { id, username, displayName, role } }
      // Adjust this based on your actual backend response structure
      const loginResponse: LoginSuccessPayload = {
        token: data.token || data.accessToken, // Handle both possible field names
        user: {
          id: data.user?.id || data.id || 'unknown',
          username: data.user?.username || data.username || credentials.username,
          displayName: data.user?.displayName || data.user?.name || data.displayName || credentials.username,
          role: data.user?.role || data.role || 'purchase_officer',
        }
      };

      // Store in localStorage
      localStorage.setItem("authToken", loginResponse.token);
      localStorage.setItem("user", JSON.stringify(loginResponse.user));
      
      return loginResponse;
    } catch (error: any) {
      // Network error or other issues
      return rejectWithValue({ 
        message: error.message || "Network error. Please check if the backend is running." 
      });
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
});

// --- Slice Definition ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<LoginSuccessPayload>) => {
        state.isLoading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error.message || "Login Failed";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;

// --- Selectors ---
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectAuthIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;