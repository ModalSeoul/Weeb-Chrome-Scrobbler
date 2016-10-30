/*
 * Welcome to the wonderful world of vanilla
 * Javascript. Where the dom is our bitch and
 * performance is not something we care about
 * We're 10xers, remember? We change the world
 * simply by writing poor code.
 * If you ain't first, you're Last(.fm).
 *
 * Supports:
 *  Pandora
 *  GooglePlay
 *  Bandcamp
 *  YouTube(soontm)
 *
 * DISCLAIMER:....
 *  This code is awful - Vanilla JS disgusts me. I'll refactor it
 *  upon releasing the alpha site.
 */

/////////////////////////////////////////
// Credentials / extension util
/////////////////////////////////////////
let USER = 'Modal';
let PASS = 'your_password';
let ENV = 'live';
let API;

switch (ENV) {
  case 'dev':
  API = 'http://localhost:8000/api/';
  break;
  case 'live':
  API = 'https://modal.moe/api/';
}

let isPandora;
let isBandcamp;
let isGoogle;
let isYouTube;

let lastSong;
let isAuth = false;
let Auth = {
    'token': '',
    'drfHeader': ''
};

if (window.location.href.indexOf('pandora') > -1) {
  isPandora = true;
} else {
  isPandora = false;
}

if (window.location.href.indexOf('play.google') > -1) {
  isGoogle = true;
} else {
  isGoogle = false;
}

if (window.location.href.indexOf('watch?v=') > -1) {
  isYouTube = true;
} else {
  isYouTube = false;
}

if (window.location.href.indexOf('bandcamp') > -1) {
  isBandcamp = true;
} else {
  isBandcamp = false;
}

console.log(`
  YouTube: ${isYouTube}\n
  Pandora: ${isPandora}\n
  GooglePlay: ${isGoogle}\n
  BandCamp: ${isBandcamp}\n
`);


/////////////////////////////////////////
// What I Listen To
/////////////////////////////////////////
function isAuthenticated() {
  if (isAuth) {
    return true;
  } else {
    return false;
  }
}

function getAuth() {
  chrome.runtime.sendMessage({
      method: 'POST',
      action: 'xhttp',
      url: `${API}api-token-auth/`,
      data: `username=${USER}&password=${PASS}`,
      drf: 'null'
  },function(responseText) {
      Auth.token = JSON.parse(responseText).token;
      Auth.drfHeader = `Token ${Auth.token}`;
  });

}

function scrobble(song, artist, album) {
  chrome.runtime.sendMessage({
      method: 'POST',
      action: 'xhttp',
      url: `${API}scrobbles/`,
      data: `song=${song}&artist=${artist}&album=${album}`,
      drf: Auth.drfHeader
  }, function(responseText) {
      console.log(`Scrobbled ${song} by ${artist} on the album ${album}`);
  });
}


/////////////////////////////////////////
// YouTube
/////////////////////////////////////////
let tag;

function getContentTag() {
  return new Promise((resolve, reject) => {
    let content = document.getElementsByClassName('watch-info-tag-list')[0];
    resolve(content.getElementsByTagName('a')[0].innerHTML);
  });
}

getContentTag().then(r => tag = r);


/////////////////////////////////////////
// Google Play
/////////////////////////////////////////
function getGooglePlayer() {
  return new Promise((resolve, reject) => {
    resolve(document.getElementsByClassName('currently-playing-details')[0]);
  });
}

// temp
let googlePlayer;

function getGoogleAlbum() {
  return new Promise((resolve, reject) => {
    resolve(googlePlayer.getElementsByClassName('player-album')[0].innerHTML);
  });
}

function getGoogleArtist() {
  return new Promise((resolve, reject) => {
    resolve(googlePlayer.getElementsByClassName('player-artist')[0].innerHTML);
  });
}

function getGoogleSong() {
  return new Promise((resolve, reject) => {
    resolve(document.getElementById('currently-playing-title').innerHTML);
  });
}

function googleLoop() {
  getGooglePlayer().then((_player) => {
    googlePlayer = _player;
    getGoogleAlbum().then((_album) => {
      getGoogleSong().then((_song) => {
        getGoogleArtist().then((_artist) => {
          if (lastSong != _song) {
            lastSong = _song;
            scrobble(_song, _artist, _album);
          }
        });
      });
    });
  });
}


/////////////////////////////////////////
// Pandora
/////////////////////////////////////////
function getSong() {
  return new Promise((resolve, reject) => {
    let song = document.getElementsByClassName('songTitle')[0].innerHTML;
    resolve(song);
  });
}

function getAlbum() {
  return new Promise((resolve, reject) => {
    let album = document.getElementsByClassName('albumTitle')[0].innerText;
    resolve(album);
  });
}

function getArtist() {
  return new Promise((resolve, reject) => {
    let artist = document.getElementsByClassName('artistSummary')[0].innerHTML;
    resolve(artist);
  });
}

function pandoraLoop() {
  getSong().then((_song) => {
    getAlbum().then((_album) => {
      getArtist().then((_artist) => {
        if (lastSong != _song) {
          lastSong = _song;
          scrobble(_song, _artist, _album);
        }
      });
    });
  });
}


/////////////////////////////////////////
// Bandcamp
/////////////////////////////////////////
function getBandCampAlbum() {
  return new Promise((resolve, reject) => {
    let album = document.getElementsByClassName('trackTitle')[0].innerHTML;
    resolve(album.trim());
  });
}

function getBandCampSong() {
  return new Promise((resolve, reject) => {
    var song = document.getElementsByClassName('title')[0].innerHTML;
    resolve(song.trim());
  });
}

function getBandCampArtist() {
  return new Promise((resolve, reject) => {
    resolve(document.getElementById('name-section').getElementsByTagName('a')[0].innerHTML);
  });
}

function bandCampLoop() {
  getBandCampAlbum().then((_album) => {
    getBandCampSong().then((_song) => {
      getBandCampArtist().then((_artist) => {
        if (lastSong != _song) {
          lastSong = _song;
          scrobble(_song, _artist, _album);
        }
      });
    });
  });
}


/////////////////////////////////////////
// Main function (loop)
/////////////////////////////////////////
function main() {
  getAuth();
  setInterval(() => {
    if (isPandora) {
      pandoraLoop();
    }
    if (isBandcamp) {
      bandCampLoop();
    }
    if (isGoogle) {
      googleLoop();
    }
  }, 10000);
}

main();
