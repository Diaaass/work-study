import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ToastContainer } from '@/components/ui/Toast/Toast';
import styles from './AppLayout.module.css';

const SIDEBAR_OPEN_KEY = 'ws_sidebar_open';

const getInitialOpen = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = window.localStorage.getItem(SIDEBAR_OPEN_KEY);
  if (stored !== null) return stored === '1';
  return window.matchMedia('(min-width: 1024px)').matches;
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(getInitialOpen);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_OPEN_KEY, sidebarOpen ? '1' : '0');
  }, [sidebarOpen]);

  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;
    let rafId = 0;
    let x = 0, y = 0;
    const tick = () => {
      el.style.setProperty('--mx', x + 'px');
      el.style.setProperty('--my', y + 'px');
      rafId = 0;
    };
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={spotlightRef} className={styles.spotlight} aria-hidden="true" />
      <div className={styles.blob1} aria-hidden="true" />
      <div className={styles.blob2} aria-hidden="true" />
      <div className={styles.blob3} aria-hidden="true" />
      <Header onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className={styles.layout}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className={styles.contentColumn}>
          <main className={styles.main}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
