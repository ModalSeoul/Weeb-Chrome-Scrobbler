/*
 * Welcome to the wonderful world of vanilla
 * Javascript. Where the dom is our bitch and
 * performance is not something we care about
 * We're 10xers, remember? We change the world
 * simply by writing poor code.
 * If you ain't first, you're Last(.fm).
 *
 * Also this only works on Pandora right now, sorry.
 *
 * DISCLAIMER:
 *  This code is awful - Vanilla JS disgusts me. I'll refactor it
 *  upon releasing the alpha site.
 */

var USER = 'Modal';
var PASS = 'alpha';
var ENV = 'live';
var API;

switch (ENV) {
  case 'dev':
  API = 'http://localhost:8000/api/';
  break;
  case 'live':
  API = 'https://modal.moe/api/';
}

var isPandora;
var isBandcamp;
var isGoogle;

var lastSong;
var isAuth = false;
var Auth = {
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

if (window.location.href.indexOf('bandcamp') > -1) {
  isBandcamp = true;
} else {
  isBandcamp = false;
}

function getGooglePlayer() {
  return new Promise((resolve, reject) => {
    resolve(document.getElementsByClassName('currently-playing-details')[0]);
  });
}

// temp
var googlePlayer;

console.log(isBandcamp, isPandora, isGoogle);

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

function getSong() {
  return new Promise((resolve, reject) => {
    var song = document.getElementsByClassName('songTitle')[0].innerHTML;
    resolve(song);
  });
}

function getAlbum() {
  return new Promise((resolve, reject) => {
    var album = document.getElementsByClassName('albumTitle')[0].innerText;
    resolve(album);
  });
}

function getArtist() {
  return new Promise((resolve, reject) => {
    var artist = document.getElementsByClassName('artistSummary')[0].innerHTML;
    resolve(artist);
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

function getBandCampAlbum() {
  return new Promise((resolve, reject) => {
    var album = document.getElementsByClassName('trackTitle')[0].innerHTML;
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
    console.log(googlePlayer);
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
