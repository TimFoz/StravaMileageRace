const express = require('express');
var parseurl = require('parseurl');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const axios = require('axios');
const dotenv = require('dotenv');
const session = require('express-session')
dotenv.config();

const { formatTimeAgo } = require('./utils.js');
const { Comment, User, Activity } = require('./db.js');
const { getPageData } = require('./dataGetter.js');

const app = express();

// inbuilt middleware
app.set('view engine', 'pug');
app.locals.formatTimeAgo = formatTimeAgo;
app.set('views', './views');
app.use(express.static('public'));
app.use(express.static('public/images'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static('public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}))
app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {}
  }

  // get the url pathname
  var pathname = parseurl(req).pathname

  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1

  next()
})



//////// handlers ////////



// INDEX
app.get('/', async function (req, res) {
  const pageData = await getPageData();
  res.render(
    'index',
    {
      comments: pageData.comments,
      users: pageData.users,
      lineData_tim: pageData.lineData.Tim,
      lineData_jack: pageData.lineData.Jack,
      session: req.session
    },
  );
});

app.get('/AuthSuccess', async function (req, res) {
  const pageData = await getPageData();
  res.render(
    'index',
    {
      comments: pageData.comments,
      users: pageData.users,
      lineData_tim: pageData.lineData.Tim,
      lineData_jack: pageData.lineData.Jack,
      session: req.session
    },
  );
});



// COMMENT ENDPOINT
app.post('/', async function (req, res) {
  let commentInfo = req.body;
  if (!commentInfo.user || !commentInfo.comment) {
    res.render(
      'error',
      { errorMessage: 'Invalid Info', errorType: 'input error' },
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
    const pageData = await getPageData();
    res.render(
      'index',
      {
        comments: pageData.comments,
        users: pageData.users,
        lineData_tim: pageData.lineData.Tim,
        lineData_jack: pageData.lineData.Jack,
        flashMessage: "Comment successfully added!",
      },
    );
  }
});


// SESSION DEBUGGING
app.get('/session', (req, res) => res.send(JSON.stringify(req.session)))


// AUTH ENDPOINT
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
app.get('/authorize', (req, res) => {
  const redirect_uri = req.protocol + '://' + req.get('host') + '/callback';
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
    const [access_token, refresh_token, token_expiry_time] = [response.data.access_token, response.data.refresh_token, response.data.expires_at]


    let athleteID = response.data.athlete.id;
    let athleteFirstName = response.data.athlete.firstname;
    let athleteLastName = response.data.athlete.lastname;
    const athleteStatsResponse = await axios.get(`https://www.strava.com/api/v3/athletes/${athleteID}/stats`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    let athleteMileage = athleteStatsResponse.data.ytd_run_totals.distance;

    var query = { user_id: athleteID },
      update = {
        user_id: athleteID,
        first_name: athleteFirstName,
        surname: athleteLastName,
        mileage: athleteMileage,
        access_token: access_token,
        refresh_token: refresh_token,
        token_expiry_time: token_expiry_time,
        goal: 3000,
        time_stamp: new Date()
      },
      options = { upsert: true, new: true, setDefaultsOnInsert: true };

    // Find the document
    await User.findOneAndUpdate(query, update, options).exec();

    // Set logged in session data 
    if (!req.session.userData) {
      req.session.userData = {}
    }
    req.session.userData.user_id = athleteID
    req.session.userData.name = `${athleteFirstName} ${athleteLastName}`

    res.redirect('/AuthSuccess')
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
  try {
    await update_mileage_for_user(user_id);
    await update_ytd_activity(user_id);

  } catch (err) {
    console.log("error on /webhook when updating mileage for UserID " + user_id);
    console.log(err);
  }
});

// UPDATE ALL USER MILEAGES
app.get('/updateall', async (req, res) => {
  const users = await User.find({});
  const user_ids = users.map(user => user.user_id);
  for (let i = 0; i < user_ids.length; i++) {
    const user_id = user_ids[i];
    try {
      await update_mileage_for_user(user_id);
      await update_ytd_activity(user_id);
    } catch (err) {
      console.log("error on /UpdateAll when updating mileage for UserID " + user_id);
      console.log(err);
    }
  };
  res.render('admin', { flashMessage: 'All YTD mileages sucessfully updated' });
});

app.get('/UpdateYTDTable', async (req, res) => {
  const users = await User.find({});
  const user_ids = users.map(user => user.user_id);
  for (let i = 0; i < user_ids.length; i++) {
    const user_id = user_ids[i];
    try {
      await update_ytd_activity(user_id);
    } catch (err) {
      console.log("error on /UpdateYTDTable when updating mileage for UserID " + user_id);
      console.log(err);
    }
  };
  res.render('admin', { flashMessage: 'Activity log for all users updated' });
});

async function get_user_auth_token(user_id) {
  const user_auth_details = await User.findOne({ user_id: user_id }).exec();
  if (!user_auth_details) {
    throw new Error('no user with user_id ' + user_id)
  }
  let access_token = user_auth_details.access_token;
  let refresh_token = user_auth_details.refresh_token;
  let token_expiry_time = user_auth_details.token_expiry_time;

  // Check whether auth token expired, and if so get new access_token, refresh_token and token_expiry_time
  if (user_auth_details.token_expiry_time < Math.round(Date.now() / 1000)) {
    const response = await axios.post('https://www.strava.com/oauth/token', null, {
      params: {
        client_id,
        client_secret,
        refresh_token,
        grant_type: 'refresh_token'
      }
    });
    access_token = response.data.access_token;
    refresh_token = response.data.refresh_token;
    token_expiry_time = response.data.expires_at;
    await User.findOneAndUpdate(
      { user_id: user_id },
      {
        access_token: access_token,
        refresh_token: refresh_token,
        token_expiry_time: token_expiry_time,
        time_stamp: new Date
      }
    ).exec();
  };
  return access_token;
}

async function update_mileage_for_user(user_id) {

  let access_token = await get_user_auth_token(user_id); // Await the promise returned by get_user_auth_token

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
      time_stamp: new Date()
    }
  ).exec();

}

async function update_ytd_activity(user_id) {
  const access_token = await get_user_auth_token(user_id);

  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const ytd_activity = await axios.get(
      `https://www.strava.com/api/v3/athlete/activities?before=1704067199&after=1672531201&page=${page}&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    let data = ytd_activity.data;

    if (data.length === 0) {
      hasNextPage = false;
    } else {
      for (let i = 0; i < data.length; i++) {
        const activity = data[i];
        if (!(['Run', 'TrailRun', 'VirtualRun'].includes(activity.sport_type))) { continue; } // skip non-running
        var query = { activity_id: activity.id },
          update = {
            user_id: activity.athlete.id,
            activity_id: activity.id,
            description: activity.name,
            distance: activity.distance,
            time_stamp: activity.start_date_local,
            activity_type: activity.sport_type
          },
          options = { upsert: true, new: true, setDefaultsOnInsert: true };

        // Find the document or add if not found
        await Activity.findOneAndUpdate(query, update, options).exec();
      }
      page++; // Move to the next page
    }
  }
}


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
      res.json({ "hub.challenge": challenge });
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    res.status(403).send('Missing "mode" or "token" expected from strava')
  }
});

app.get('/admin', (req, res) =>
  res.render('admin')
)

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});