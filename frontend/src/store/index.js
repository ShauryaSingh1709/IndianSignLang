import { configureStore } from '@reduxjs/toolkit';
import authReducer from '.././store/slices/authSlice';
import lessonReducer from './slices/lessonSlice';
import progressReducer from './slices/progressSlice';
import predictionReducer from './slices/predictionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    lesson: lessonReducer,
    progress: progressReducer,
    prediction: predictionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});