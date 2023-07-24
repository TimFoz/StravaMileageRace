const { Comment, User, Activity } = require('./db.js');
const { calculateCumulativeDistance } = require('./utils.js');

async function getPageData() {
    const activities_tim = await Activity.find({ user_id: 15807255 }).sort({ time_stamp: -1 });
    const activities_jack = await Activity.find({ user_id: 98327767 }).sort({ time_stamp: -1 });

    const lineData_tim = calculateCumulativeDistance(activities_tim);
    const lineData_jack = calculateCumulativeDistance(activities_jack);

    const comments = await Comment.find({});
    const users = await User.find({});
    return {
        "comments": comments,
        "users": users,
        "lineData": {
            "Tim": lineData_tim,
            "Jack": lineData_jack
        }
    };
}

module.exports = {
    getPageData
}