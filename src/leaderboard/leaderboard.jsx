import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './leaderboard.css';

export function Leaderboard({ username }) {
  const [records, setUserRecords] = React.useState([]);
  const [totalWins, setTotalWins] = React.useState(0);
  const [totalLosses, setTotalLosses] = React.useState(0);

  console.log(username);

  React.useEffect(() => {
    async function fetchData() {
      const data = {
        username: username,
      };

      try {
        const response = await fetch('/api/records/get', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        });

        const returnData = await response.json();

        if (response.ok) {
          setUserRecords(returnData.records);
          localStorage.setItem('gameRecords', JSON.stringify(returnData.records));
        } else {
          console.error(`Error: ${returnData.msg}`);
          const recordsText = localStorage.getItem('gameRecords');
          if (recordsText) {
            setUserRecords(JSON.parse(recordsText));
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        const recordsText = localStorage.getItem('gameRecords');
        if (recordsText) {
          setUserRecords(JSON.parse(recordsText));
        }
      }
    }

    fetchData();
  }, []);

  React.useEffect(() => {
    let wins = 0;
    let losses = 0;

    records.forEach(record => {
      if (record.user1 === username) {
        wins += record.user1Wins;
        losses += record.user2Wins;
      } else if (record.user2 === username) {
        wins += record.user2Wins;
        losses += record.user1Wins;
      }
    });

    setTotalWins(wins);
    setTotalLosses(losses);
  }, [records, username]);

  return (
    <main className="container-fluid">
      <h1 className="username">{username}'s Leaderboard</h1>
      <h3 className='overall-record'>Overall Record: {totalWins}-{totalLosses}</h3>
      <table className="table">
        <thead>
          <tr className='custom-row'>
            <th className='custom-header'>Opponent</th>
            <th className='custom-header'>Wins</th>
            <th className='custom-header'>Losses</th>
          </tr>
        </thead>
        <tbody id="records">
          {records.length ? (
            records.map((record, index) => (
              <tr className="record-row" key={index}>
                <td>{record.user1 === username ? record.user2 : record.user1}</td>
                <td>{record.user1 === username ? record.user1Wins : record.user2Wins}</td>
                <td>{record.user1 === username ? record.user2Wins : record.user1Wins}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">Play a game to have a leaderboard!</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );  
}