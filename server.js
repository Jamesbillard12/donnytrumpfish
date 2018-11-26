const say = require("say");
const Twit = require("twit");
require("dotenv").config();

let T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

T.get(
  "statuses/user_timeline",
  { screen_name: "realDonaldTrump", count: 1, tweet_mode: "extended" },
  function(err, data, response) {
    console.log(data[0].full_text);
    say.speak(data[0].full_text);
  }
);
