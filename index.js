let express = require('express');
let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();
let app = express();
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');




const port = 80;


let mongoose = require('mongoose');
const { response } = require('express');
mongoose.connect('mongodb://127.0.0.1/my_db');



// inbuilt middleware
app.set('view engine', 'pug');
app.set('views','./views');
app.use(express.static('public'));
app.use(express.static('images'));
// for parsing application/json
app.use(bodyParser.json()); 
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded
// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));



// Initialise DB
let commentSchema = mongoose.Schema({
    user: String,
    votes: Number,
    dateTime: Date,
    content: String,
 });
 
let userSchema = mongoose.Schema({
    user_id: Number,
    name: String,
    mileage: Number,
    access_token: String,
    refresh_token: String,
    token_expiry_time: Number,
 });
 
let Comment = mongoose.model("Comment", commentSchema);
let User = mongoose.model("User", userSchema);










//////// handlers ////////

// INDEX
app.get('/', async function(req, res){
    const comments = await Comment.find({});
    const users = await User.find({});
    res.render(
        'index',
        {
            comments: comments,
            users: users
        },    
    );
 });

// TIM'S SANDBOX FOR FUCKING AROUND
app.get('/sandbox', function(req, res){
    res.render('sandbox');
 });
 

// COMMENT ENDPOINT
app.post('/', async function(req, res){
    let commentInfo = req.body;
    if(!commentInfo.user || !commentInfo.comment) {
        res.render(
            'error', 
            {errorMessage: 'Invalid Info', errorType:'input error'},
        );
    }
    else {
        let newComment = new Comment({
            user: commentInfo.user,
            votes: 0,
            dateTime: Date.now(),
            content: commentInfo.comment
        });
        // ToDo - Make this an async with error handling
        newComment.save();
        const comments = await Comment.find({});
        res.render('index', {comments: comments, flashMessage: "Comment successfully added!"});
    }
});




// UPVOTE/DOWNVOTE ENDPOINTS
app.post('/upvote/:id', async function(req, res){      
    let doc = await Comment.findByIdAndUpdate(req.params.id, {$inc:{votes: 1}});
    res.redirect('/')
});
app.post('/downvote/:id', async function(req, res){      
    let doc = await Comment.findByIdAndUpdate(req.params.id, {$inc:{votes: -1}});
    res.redirect('/')
});







// AUTH ENDPOINT
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = `http://f029-2a00-23c4-f7a1-7d01-789c-aed8-45cf-68a6.ngrok-free.app/callback`;
app.get('/authorize', (req, res) => {
    res.redirect(
      `https://www.strava.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}&scope=activity:read`
    );
  });
  
// AUTH CALLBACK ENDPOINT
app.get('/callback', async (req, res) => {
    const code = req.query.code;
  
    try {
      // Exchange the authorization code for an access token
      const response = await axios.post('https://www.strava.com/oauth/token', null, {
        params: {
          client_id,
          client_secret,
          code,
          grant_type: 'authorization_code',
        },
      });
      const access_token = response.data.access_token;
      const refresh_token = response.data.refresh_token;
      const token_expiry_time = response.data.expires_at;
      console.log(response.data);
  

      let athleteID = response.data.athlete.id;
      let athleteName = `${response.data.athlete.firstname} ${response.data.athlete.lastname}`;
      const athleteStatsResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${athleteID}/stats`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      console.log(athleteStatsResponse.data.ytd_run_totals);
      let athleteMileage = athleteStatsResponse.data.ytd_run_totals.distance;

      let newUser = new User({
        user_id: athleteID, 
        name: athleteName,
        mileage: athleteMileage,
        access_token: access_token,
        refresh_token: refresh_token,
        token_expiry_time: token_expiry_time,
        });
        newUser.save();
  
      res.send('Authorization successful! You can now access Strava data.');
    } catch (error) {
      console.error(error); 
      res.status(500).send('Error occurred during authorization.');
    }
  });







// WEBHOOKS ENDPOINT
// Creates the endpoint for our webhook
app.post('/webhook', async (req, res) => {
    console.log("webhook event received!", req.query, req.body);      
    res.status(200).send('EVENT_RECEIVED');
    console.log('200 Response sent to Strava');
    const user_id = req.body.owner_id; 
    const user_auth_details = await User.findOne({ user_id: user_id }).exec();
    let access_token = user_auth_details.access_token;
    let refresh_token = user_auth_details.refresh_token;
    let token_expiry_time = user_auth_details.token_expiry_time;
    const current_epoch_time = Math.round(Date.now()/1000);
    console.log(`current time: ${current_epoch_time}, token expiry time: ${token_expiry_time}`)

    // Check whether auth token expired, and if so get new access_token, refresh_token and token_expiry_time
    if (user_auth_details.token_expiry_time < Math.round(Date.now() / 1000)) {
        console.log('token expired, getting a new one');
        const response = await axios.post('https://www.strava.com/oauth/token', null, {
            params: {
                client_id,
                client_secret,
                refresh_token,
                grant_type: 'refresh_token'
            }
        });
        console.log(response.data);
        access_token = response.data.access_token;
        refresh_token = response.data.refresh_token;
        token_expiry_time = response.data.expires_at;
    };
    const athleteStatsResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${user_id}/stats`, {
        headers: {
          Authorization: `Bearer ${access_token}`, 
        },
    });
    const new_mileage = athleteStatsResponse.data.ytd_run_totals.distance;
    await User.findOneAndUpdate(
        { user_id: user_id }, 
        { 
            mileage: new_mileage,
            access_token: access_token,
            refresh_token: refresh_token,
            token_expiry_time: token_expiry_time
        }
    ).exec();
    console.log(`mileage for user ${user_id} updated to ${new_mileage}`);
});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = "TIMVSJACK";
  // Parses the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Verifies that the mode and token sent are valid
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {     
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.json({"hub.challenge":challenge});  
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  } else {
      res.status(403).send('Missing "mode" or "token" expected from strava')
  }
});  

  

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });