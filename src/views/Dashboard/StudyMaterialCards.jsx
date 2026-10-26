import useQuiz from "../../hooks/useQuiz";
import CollapsibleCard from "../../components/common/CollapsibleCard";
import KeyTakeawaysList from "../../components/study/KeyTakeawaysList";
import QuizQuestions, { QuizScoreBadge } from "../../components/study/QuizQuestions";
import ReadNextList from "../../components/study/ReadNextList";

const QuizCard = ({ questions }) => {
  const quiz = useQuiz(questions);
  return (
    <CollapsibleCard title="Knowledge Check" headerExtra={<QuizScoreBadge quiz={quiz} label=" correct" />}>
      <QuizQuestions questions={questions} quiz={quiz} variant="card" />
    </CollapsibleCard>
  );
};

/** Key takeaways, quiz and reading suggestions shown under a finished video. */
const StudyMaterialCards = ({ keyTakeaways, quiz, suggestedPapers }) => (
  <>
    {keyTakeaways.length > 0 && (
      <CollapsibleCard title="Key Takeaways">
        <KeyTakeawaysList takeaways={keyTakeaways} variant="card" />
      </CollapsibleCard>
    )}

    {quiz.length > 0 && <QuizCard questions={quiz} />}

    {suggestedPapers.length > 0 && (
      <CollapsibleCard title="Read Next">
        <ReadNextList papers={suggestedPapers} variant="card" />
      </CollapsibleCard>
    )}
  </>
);

export default StudyMaterialCards;
