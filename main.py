import requests
from requests.auth import HTTPBasicAuth as auth

api = "http://127.0.0.1/api/nowPlaying"
# Enter your API url here
response = requests.get(api)
responseData = response.json()
print("Response from", api)
print(responseData)
print()
stationName = responseData[0]['station']['name']
artist = responseData[0]['now_playing']['song']['artist']
title = responseData[0]['now_playing']['song']['title']

print("Enter information to upload to your Icecast instance,")
newResponse = input("or press ENTER to add your station name to the currently playing song: ")
if newResponse == "":
    newResponse = f"{stationName}: {artist} - {title}"


icecastUrl = "http://127.0.0.1:8000/admin/metadata.xsl"
icecastUsername = "admin"
icecastPassword = "password"
icecastParams = {
    'song': newResponse,
    'mount': '/mount',
    'mode': 'updinfo',
    'charset': 'UTF-8'
}
# Adjust your Icecast URL, mountpoint, charset and credentials here

updater = requests.get(icecastUrl, params=icecastParams, auth=auth(icecastUsername, icecastPassword))
if response.status_code == 200:
    print("Updated successfully.", response.status_code)
    print(newResponse)
else:
    print("Could not update.", response.status_code)