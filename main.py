import requests
import yaml
from time import gmtime, strftime
from requests.auth import HTTPBasicAuth as auth

print("IcecastMetadataUpdater v1.0")
print("https://github.com/kwiatekstas/IcecastMetadataUpdater")
print()

with open("config.yml", "r") as configFile:
    config = yaml.safe_load(configFile)

api = config['api']

print("Connecting to", api, "-", "to change this, edit config.yml")
print()
try:
    response = requests.get(api, timeout=5)
except requests.exceptions.Timeout:
    print("Request to", api, "timed out.")
    print("Check your connection and your server, then try again.")
    exit()

responseData = response.json()
curTime = strftime("%H:%M:%S", gmtime())
curDate = strftime("%d/%m/%Y", gmtime())
print("Response from", api)
print("Your server is now playing:", responseData[0]['now_playing']['song']['artist'], "-", responseData[0]['now_playing']['song']['title'])
print("Next up:", responseData[0]['playing_next']['song']['artist'], "-", responseData[0]['playing_next']['song']['title'])
print("The current time is", curTime, "on", curDate)
print()
stationName = responseData[0]['station']['name']
artist = responseData[0]['now_playing']['song']['artist']
title = responseData[0]['now_playing']['song']['title']
nextArtist = responseData[0]['playing_next']['song']['artist']
nextTitle = responseData[0]['playing_next']['song']['title']

print("Enter information to upload to your Icecast instance,")
newResponse = input("or press ENTER to add your station name to the currently playing song: ")
if newResponse == "":
    newResponse = f"{stationName}: {artist} - {title}"
elif newResponse == ".n":
    newResponse = f"Next up on {stationName}: {nextArtist} - {nextTitle}"
    # Change this text to your liking.
else:
    newResponse = newResponse

icecastUrl = config['icecastUrl']
icecastUsername = config['icecastUsername']
icecastPassword = config['icecastPassword']
icecastParams = config['icecastParams']

updater = requests.get(icecastUrl, params=icecastParams, auth=auth(icecastUsername, icecastPassword))
if response.status_code == 200:
    print("Updated successfully.", response.status_code)
    print(newResponse)
else:
    print("Could not update.", response.status_code)
