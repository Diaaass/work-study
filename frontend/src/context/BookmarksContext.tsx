import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { bookmarksApi } from '@/api/bookmarks';
import { useAuth } from '@/hooks/useAuth';

interface BookmarksContextValue {
  isBookmarked: (id: number) => boolean;
  toggle: (id: number) => Promise<void>;
}

const BookmarksContext = createContext<BookmarksContextValue>({
  isBookmarked: () => false,
  toggle: async () => {},
});

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user?.role !== 'student') { setIds(new Set()); return; }
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
    } catch {}
  }, []);

  const isBookmarked = useCallback((id: number) => ids.has(id), [ids]);

  return (
    <BookmarksContext.Provider value={{ isBookmarked, toggle }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export const useBookmarksContext = () => useContext(BookmarksContext);
