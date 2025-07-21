const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { format } = require('date-fns');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
const help = JSON.parse(fs.readFileSync(path.join(__dirname, 'help.json'), 'utf8'));
const api = config.api;
const icecastUrl = config.icecastUrl;
const skipUrl = config.skipUrl;
const icecastUsername = config.icecastAuth.username;
const icecastPassword = config.icecastAuth.password;
const icecastParams = config.icecastParams;
const apiKey = config.apiKey;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function printHelp() {
  console.log();
  console.log("Available commmands:");
  console.log();
  help.commands.forEach((command) => {
    console.log(command.command, ":", command.description);
  });
  console.log();
}

console.log("Connecting to", api, "- to change this, edit config.json");
console.log();
axios.get(api, {timeout: 15000})
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
    console.log("Type .h or .help to view a list of commands.");
    console.log();

    console.log("Enter information to upload to your Icecast instance, ");
    rl.question("or press ENTER to add your station name to the currently playing song: ", (newResponse) => {
      if (newResponse === "") {
        newResponse = `${stationName}: ${nowPlaying.artist} - ${nowPlaying.title}`;
      } 
      else if (newResponse === ".h" || newResponse === ".help") {
        printHelp();
        rl.close();
        return;
      }
      else if (newResponse === ".n") {
        newResponse = `Next up on ${stationName}: ${playingNext.artist} - ${playingNext.title}`;
      }
      else if (newResponse === ".t") {
        newResponse = `${stationName}: It is ` + curTime + ' on ' + curDate;
      }
      else if (newResponse === ".skip" || ".next") {
        axios({
          method: 'post',
          url: skipUrl,
          headers: {
            'X-API-Key': apiKey,
            'accept': 'application/json'
          },
          data: ''
        })
        .then(response => {
          console.log();
          console.log('Track skipped.', response.status);
          console.log(`Now playing: ${playingNext.artist} - ${playingNext.title}`);
          rl.close();
        })
        .catch(error => {
          if (error.response && error.response.status === 403) {
            console.log();
            console.error(`Access denied. ${error.response.status}`);
            console.log('Check your API key and try again.')
          }
          else {
            console.error('Error skipping track:', error.message);
            if (error.response) {
              console.error('Status:', error.response.status);
              console.error('Details:', error.response.data);
            }
          }
          rl.close();
        });
        return;
      }

      icecastParams.song = newResponse;

      const authHeader = 'Basic ' + Buffer.from(`${icecastUsername}:${icecastPassword}`).toString('base64');

      axios.get(icecastUrl, {
        params: icecastParams,
        headers: {
          'Authorization': authHeader
        },
        timeout: 15000
      })
      .then((response) => {
        if (response.status === 200) {
          console.log();
          console.log("Updated successfully.", response.status);
          console.log(newResponse);
        } 
      })
      .catch((error) => {
          console.error("\nCould not update.");
          if (error.response) {
            console.error(`Server responded with status ${error.response.status} ${error.response.statusText}`);
          } 
          else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            console.error("Connection timed out. Check your network connection.");
          } 
          else if (error.code === 'ECONNREFUSED') {
            console.error("Connection refused by server.");
          }
          else {
            console.error(error.message);
          }
      });

      rl.close();
    });
  })
  .catch(error => {
    console.log();
    if (error.response && error.response.status === 403) {
      console.error(`Access denied. (${error.response.status})`);
      console.log('Check your API key and try again.')
    }
    else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.error("Connection timed out. Please check your network connection.");
    }
    else {
      console.error('Error:', error.message);
    }
    rl.close();
});