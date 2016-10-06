/*
 * Welcome to the wonderful world of vanilla
 * Javascript. Where the dom is our bitch and
 * performance is not something we care about
 * We're 10xers, remember? We change the world
 * simply by writing poor code.
 * If you ain't first, you're Last(.fm).
 *
 * Also this only works on Pandora right now, sorry.
 */

var USER = 'testacc';
var PASS = 'dddddddddd';
var ENV = 'dev';
var API;
switch (ENV) {
  case 'dev':
  API = 'http://localhost:8000/api/';
  break;
  case 'live':
  API = 'https://no_domain_yet.com/api/'
}

var request = new XMLHttpRequest();
var lastSong;
var Auth = {
    'token': '',
    'drfHeader': ''
};


function isAuthenticated() {
  if (Auth['token'].length != 0) {
    return true;
  }  else {
    return false;
  }
}

function setContent() {
  request.setRequestHeader('Content-Type',
    'application/x-www-form-urlencoded; charset=UTF-8');
}

function getAuth() {
  request.open('POST', `${API}api-token-auth/`, true);
  setContent();
  request.send(`username=${USER}&password=${PASS}`);

  return request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status == 200) {
      Auth['token'] = JSON.parse(request.responseText)['token'];
      Auth['drfHeader'] = `Authorization: Token ${Auth['token']}`;
      return true;
    }
  }
}

function getSong() {
  return new Promise(function(resolve, reject) {
    var song = document.getElementsByClassName('songTitle')[0].innerHTML;
      resolve(song);
  });
}

getArtist = function() {
  var artist = document.getElementsByClassName('artistSummary')[0].innerHTML;
  return artist;
}

function scrobble(song, artist) {
  if (isAuthenticated) {
    chrome.runtime.sendMessage({
        method: 'POST',
        action: 'xhttp',
        url: `${API}scrobbles/`,
        data: `song=${song}&artist=${artist}`
    }, function(responseText) {
        alert(responseText);
    });
  } else {
    console.log('Reauth');
  }
}

function main() {
  setInterval(() => {
    var newArtist = getArtist();
    getSong().then((r) => {
      console.log(lastSong, r);
      if (lastSong != r) {
        lastSong = r;
        scrobble(r, newArtist);
      }
    });
  }, 5000);
}

main();
