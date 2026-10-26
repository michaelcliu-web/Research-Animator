/** A list row with a small numbered circle on the left. */
const NumberedItem = ({ number, children }) => (
  <div className="flex gap-3">
    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
      {number}
    </span>
    <div>{children}</div>
  </div>
);

export default NumberedItem;
