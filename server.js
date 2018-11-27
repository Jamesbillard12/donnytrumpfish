const say = require("say");
const Twit = require("twit");
const fs = require("fs");

var nodeoutlook = require("nodejs-nodemailer-outlook");
require("dotenv").config();

let T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

let prevTweet;
let count = 0;

// setInterval(() => {
T.get(
  "statuses/user_timeline",
  { screen_name: "realDonaldTrump", count: 1, tweet_mode: "extended" },
  function(err, data, response) {
    count++;
    console.log(count);
    if (err) console.log(err);
    if (prevTweet !== data[0].full_text) {
      console.log("NEW TWEET");
      console.log(data[0].full_text);
      prevTweet = data[0].full_text;
      // say.speak(data[0].full_text);
      nodeoutlook.sendEmail({
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
        },
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: "New Trump Tweet!",
        text: data[0].full_text
      });
      (async () => {
        const text2wav = require("text2wav");
        let out = await text2wav(data[0].full_text, {
          voice: "en"
        });
        fs.appendFile("bb.wav", new Buffer(out), function(err) {});
      })();
    } else {
      console.log("NO NEW TWEET");
    }
  }
);
// }, 60000);

console.log("up and running");
