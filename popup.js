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
          if (/non_field/.test(responseText)) {
            alert('Fuck, try again. Wrong info\nPress enter');
          } else {
            chrome.storage.sync.set({ 'drfHeader': `Token ${JSON.parse(responseText).token}` });
            alert('Logged in. Key enter.');
          }
      });
    });
  });
}

document.getElementById('login').addEventListener('click', getAuth);
