const playerNameEl = document.getElementById('username'); 
const username = localStorage.getItem('username');

let totalWins = 0;
let totalLosses = 0;

init();

async function init() {
  playerNameEl.textContent = username + '\'s Leaderboard';
  loadScores();
}

// get records from database instead of local storage
async function loadScores() {
    const data = {
      username: username,
    };

    const response = await fetch('/api/records/get', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(data),
    });

    const returnData = await response.json();
    if (response.ok) {
      const userRecords = returnData.records;
      console.log(userRecords);
      displayRecords(userRecords);
    } else {
      const modalEl = document.querySelector('#msgModal');
      modalEl.querySelector('.modal-body').textContent = `⚠ Error: ${returnData.msg}. Displaying Local Storage`;
      const msgModal = new bootstrap.Modal(modalEl, {});
      msgModal.show();

      getUsersRecordsLocal();
    }
}
  
function displayRecords(userRecords) {
  const tableBodyEl = document.querySelector('#records');

    if (userRecords.length) {
      console.log("IN RECORDS");
      userRecords.forEach(record => {
        //console.log(record);
        const opponentTdEl = document.createElement('td');
        const winsTdEl = document.createElement('td');
        const lossesTdEl = document.createElement('td');

        if(record.user1 === username) {
          console.log("User is user 1");
          opponentTdEl.textContent = record.user2;
          winsTdEl.textContent = record.user1Wins;
          lossesTdEl.textContent = record.user2Wins;

          totalWins += record.user1Wins;
          totalLosses += record.user2Wins;
        } else if (record.user2 === username) {
          console.log("User is user2");
          opponentTdEl.textContent = record.user1;
          winsTdEl.textContent = record.user2Wins;
          lossesTdEl.textContent = record.user1Wins;

          totalWins += record.user2Wins;
          totalLosses += record.user1Wins;
        }

        const rowEl = document.createElement('tr');
        rowEl.appendChild(opponentTdEl);
        rowEl.appendChild(winsTdEl);
        rowEl.appendChild(lossesTdEl);
        
        tableBodyEl.appendChild(rowEl);
      });
    } else {
      tableBodyEl.innerHTML = '<tr><td colSpan=4>Play a game to have a leaderboard!</td></tr>';
    }

    const overallRecordEl = document.getElementById('overall-record');
    overallRecordEl.textContent = `Overall Record: ${totalWins}-${totalLosses}`;
}  

function getUsersRecordsLocal() {
  let records = [];
  let userRecords = [];

  const recordsText = localStorage.getItem('gameRecords');
  if (recordsText) {
    records = JSON.parse(recordsText);
  }

  console.log("Records Local:", records);

  if (records.length) {
    for (const record of records) {
      if (record.username === username) {
        userRecords.push(record);
      }
    }
  }

  console.log("User Records Local:", userRecords);
  displayRecordsLocal(userRecords);

  return userRecords;
}

function displayRecordsLocal(userRecords) {
  const tableBodyEl = document.querySelector('#records');
  
    if (userRecords.length) {
      console.log("IN RECORDS");
      for (const [i, record] of userRecords.entries()) {
        if(record.username === username) {
          const opponentTdEl = document.createElement('td');
          const winsTdEl = document.createElement('td');
          const lossesTdEl = document.createElement('td');
        
          opponentTdEl.textContent = record.opponent;
          winsTdEl.textContent = record.wins;
          lossesTdEl.textContent = record.losses;

          totalWins += record.wins;
          totalLosses += record.losses;
        
          const rowEl = document.createElement('tr');
          rowEl.appendChild(opponentTdEl);
          rowEl.appendChild(winsTdEl);
          rowEl.appendChild(lossesTdEl);
        
          tableBodyEl.appendChild(rowEl);
        }
      }
    } else {
      tableBodyEl.innerHTML = '<tr><td colSpan=4>Play a game to have a leaderboard!</td></tr>';
    }

    const overallRecordEl = document.getElementById('overall-record');
    overallRecordEl.textContent = `Overall Record: ${totalWins}-${totalLosses}`;
}