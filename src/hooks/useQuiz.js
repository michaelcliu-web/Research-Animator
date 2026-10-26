import { useState } from "react";
import { countCorrectAnswers, isQuizComplete } from "../utils/quiz";

/** Tracks which option the user picked for each question of a quiz. */
const useQuiz = (questions) => {
  const [answers, setAnswers] = useState({});

  const answerQuestion = (questionIndex, optionIndex) =>
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));

  return {
    answers,
    answerQuestion,
    resetQuiz: () => setAnswers({}),
    questionCount: questions.length,
    isComplete: isQuizComplete(questions, answers),
    correctCount: countCorrectAnswers(questions, answers),
  };
};

export default useQuiz;
