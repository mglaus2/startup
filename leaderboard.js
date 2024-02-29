const playerNameEl = document.getElementById('username'); 
const username = localStorage.getItem('username') ?? 'Mystery Player';
playerNameEl.textContent = username + '\'s Leaderboard';

let totalWins = 0;
let totalLosses = 0;

function loadScores() {
    let hasRecord = false;
    let records = [];
    const recordsText = localStorage.getItem('gameRecords');
    if (recordsText) {
      records = JSON.parse(recordsText);
    }
  
    const tableBodyEl = document.querySelector('#records');
  
    if (records.length) {
        console.log("IN RECORDS");
        for (const [i, record] of records.entries()) {
            if(record.username === username) {
                hasRecord = true;
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

    if(!hasRecord) {
        tableBodyEl.innerHTML = '<tr><td colSpan=4>Play a game to have a leaderboard!</td></tr>';
    }

    const overallRecordEl = document.getElementById('overall-record');
    overallRecordEl.textContent = `Overall Record: ${totalWins}-${totalLosses}`;
  }
  
  loadScores();