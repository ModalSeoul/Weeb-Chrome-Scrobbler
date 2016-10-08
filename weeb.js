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

var USER = 'testacc';
var PASS = 'possword';
var ENV = 'dev';
var API;
switch (ENV) {
  case 'dev':
  API = 'http://localhost:8000/api/';
  break;
  case 'live':
  API = 'https://no_domain_yet.com/api/';
}

var lastSong;
var isAuth = false;
var Auth = {
    'token': '',
    'drfHeader': ''
};

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
            scrobble(_song, newArtist, _album);
          }
        });
      }
    });
  });
}

function main() {
  getAuth();
  setInterval(() => {
    pandoraLoop();
  }, 5000);
}

main();
