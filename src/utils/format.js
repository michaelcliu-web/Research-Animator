/** e.g. "Mar 29, 2026, 2:12 PM" */
export const formatDateTime = (isoString) =>
  new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
