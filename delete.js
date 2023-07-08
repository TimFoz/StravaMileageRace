const axios = require('axios');
require('dotenv').config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

async function delete_webhook_subscription(id) {
  const url = 'https://www.strava.com/api/v3/push_subscriptions/' + id;
  console.log(`trying ${url}`);
  try {
    const response = await axios.delete(url, {
      data: {
        client_id,
        client_secret
      }
    });
    console.log(response);
  } catch (error) {
    console.error(`error returned for ${url} - error: ` + error);
  }
}

