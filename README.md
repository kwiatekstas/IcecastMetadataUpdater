# IcecastMetadataUpdater
Python application for updating the metadata of a web radio station running on Icecast.

## Dependencies
You'll need the requests library to run this. To install, run ```pip install requests```.<br />

## How to set up
```api``` is the address your web radio station is outputting its metadata to. <br />Example: ```api = "http://127.0.0.1/api/nowPlaying"```<br />
Your radio station's metadata should be in JSON. <br />

```icecastUrl``` is the address your Icecast instance has an admin page set up on. <br />
Example: ```icecastUrl = "http://127.0.0.1:8000/admin/metadata.xsl"```

```icecastUsername and icecastPassword``` are the credentials that have to be sent with your request to access the admin panel.<br />

```mount``` under ```icecastParams``` is the mountpoint that your station is streaming on. <br />

