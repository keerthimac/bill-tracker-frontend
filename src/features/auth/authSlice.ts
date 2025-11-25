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

// --- Async Thunks (Mock Authentication) ---
export const loginUser = createAsyncThunk<
    LoginSuccessPayload,
    { username: string; password: string },
    { rejectValue: LoginRejectPayload }
>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    // Mock authentication - accepts any credentials
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock successful login response
      const loginResponse: LoginSuccessPayload = {
        token: "mock-jwt-token-" + Date.now(),
        user: {
          id: "user-123",
          username: credentials.username,
          displayName: credentials.username.split('@')[0] || credentials.username,
          role: 'admin', // You can change this to 'purchase_officer' or 'supervisor' as needed
        }
      };

      // Store in localStorage
      localStorage.setItem("authToken", loginResponse.token);
      localStorage.setItem("user", JSON.stringify(loginResponse.user));
      
      return loginResponse;
    } catch (error: any) {
      return rejectWithValue({ 
        message: error.message || "Login failed" 
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