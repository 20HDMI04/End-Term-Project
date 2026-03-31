export const useGetRelativeTime = (dateString: string): string => {
	const now = new Date().getTime();
	const past = new Date(dateString).getTime();

	if (isNaN(past)) return "Invalid date";

	const diffInSeconds = Math.floor((now - past) / 1000);

	const intervals: { [key: string]: number } = {
		year: 31536000,
		month: 2592000,
		week: 604800,
		day: 86400,
		hour: 3600,
		minute: 60,
		second: 1,
	};

	for (const [unit, seconds] of Object.entries(intervals)) {
		const value = Math.floor(diffInSeconds / seconds);
		if (value >= 1) {
			return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
		}
	}
	return "just now";
};
