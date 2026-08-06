import { useEffect } from 'react';

/**
 * Puts a title into the browser tab while the caller is mounted.
 *
 * Whatever stood there before is restored on the way out, so a tab never keeps
 * the name of a session the user has already left. Passing `undefined` leaves
 * the title alone, which is what a page that has not loaded its subject yet
 * wants — a half-built title is worse than the default one.
 */
export const useDocumentTitle = (title: string | undefined) => {
  useEffect(() => {
    if (!title) {
      return;
    }

    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
