// "card" is the dashboard layout, "panel" the narrower feed side panel.
const STYLES = {
  card: { optionText: "text-sm", explanationMargin: "mt-2", scoreText: "text-sm" },
  panel: { optionText: "text-xs", explanationMargin: "mt-1.5", scoreText: "text-xs" },
};

const optionColors = ({ answered, isCorrect, isSelected }) => {
  if (!answered) return "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700";
  if (isCorrect) return "border-green-400 bg-green-50 text-green-800 font-medium";
  if (isSelected) return "border-red-300 bg-red-50 text-red-700";
  return "border-gray-100 text-gray-400";
};

/** Small "3/5" pill shown in the quiz header once every question is answered. */
export const QuizScoreBadge = ({ quiz, label = "" }) =>
  quiz.isComplete ? (
    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
      {quiz.correctCount}/{quiz.questionCount}
      {label}
    </span>
  ) : null;

/**
 * Multiple-choice questions. Each question locks after one answer and reveals
 * the correct option and an explanation. `quiz` comes from the useQuiz hook.
 */
const QuizQuestions = ({ questions, quiz, variant = "card" }) => {
  const styles = STYLES[variant];
  return (
    <div className="space-y-5">
      {questions.map((question, questionIndex) => {
        const selectedOption = quiz.answers[questionIndex];
        const answered = selectedOption !== undefined;
        return (
          <div key={questionIndex}>
            <p className="text-sm font-medium text-gray-800 mb-2">
              {questionIndex + 1}. {question.question}
            </p>
            <div className="space-y-1.5">
              {question.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  disabled={answered}
                  onClick={() => quiz.answerQuestion(questionIndex, optionIndex)}
                  className={`w-full text-left ${styles.optionText} px-3 py-2 rounded-lg border transition-colors ${optionColors({
                    answered,
                    isCorrect: optionIndex === question.answer,
                    isSelected: optionIndex === selectedOption,
                  })}`}
                >
                  {option}
                </button>
              ))}
            </div>
            {answered && (
              <p className={`${styles.explanationMargin} text-xs text-gray-500 italic`}>{question.explanation}</p>
            )}
          </div>
        );
      })}
      {quiz.isComplete && (
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className={`${styles.scoreText} text-gray-600`}>
            Score:{" "}
            <span className="font-semibold text-indigo-600">
              {quiz.correctCount}/{questions.length}
            </span>
          </span>
          <button onClick={quiz.resetQuiz} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizQuestions;
