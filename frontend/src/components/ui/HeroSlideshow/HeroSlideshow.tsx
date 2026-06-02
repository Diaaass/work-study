import { useState, useEffect } from 'react';
import styles from './HeroSlideshow.module.css';

const SLIDES = [
  '/images/pexels-andy-barbour-6684406.jpg',
  '/images/pexels-andy-barbour-6684408.jpg',
];

const INTERVAL = 5000;

export function HeroSlideshow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(c => (c + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={styles.root}>
      {SLIDES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          className={`${styles.img} ${i === active ? styles.imgActive : styles.imgHidden}`}
        />
      ))}
      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
      {/* затемнение снизу чтобы точки были видны */}
      <div className={styles.vignette} />
    </div>
  );
}
