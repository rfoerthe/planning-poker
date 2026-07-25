import React from 'react';
import { JoinGame } from '../../components/Poker/JoinGame/JoinGame';
import './JoinPage.css';

export const JoinPage = () => {
  return (
    <main className='PageShell JoinPage'>
      <JoinGame />
    </main>
  );
};

export default JoinPage;
