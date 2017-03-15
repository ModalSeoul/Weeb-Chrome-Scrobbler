let API = 'https://wilt.fm/api/';

function getId() {
  return new Promise((yes, no) => {
    yes(document.getElementById('uname').value);
  });
}

function getPw() {
  return new Promise((yes, no) => {
    yes(document.getElementById('passwd').value);
  });
}

function getAuth() {
  getId().then((inputId) => {
    getPw().then((inputPw) => {
      chrome.runtime.sendMessage({
          method: 'POST',
          action: 'xhttp',
          url: `${API}api-token-auth/`,
          data: `username=${inputId}&password=${inputPw}`,
          drf: 'null'
      }, function(responseText) {
          chrome.storage.sync.set({ 'drfHeader': `Token ${JSON.parse(responseText).token}` });
      });
    });
  });
}

document.getElementById('login').addEventListener('click', getAuth);
