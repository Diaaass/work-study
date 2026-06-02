import { useState, useEffect, useCallback } from 'react';
import { bookmarksApi } from '@/api/bookmarks';
import { useAuth } from './useAuth';

export function useBookmarks() {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user?.role !== 'student') return;
    bookmarksApi.getIds()
      .then(list => setIds(new Set(list)))
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(async (internshipId: number) => {
    try {
      const { bookmarked } = await bookmarksApi.toggle(internshipId);
      setIds(prev => {
        const next = new Set(prev);
        bookmarked ? next.add(internshipId) : next.delete(internshipId);
        return next;
      });
      return bookmarked;
    } catch {
      return null;
    }
  }, []);

  const isBookmarked = useCallback((id: number) => ids.has(id), [ids]);

  return { isBookmarked, toggle };
}
