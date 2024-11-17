# IcecastMetadataUpdater
Python application for updating the metadata of a web radio station running on Icecast.

## Dependencies
You'll need the requests and yaml libraries to run this. To install, run ```pip install requests``` and ```pip install pyyaml```.<br />

## How to set up
<em>Open the config.yml file in a text editor.</em>

```api``` is the address where your web radio station outputs its metadata. <br />Example: ```api = "http://127.0.0.1/api/nowPlaying"```<br />
Your radio station's metadata should be in JSON format. <br />

```icecastUrl``` is the address where your Icecast instance has an admin page.<br />
Example: ```icecastUrl = "http://127.0.0.1:8000/admin/metadata.xsl"```

```icecastUsername and icecastPassword``` are the credentials required to access the admin panel.<br />

```mount``` under ```icecastParams``` is the mountpoint where your station is streaming. <br />

This script works best with stations hosted on [AzuraCast](https://github.com/AzuraCast/AzuraCast). Other station hosting suites might require some tweaks to work.

## How to use
By default, ENTER will add the ```stationName``` variable into the existing metadata in this format: <br />
```stationName: Artist - Title``` <br /> <br />
Typing ```.n``` will display the next song that'll be played in this format: <br />
```Next up on stationName: Artist - Title``` <br /> <br />
Any other input will replace the existing metadata with the entered text. <br />