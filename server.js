const fs = require("fs");
const { exec } = require("child_process");
const Twit = require("twit");
const play = require("audio-play");
const load = require("audio-loader");
var AudioContext = require("web-audio-api").AudioContext;
context = new AudioContext();
var pcmdata = [];
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

function playsound(soundfile) {
  // linux or raspi
  // var create_audio = exec('aplay'+soundfile, {maxBuffer: 1024 * 500}, function (error, stdout, stderr) {
  var create_audio = exec(
    "ffplay -autoexit " + soundfile,
    { maxBuffer: 1024 * 500 },
    function(error, stdout, stderr) {
      if (error !== null) {
        console.log("exec error: " + error);
      } else {
        //console.log(" finshed ");
        //micInstance.resume();
      }
    }
  );
}

function getbars(val) {
  bars = "";
  for (var i = 0; i < val * 50 + 2; i++) {
    bars = bars + "|";
  }
  return bars;
}

function findPeaks(pcmdata, samplerate) {
  var interval = 0.05 * 1000;
  index = 0;
  var step = Math.round(samplerate * (interval / 1000));
  var max = 0;
  var prevmax = 0;
  var prevdiffthreshold = 0.3;
  //loop through song in time with sample rate
  var samplesound = setInterval(
    function() {
      if (index >= pcmdata.length) {
        clearInterval(samplesound);
        console.log("finished sampling sound");
        return;
      }

      for (var i = index; i < index + step; i++) {
        max = pcmdata[i] > max ? pcmdata[i].toFixed(1) : max;
      }
      // Spot a significant increase? Potential peak
      bars = getbars(max);
      if (max - prevmax >= prevdiffthreshold) {
        bars = bars + " == peak == ";
      }
      // Print out mini equalizer on commandline
      console.log(bars, max);
      prevmax = max;
      max = 0;
      index += step;
    },
    interval,
    pcmdata
  );
}

function decodeSoundFile(soundfile) {
  console.log("decoding mp3 file ", soundfile, " ..... ");
  fs.readFile(soundfile, function(err, buf) {
    if (err) throw err;
    context.decodeAudioData(
      buf,
      function(audioBuffer) {
        console.log(
          audioBuffer.numberOfChannels,
          audioBuffer.length,
          audioBuffer.sampleRate,
          audioBuffer.duration
        );
        pcmdata = audioBuffer.getChannelData(0);
        samplerate = audioBuffer.sampleRate; // store sample rate
        maxvals = [];
        max = 0;
        playsound(soundfile);
        findPeaks(pcmdata, samplerate);
      },
      function(err) {
        throw err;
      }
    );
  });
}

// setInterval(() => {
T.get(
  "statuses/user_timeline",
  { screen_name: "realDonaldTrump", count: 1, tweet_mode: "extended" },
  function(err, data, response) {
    count++;
    console.log(count);
    if (err) console.log(err);
    if (prevTweet !== data[0].full_text) {
      console.log("NEW_TWEET");
      console.log(data[0].full_text);
      prevTweet = data[0].full_text;
      (async () => {
        const text2wav = require("text2wav");
        let out = await text2wav(data[0].full_text, {
          voice: "am+Andy",
          speed: "90",
          pitch: 50,
          noFinalPause: "true"
        });
        fs.appendFile("bb.mp3", new Buffer(out), function(err) {
          // load("./bb.mp3").then(buffer => {
          //   console.log("PLAYING_TWEET");
          //   play(buffer, () => {
          //     console.log("TWEET_PLAYED");
          //   });
          // });
          decodeSoundFile("bb.mp3");

          //   fs.unlink("./bb.mp3", () => {
          //     console.log("TWEET_AUDIO_FILE_DELETED");
          //   });
        });
      })();
      // nodeoutlook.sendEmail({
      //   auth: {
      //     user: process.env.EMAIL,
      //     pass: process.env.PASSWORD
      //   },
      //   from: process.env.EMAIL,
      //   to: process.env.EMAIL,
      //   subject: "New Trump Tweet!",
      //   text: data[0].full_text
      // });
    } else {
      console.log("NO NEW TWEET");
    }
  }
);
// }, 60000);

console.log("DONNY_TRUMP_FISH_RUNNING");
