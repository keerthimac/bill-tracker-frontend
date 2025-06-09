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

// NEW: Explicit types for thunk payloads
interface LoginSuccessPayload {
    user: User;
    token: string;
}

interface LoginRejectPayload {
    message: string;
}

// --- Mock API & Initial State ---
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

// --- Async Thunks (Corrected with explicit types) ---
export const loginUser = createAsyncThunk<
    LoginSuccessPayload, // Type for a successful return
    { username: string; password: string }, // Type for the argument passed to the thunk
    { rejectValue: LoginRejectPayload } // Type for the value returned from rejectWithValue
>(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    // This mock function returns a promise that either resolves with LoginSuccessPayload
    // or rejects with LoginRejectPayload.
    const mockApiLogin = new Promise<LoginSuccessPayload>((resolve, reject) => {
        setTimeout(() => {
            if (credentials.username === "officer@test.com" && credentials.password === "password") {
                const user: User = { id: 'userPO', username: 'officer@test.com', displayName: 'Purchase Officer', role: 'purchase_officer' };
                const token = "mock-jwt-for-po";
                resolve({ user, token });
            } else if (credentials.username === "admin@test.com" && credentials.password === "password") {
                const user: User = { id: 'userAdmin', username: 'admin@test.com', displayName: 'Admin User', role: 'admin' };
                const token = "mock-jwt-for-admin";
                resolve({ user, token });
            } else {
                reject({ message: "Invalid username or password." });
            }
        }, 500);
    });

    try {
        const response = await mockApiLogin; // Await the promise
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        return response; // This becomes the fulfilled action payload
    } catch (error: any) {
        // If the promise rejects, catch the error and use rejectWithValue
        return rejectWithValue(error as LoginRejectPayload);
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
});

// --- Slice Definition (Corrected extraReducers) ---
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
        // TypeScript now knows action.payload has .user and .token
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        // TypeScript now knows action.payload could be LoginRejectPayload
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

// --- Selectors (No changes needed here) ---
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectAuthIsLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;