import { useTranslation } from 'react-i18next';
import { Zap, Target, Brain, Shield, Rocket, Mail, MapPin, GraduationCap } from 'lucide-react';
import styles from './AboutPage.module.css';

export default function AboutPage() {
  const { t } = useTranslation();

  const STATS = [
    { value: t('about.stat1Value'), label: t('about.stat1Label') },
    { value: t('about.stat2Value'), label: t('about.stat2Label') },
    { value: t('about.stat3Value'), label: t('about.stat3Label') },
    { value: t('about.stat4Value'), label: t('about.stat4Label') },
  ];

  const FEATURES = [
    { icon: <Brain size={22} />,  title: t('about.feature1Title'), desc: t('about.feature1Desc') },
    { icon: <Zap size={22} />,    title: t('about.feature2Title'), desc: t('about.feature2Desc') },
    { icon: <Shield size={22} />, title: t('about.feature3Title'), desc: t('about.feature3Desc') },
  ];

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroDecor} aria-hidden>
          <div className={styles.orb1} />
          <div className={styles.orb2} />
        </div>
        <div className={styles.heroBadge}>
          <Zap size={12} />
          <span>{t('about.badge')}</span>
        </div>
        <h1 className={styles.heroTitle}>
          {t('about.heroTitle').split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}
        </h1>
        <p className={styles.heroSub}>{t('about.heroSub')}</p>
        <div className={styles.stats}>
          {STATS.map(s => (
            <div key={s.label} className={styles.statItem}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className={styles.section}>
        <div className={styles.missionCard}>
          <div className={styles.missionIcon}><Target size={28} /></div>
          <div>
            <h2 className={styles.missionTitle}>{t('about.missionTitle')}</h2>
            <p className={styles.missionText}>{t('about.missionText')}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('about.featuresTitle')}</h2>
        <div className={styles.featuresGrid}>
          {FEATURES.map(f => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About project */}
      <section className={styles.section}>
        <div className={styles.projectCard}>
          <GraduationCap size={24} className={styles.projectIcon} />
          <div>
            <h2 className={styles.projectTitle}>{t('about.projectTitle')}</h2>
            <p className={styles.projectText}>{t('about.projectText1')}</p>
            <p className={styles.projectText}>{t('about.projectText2')}</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className={styles.section}>
        <div className={styles.contactRow}>
          <div className={styles.contactItem}>
            <Mail size={16} />
            <a href="mailto:hello@workstudy.kz" className={styles.contactLink}>hello@workstudy.kz</a>
          </div>
          <div className={styles.contactItem}>
            <MapPin size={16} />
            <span>{t('about.location')}</span>
          </div>
          <div className={styles.contactItem}>
            <Rocket size={16} />
            <span>{t('about.version')}</span>
          </div>
        </div>
      </section>

    </div>
  );
}
