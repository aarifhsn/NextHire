const formatDate = (dateString) => {
  if (!dateString) return "-";

  const normalized =
    dateString.length === 10 ? `${dateString}T00:00:00` : dateString;

  return new Date(normalized).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getTimeAgo = (date) => {
  if (!date) return "Unknown";

  const time = new Date(date).getTime();
  if (isNaN(time)) return "Unknown";

  const days = Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

export { formatDate, getTimeAgo };
