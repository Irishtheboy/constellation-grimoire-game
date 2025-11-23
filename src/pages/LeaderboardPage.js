import React from 'react';
import Header from '../components/Header';

const LeaderboardPage = ({ user }) => {
  return (
    <>
      <Header user={user} />
      <div className="leaderboard-page">
        <h1>Leaderboard</h1>
        <p>Top constellation masters will appear here!</p>
      </div>
    </>
  );
};

export default LeaderboardPage;