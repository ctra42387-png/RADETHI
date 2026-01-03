
import { ExamConfig, GeneratedExamData, SavedExam } from '../types.ts';

const STORAGE_KEY = 'savedExams';

export const getSavedExams = (): SavedExam[] => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const exams = JSON.parse(savedData) as SavedExam[];
      return exams.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }
    return [];
  } catch (error) {
    console.error("Failed to parse saved exams from localStorage", error);
    return [];
  }
};

export const saveExam = (config: ExamConfig, data: GeneratedExamData, title: string): SavedExam => {
  const exams = getSavedExams();
  const newExam: SavedExam = {
    id: Date.now().toString(),
    title,
    savedAt: new Date().toISOString(),
    config,
    data,
  };
  exams.unshift(newExam);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  return newExam;
};

export const deleteExam = (examId: string): void => {
  let exams = getSavedExams();
  exams = exams.filter(exam => exam.id !== examId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
};
