import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import toast from "react-hot-toast";

// ================= LOGIN =================
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

// ================= REGISTER =================
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Registration failed");
    }
  }
);

// ================= FETCH CURRENT USER =================
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch user");
    }
  }
);

// ================= SLICE =================
const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      toast.success("Logged out successfully");
    },

    clearError: (state) => {
      state.error = null;
    },

    updateUserXP: (state, action) => {
      if (state.user) {
        state.user.xp_points += action.payload;
      }
    },
  },

  extraReducers: (builder) => {
    // ================= LOGIN =================
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      toast.success(`Welcome back, ${action.payload.user.full_name}! 👋`);
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;

      let errorMessage = "Login failed";

      if (Array.isArray(action.payload?.detail)) {
        errorMessage = action.payload.detail[0]?.msg;
      } else if (typeof action.payload === "string") {
        errorMessage = action.payload;
      } else if (action.payload?.detail) {
        errorMessage = action.payload.detail;
      }

      state.error = errorMessage;
      toast.error(errorMessage);
    });

    // ================= REGISTER =================
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      toast.success("Account created! Welcome to ISL Platform! 🎉");
    });

    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;

      let errorMessage = "Registration failed";

      if (Array.isArray(action.payload?.detail)) {
        errorMessage = action.payload.detail[0]?.msg;
      } else if (typeof action.payload === "string") {
        errorMessage = action.payload;
      } else if (action.payload?.detail) {
        errorMessage = action.payload.detail;
      }

      state.error = errorMessage;
      toast.error(errorMessage);
    });

    // ================= FETCH CURRENT USER =================
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });

    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
    });
  },
});

export const { logout, clearError, updateUserXP } = authSlice.actions;

export default authSlice.reducer;