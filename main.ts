const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { format } = require('date-fns');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const api = config.api;
const icecastUrl = config.icecastUrl;
const icecastUsername = config.icecastAuth.username;
const icecastPassword = config.icecastAuth.password;
const icecastParams = config.icecastParams;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Connecting to", api, "- to change this, edit config.json");
console.log();
axios.get(api)
  .then((response) => {
    const apiResponse = response.data;
    console.log("Response from", api);
    console.log();

    const nowPlaying = apiResponse[0].now_playing.song;
    const playingNext = apiResponse[0].playing_next.song;
    const cuedTime = new Date(apiResponse[0].playing_next.cued_at * 1000).toLocaleTimeString();
    const curTime = new Date().toLocaleTimeString();
    const curDate = format(new Date(), 'MMMM do yyyy');
    const stationName = apiResponse[0].station.name;

    console.log(stationName, apiResponse[0].station.shortcode, apiResponse[0].station.frontend, "/", apiResponse[0].station.backend);
    console.log();
    console.log("Now playing:", nowPlaying.title, "by", nowPlaying.artist);
    console.log("Next up:", playingNext.title, "by", playingNext.artist, "playing at", cuedTime);
    console.log("There are currently", apiResponse[0].listeners.current, "listeners.");
    console.log("The current time is", curTime, "on", curDate);
    console.log();

    console.log("Enter information to upload to your Icecast instance, ");
    rl.question("or press ENTER to add your station name to the currently playing song: ", (newResponse) => {
      if (newResponse === "") {
        newResponse = `${stationName}: ${nowPlaying.artist} - ${nowPlaying.title}`;
      } 
      else if (newResponse === ".n") {
        newResponse = `Next up on ${stationName}: ${playingNext.artist} - ${playingNext.title}`;
      }
      else if (newResponse === ".t") {
        newResponse = `${stationName}: It is ` + curTime + ' on ' + curDate;
      }

      icecastParams.song = newResponse;

      const authHeader = 'Basic ' + Buffer.from(`${icecastUsername}:${icecastPassword}`).toString('base64');

      axios.get(icecastUrl, {
        params: icecastParams,
        headers: {
          'Authorization': authHeader
        }
      })
      .then((response) => {
        if (response.status === 200) {
          console.log();
          console.log("Updated successfully.", response.status);
          console.log(newResponse);
        } else {
          console.log();
          console.log("Could not update.", response.status);
          console.log(response.data);
        }
      })
      .catch((error) => {
        console.error("Could not update: ", error);
      });

      rl.close();
    });
  })
  .catch((error) => {
    console.error(error);
  });