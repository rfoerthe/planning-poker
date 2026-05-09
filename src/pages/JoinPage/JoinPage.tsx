
import Grid from '@mui/material/Grid';
import React from 'react';
import { JoinGame } from '../../components/Poker/JoinGame/JoinGame';

export const JoinPage = () => {
  return (
    <>
      <Grid container direction='column' sx={{ justifyContent: 'center', alignItems: 'center' }} spacing={2}>
        <Grid container size={{ xs: 12, sm: 12, lg: 11 }} sx={{ justifyContent: 'center', alignItems: 'center' }} spacing={3}>
          <Grid size={{ xs: 12, sm: 12, lg: 6 }}>
            <JoinGame />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default JoinPage;
