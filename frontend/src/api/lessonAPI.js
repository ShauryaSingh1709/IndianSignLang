export const lessonAPI = {
  getAllLessons: async () => [
    { id: 1, title: 'Alphabets', icon: '🔤', description: 'Learn A-Z', progress: 60 },
    { id: 2, title: 'Numbers', icon: '🔢', description: 'Learn 0-9', progress: 30 },
  ],
  getLessonById: async (id) => ({ id, title: 'Lesson ' + id, signs: [] }),
};
