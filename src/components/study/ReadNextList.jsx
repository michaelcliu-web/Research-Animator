import NumberedItem from "./NumberedItem";

// "card" is the dashboard layout, "panel" the narrower feed side panel.
const STYLES = {
  card: {
    list: "space-y-3",
    title: "text-sm font-semibold text-gray-800",
    reason: "text-sm text-gray-500 mt-1",
  },
  panel: {
    list: "space-y-4",
    title: "text-sm font-semibold text-gray-800 leading-snug",
    reason: "text-xs text-gray-500 mt-1 leading-relaxed",
  },
};

/** Papers the backend suggests reading after this one. */
const ReadNextList = ({ papers, variant = "card" }) => {
  const styles = STYLES[variant];
  return (
    <div className={styles.list}>
      {papers.map((paper, index) => (
        <NumberedItem key={index} number={index + 1}>
          <p className={styles.title}>{paper.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {paper.authors}
            {paper.year ? ` · ${paper.year}` : ""}
          </p>
          <p className={styles.reason}>{paper.reason}</p>
        </NumberedItem>
      ))}
    </div>
  );
};

export default ReadNextList;
