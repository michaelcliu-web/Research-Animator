import NumberedItem from "./NumberedItem";

// "card" is the dashboard layout, "panel" the narrower feed side panel.
const STYLES = {
  card: { list: "space-y-3", definition: "text-sm text-gray-500 mt-0.5" },
  panel: { list: "space-y-4", definition: "text-sm text-gray-500 mt-0.5 leading-relaxed" },
};

const KeyTakeawaysList = ({ takeaways, variant = "card" }) => {
  const styles = STYLES[variant];
  return (
    <div className={styles.list}>
      {takeaways.map((takeaway, index) => (
        <NumberedItem key={index} number={index + 1}>
          <p className="text-sm font-semibold text-gray-800">{takeaway.term}</p>
          <p className={styles.definition}>{takeaway.definition}</p>
        </NumberedItem>
      ))}
    </div>
  );
};

export default KeyTakeawaysList;
