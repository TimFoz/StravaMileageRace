
const mongoose = require('mongoose');
const env = require('dotenv');

const db_uri = process.env.MONGODB_URI;
mongoose.connect(db_uri);

// Initialise DB
let commentSchema = mongoose.Schema({
    user: String,
    votes: Number,
    dateTime: Date,
    content: String,
});

let userSchema = mongoose.Schema({
    user_id: Number,
    first_name: String,
    surname: String,
    mileage: Number,
    access_token: String,
    refresh_token: String,
    token_expiry_time: Number,
    image: {
        type: String,
        default: 'default.png'
    },
    goal: Number,
    time_stamp: Date,
});

let activitySchema = mongoose.Schema({
    user_id: Number,
    activity_id: Number,
    description: String,
    distance: Number,
    time_stamp: Date,
    type: String,
}, { strict: false });

let Comment = mongoose.model("Comment", commentSchema);
let User = mongoose.model("User", userSchema);
let Activity = mongoose.model("Activity", activitySchema);

module.exports = {
    commentSchema,
    userSchema,
    activitySchema,
    Comment,
    User,
    Activity
}