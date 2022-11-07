require("dotenv").config();
const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );
// Our routes go here:

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/artist-search", async (req, res) => {
  try {
    console.log("test");
    const name = req.query.artist;
    const searchedArtist = await spotifyApi.searchArtists(name);
    console.log("The received data from the API: ", searchedArtist.body);
    const artistArray = await searchedArtist.body.artists.items;
    res.render("artist-search-results.hbs", { artistArray });
  } catch (error) {
    console.log("The error while searching artists occurred: ", error);
  }
});

app.get("/albums/:id", async (req, res) => {
  try {
    const artistID = req.params.id;
    const albumsData = await spotifyApi.getArtistAlbums(artistID);
    const albumsArray = await albumsData.body.items;
    res.render("albums", { albumsArray });
  } catch (error) {
    console.log(error);
  }
});

app.get("/tracks/:id", async (req, res) => {
  try {
    const albumID = req.params.id;
    const trackList = await (
      await spotifyApi.getAlbumTracks(albumID)
    ).body.items;
    res.render("tracks", { trackList });
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
