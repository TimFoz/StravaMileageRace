function getDaysElapsed() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const timeDifference = currentDate.getTime() - startOfYear.getTime();
    const daysElapsed = Math.floor(timeDifference / (24 * 60 * 60 * 1000)) + 1;
    return daysElapsed;
}


function metersToMiles(meters) {
    const miles = meters / 1609.344;
    return miles;
}


function calculateCumulativeDistance(data) {
    // Sort the activities by time_stamp in ascending order
    data.sort((a, b) => a.time_stamp - b.time_stamp);

    // Initialize variables
    let cumulativeDistance = 0;
    const result = [];

    // Get the current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Iterate through the days of the year
    for (let i = 0; i <= getDaysElapsed(); i++) {
        const currentDay = new Date(currentYear, 0, i);

        // Filter activities for the current day
        const activities = data.filter(
            (activity) =>
                activity.time_stamp.getFullYear() === currentYear &&
                activity.time_stamp.getMonth() === currentDay.getMonth() &&
                activity.time_stamp.getDate() === currentDay.getDate()
        );

        // Calculate the cumulative distance for the current day
        const dailyDistance = activities.reduce(
            (sum, activity) => sum + activity.distance,
            0
        );

        // Add the daily distance to the cumulative distance
        cumulativeDistance += metersToMiles(dailyDistance);

        // Add the cumulative distance to the result array
        result.push([`${currentDay.getDate()}/${currentDay.getMonth() + 1}`, cumulativeDistance]);
    }

    return result;
}

function formatTimeAgo(datetime) {
    const currentTime = new Date();
    const diff = Math.floor((currentTime - datetime) / 1000); // Time difference in seconds

    if (diff < 60) {
        return diff + " seconds ago";
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return minutes + " minutes ago";
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return hours + " hours ago";
    } else if (diff < 2592000) {
        const days = Math.floor(diff / 86400);
        return days + " days ago";
    } else if (diff < 31536000) {
        const months = Math.floor(diff / 2592000);
        return months + " months ago";
    } else {
        const years = Math.floor(diff / 31536000);
        return years + " years ago";
    }
}

module.exports = {
    getDaysElapsed,
    calculateCumulativeDistance,
    formatTimeAgo
};  