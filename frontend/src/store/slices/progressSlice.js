import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {progressAPI} from '../../utils/api/progressAPI';
import { toast } from 'react-toastify';

export const fetchProgressStats = createAsyncThunk(
  'progress/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await progressAPI.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchLessonProgress = createAsyncThunk(
  'progress/fetchLessonProgress',
  async (_, { rejectWithValue }) => {
    try {
      const response = await progressAPI.getLessonProgress();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateLessonProgress = createAsyncThunk(
  'progress/updateLesson',
  async ({ lessonId, data }, { rejectWithValue }) => {
    try {
      const response = await progressAPI.updateProgress(lessonId, data);
      toast.success('Progress updated!');
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState: {
    stats: {
      total_lessons: 0,
      completed_lessons: 0,
      in_progress: 0,
      completion_rate: 0,
      average_score: 0,
      total_xp: 0,
      current_streak: 0,
    },
    lessonProgress: [],
    loading: false,
    error: null,
  },
  reducers: {
    incrementXP: (state, action) => {
      state.stats.total_xp += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgressStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchLessonProgress.fulfilled, (state, action) => {
        state.lessonProgress = action.payload;
      })
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        const index = state.lessonProgress.findIndex(
          (p) => p.lesson_id === action.payload.lesson_id
        );
        if (index !== -1) {
          state.lessonProgress[index] = action.payload;
        } else {
          state.lessonProgress.push(action.payload);
        }
      });
  },
});

export const { incrementXP } = progressSlice.actions;
export default progressSlice.reducer;