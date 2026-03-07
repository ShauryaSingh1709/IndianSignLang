import React from 'react';
const LessonCard = ({ lesson = {} }) => <div style={{background:'white',padding:'20px',borderRadius:'12px',boxShadow:'0 2px 10px rgba(0,0,0,0.08)'}}><h3>{lesson.title || 'Lesson'}</h3><p>{lesson.description || 'Learn new signs'}</p></div>;
export default LessonCard;
