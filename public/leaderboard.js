const playerNameEl = document.getElementById('username'); 
let username;

let totalWins = 0;
let totalLosses = 0;

init();

async function init() {
  await getUsername();
  playerNameEl.textContent = username + '\'s Leaderboard';
  loadScores();
}

async function getUsername() {
  try {
    const response = await fetch('/api/getUsername');
    const returnData = await response.json();

    console.log(returnData);

    username = returnData.username;
    console.log('Got username from server');
  } catch {
    console.log('Got Username from Local');
    username = localStorage.getItem('username') ?? 'Mystery Player';
  }
}

// get records from database instead of local storage
async function loadScores() {
    let userRecords = [];

    const data = {
      username: username,
    };

    try {
      const response = await fetch('/api/getUsersRecords', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify(data),
      });

      const returnData = await response.json();
      userRecords = returnData.userRecords;

      console.log('Got Users Records from Server');

      
    } catch {
      console.log('Got User Records from Local');
      getUsersRecordsLocal();
    }

    console.log(records);
  
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

function getUsersRecordsLocal() {
  let records = [];
  let userRecords = [];

  const recordsText = localStorage.getItem('gameRecords');
  if (recordsText) {
    records = JSON.parse(recordsText);
  }

  if (records.length) {
    for (const [i, record] of records.entries) {
      if (record.username === username) {
        userRecords.push(record);
      }
    }
  }

  return userRecords;
}