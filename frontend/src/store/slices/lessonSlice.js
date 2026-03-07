import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { lessonAPI } from '../../api/lessonAPI';

export const fetchLessons = createAsyncThunk(
  'lessons/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await lessonAPI.getAllLessons(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await lessonAPI.getLessonById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchLessonSigns = createAsyncThunk(
  'lessons/fetchSigns',
  async (lessonId, { rejectWithValue }) => {
    try {
      const response = await lessonAPI.getLessonSigns(lessonId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const lessonSlice = createSlice({
  name: 'lessons',
  initialState: {
    lessons: [],
    currentLesson: null,
    signs: [],
    loading: false,
    error: null,
    filters: {
      category: 'all',
      difficulty: 'all',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
      state.signs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Lessons
      .addCase(fetchLessons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.loading = false;
        state.lessons = action.payload;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to fetch lessons';
      })
      // Fetch Lesson by ID
      .addCase(fetchLessonById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.detail || 'Failed to fetch lesson';
      })
      // Fetch Signs
      .addCase(fetchLessonSigns.fulfilled, (state, action) => {
        state.signs = action.payload;
      });
  },
});

export const { setFilters, clearCurrentLesson } = lessonSlice.actions;
export default lessonSlice.reducer;