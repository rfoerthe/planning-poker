import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteOldGames } from '../../service/games';

export const DeleteOldGames = () => {
  const { t } = useTranslation();
  const [isDeleteInProgress, setIsDeleteInProgress] = useState(false);

  useEffect(() => {
    async function deleteData() {
      await deleteOldGames();
      setIsDeleteInProgress(false);
    }
    setIsDeleteInProgress(true);
    deleteData();
  }, [setIsDeleteInProgress]);

  return (
    <main className='PageShell'>
      <p>{isDeleteInProgress ? t('deleteOldGames.inProgress') : t('deleteOldGames.done')}</p>
    </main>
  );
};

export default DeleteOldGames;
