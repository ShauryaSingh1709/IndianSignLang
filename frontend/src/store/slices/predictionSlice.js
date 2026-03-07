import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { predictionAPI } from '../../api/predictionAPI';

export const predictSign = createAsyncThunk(
  'prediction/predictSign',
  async (imageFile, { rejectWithValue }) => {
    try {
      const response = await predictionAPI.predictSign(imageFile);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const predictionSlice = createSlice({
  name: 'prediction',
  initialState: {
    currentPrediction: null,
    predictionHistory: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPrediction: (state) => {
      state.currentPrediction = null;
    },
    addToHistory: (state, action) => {
      state.predictionHistory.unshift(action.payload);
      if (state.predictionHistory.length > 10) {
        state.predictionHistory.pop();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(predictSign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(predictSign.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrediction = action.payload;
        state.predictionHistory.unshift({
          ...action.payload,
          timestamp: new Date().toISOString(),
        });
        if (state.predictionHistory.length > 10) {
          state.predictionHistory.pop();
        }
      })
      .addCase(predictSign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Prediction failed';
      });
  },
});

export const { clearPrediction, addToHistory } = predictionSlice.actions;
export default predictionSlice.reducer;