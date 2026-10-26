// `answers` maps a question's index to the index of the option the user chose.

export const isQuizComplete = (questions, answers) =>
  Object.keys(answers).length === questions.length;

export const countCorrectAnswers = (questions, answers) =>
  Object.entries(answers).filter(
    ([questionIndex, chosenOption]) => chosenOption === questions[questionIndex].answer
  ).length;
