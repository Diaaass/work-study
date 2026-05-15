import { useState, useEffect, useRef, useMemo, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, GraduationCap, Briefcase, Wrench, Globe, FileText, Smartphone, Pencil, Eye } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/api/users';
import { uploadApi } from '@/api/upload';
import { apiClient } from '@/api/client';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { CvDocument } from '@/components/cv/CvDocument';
import { UserRole } from '@/types/enums';
import type { ApiError, User, WorkExperience, CvLanguage } from '@/types/models';
import styles from './ProfilePage.module.css';

const LANG_LEVELS = ['Native', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'];

function newExp(): WorkExperience {
  return { id: crypto.randomUUID(), company: '', position: '', description: '', startDate: '', endDate: '', current: false };
}
function newLang(): CvLanguage {
  return { id: crypto.randomUUID(), name: '', level: 'B2' };
}
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Completeness calc ────────────────────────────────────────────────────────

interface CompItem { key: string; label: string; done: boolean }

function useCompleteness(fields: {
  name: string; phone: string; bio: string; avatarUrl: string;
  university: string; major: string; skills: string[];
  cvExperience: WorkExperience[]; cvLanguages: CvLanguage[];
  isHR: boolean;
}): { pct: number; items: CompItem[] } {
  return useMemo(() => {
    const items: CompItem[] = [
      { key: 'name',     label: 'Имя',            done: !!fields.name.trim() },
      { key: 'phone',    label: 'Телефон',         done: !!fields.phone.trim() },
      { key: 'bio',      label: 'О себе',          done: fields.bio.trim().length > 20 },
      { key: 'avatar',   label: 'Фото',            done: !!fields.avatarUrl },
      ...(!fields.isHR ? [
        { key: 'univ',   label: 'Университет',     done: !!fields.university.trim() },
        { key: 'major',  label: 'Специальность',   done: !!fields.major.trim() },
        { key: 'skills', label: 'Навыки',          done: fields.skills.length >= 3 },
        { key: 'exp',    label: 'Опыт работы',     done: fields.cvExperience.length > 0 },
        { key: 'lang',   label: 'Языки',           done: fields.cvLanguages.length > 0 },
      ] : []),
    ];
    const done = items.filter(i => i.done).length;
    return { pct: Math.round((done / items.length) * 100), items };
  }, [fields]);
}

export default function ProfilePage() {
  const { t } = useTranslation('student');
  const { user, updateUser } = useAuth();
  const isHR = user?.role === UserRole.HR;
  const { showToast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [generatingCv, setGeneratingCv] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [cvExperience, setCvExperience] = useState<WorkExperience[]>([]);
  const [cvLanguages, setCvLanguages] = useState<CvLanguage[]>([]);

  const [tgCode, setTgCode] = useState<string | null>(null);
  const [tgBotUsername, setTgBotUsername] = useState('');
  const [tgGenerating, setTgGenerating] = useState(false);
  const [tgChecking, setTgChecking] = useState(false);
  const isTgLinked = !!user?.telegramId && /^\d+$/.test(user.telegramId);

  const { pct, items: completenessItems } = useCompleteness({
    name, phone, bio, avatarUrl, university, major, skills, cvExperience, cvLanguages, isHR,
  });

  useEffect(() => {
    if (!user) return;
    setAvatarUrl(user.avatarUrl || '');
    setResumeUrl(user.resumeUrl || '');
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setBio(user.bio || '');
    setCompany(user.company || '');
    setUniversity(user.university || '');
    setMajor(user.major || '');
    setGraduationYear(user.graduationYear ? String(user.graduationYear) : '');
    setSkills(user.skills || []);
    setCvExperience((user.cvExperience as WorkExperience[]) || []);
    setCvLanguages((user.cvLanguages as CvLanguage[]) || []);
  }, [user]);

  // ── Skills ────────────────────────────────────────────────────────────────
  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = skillInput.trim();
      if (v && !skills.includes(v)) setSkills(p => [...p, v]);
      setSkillInput('');
    }
  };

  // ── Experience ────────────────────────────────────────────────────────────
  const addExp = () => setCvExperience(p => [...p, newExp()]);
  const updateExp = (id: string, field: keyof WorkExperience, value: string | boolean) =>
    setCvExperience(p => p.map(e => e.id === id ? { ...e, [field]: value } : e));
  const removeExp = (id: string) => setCvExperience(p => p.filter(e => e.id !== id));

  // ── Languages ─────────────────────────────────────────────────────────────
  const addLang = () => setCvLanguages(p => [...p, newLang()]);
  const updateLang = (id: string, field: keyof CvLanguage, value: string) =>
    setCvLanguages(p => p.map(l => l.id === id ? { ...l, [field]: value } : l));
  const removeLang = (id: string) => setCvLanguages(p => p.filter(l => l.id !== id));

  // ── Helpers for profile update payload ────────────────────────────────────
  const profilePayload = () => ({
    name: name.trim(),
    phone: phone.trim() || undefined,
    bio: bio.trim() || undefined,
    company: company.trim() || undefined,
    university: university.trim() || undefined,
    major: major.trim() || undefined,
    graduationYear: graduationYear ? Number(graduationYear) : undefined,
    skills,
    cvExperience,
    cvLanguages,
  });

  // ── Save Profile ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile(profilePayload());
      updateUser(updated);
      showToast(t('profile.saved'), 'success');
    } catch (err) {
      showToast((err as ApiError).message || t('profile.saveError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar ────────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadApi.avatar(file);
      setAvatarUrl(url);
      updateUser({ ...user!, avatarUrl: url });
      showToast(t('profile.avatarUpdated'), 'success');
    } catch (err) {
      showToast((err as ApiError).message || t('upload.error'), 'error');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ── CV Generation ─────────────────────────────────────────────────────────
  const handleGenerateCv = async () => {
    const missing: string[] = [];
    if (!name.trim())        missing.push(t('profile.name'));
    if (!email.trim())       missing.push(t('profile.email'));
    if (!bio.trim())         missing.push(t('profile.bio'));
    if (!skills.length)      missing.push(t('profile.skills'));
    if (missing.length > 0) {
      showToast(t('profile.cvValidation', { fields: missing.join(', ') }), 'error');
      return;
    }
    setGeneratingCv(true);
    try {
      const updated = await usersApi.updateProfile(profilePayload());
      updateUser(updated);

      const cvData = {
        name: name.trim(), email: email.trim(),
        phone: phone.trim() || undefined,
        summary: bio.trim() || undefined,
        skills,
        experience: cvExperience.filter(e => e.company && e.position),
        education: {
          university: university.trim() || undefined,
          major: major.trim() || undefined,
          graduationYear: graduationYear ? Number(graduationYear) : undefined,
        },
        languages: cvLanguages.filter(l => l.name),
      };

      const blob = await pdf(<CvDocument data={cvData} />).toBlob();
      const fileName = `cv-${name.trim().toLowerCase().replace(/\s+/g, '-')}.pdf`;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl; a.download = fileName; a.click();
      URL.revokeObjectURL(objectUrl);

      const file = new File([blob], 'cv.pdf', { type: 'application/pdf' });
      const cloudUrl = await uploadApi.resume(file);
      setResumeUrl(cloudUrl);
      updateUser({ ...user!, resumeUrl: cloudUrl });
      showToast(t('profile.cvSaved'), 'success');
    } catch (err) {
      console.error('[CV]', err);
      showToast((err as ApiError).message || t('profile.cvError'), 'error');
    } finally {
      setGeneratingCv(false);
    }
  };

  // ── Telegram ──────────────────────────────────────────────────────────────
  const handleGenerateTgCode = async () => {
    setTgGenerating(true);
    try {
      const { code, botUsername } = await usersApi.generateTelegramCode();
      setTgCode(code); setTgBotUsername(botUsername);
    } catch (err) {
      showToast((err as ApiError).message || t('profile.tgError'), 'error');
    } finally { setTgGenerating(false); }
  };

  const handleCheckTgConnection = async () => {
    setTgChecking(true);
    try {
      const u = await apiClient<User>('/auth/me');
      updateUser(u);
      if (u.telegramId && /^\d+$/.test(u.telegramId)) {
        setTgCode(null);
        showToast(t('profile.tgConnected'), 'success');
      } else {
        showToast(t('profile.tgNotYet'), 'error');
      }
    } catch { showToast(t('profile.tgError'), 'error'); }
    finally { setTgChecking(false); }
  };

  const handleDisconnectTg = async () => {
    try {
      await usersApi.disconnectTelegram();
      updateUser({ ...user!, telegramId: undefined });
      setTgCode(null);
      showToast(t('profile.tgDisconnected'), 'success');
    } catch (err) {
      showToast((err as ApiError).message || t('profile.tgError'), 'error');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{t('profile.title')}</h1>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className={styles.heroCard}>
        <div className={styles.heroBanner} />
        <div className={styles.heroBody}>
          <div className={styles.heroAvatarRow}>
            {/* Avatar */}
            <div className={styles.avatarWrap}>
              {avatarUrl
                ? <img src={avatarUrl} alt={name} className={styles.avatarImg} />
                : <div className={styles.avatarPlaceholder}>{getInitials(name || user?.name || '')}</div>
              }
              <button
                type="button"
                className={styles.avatarUploadBtn}
                title={t('profile.avatar')}
                disabled={avatarUploading}
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarUploading ? '…' : <Pencil size={14} />}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className={styles.avatarHiddenInput}
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name + role */}
            <div className={styles.heroInfo}>
              <p className={styles.heroName}>{name || user?.name || '—'}</p>
              <div className={styles.heroMeta}>
                <span className={styles.heroEmail}>{email}</span>
                {isHR
                  ? <span className={styles.heroBadge}>HR</span>
                  : <span className={styles.heroBadge}>Student</span>
                }
                {isTgLinked && <span className={styles.heroBadge} style={{ background: 'var(--color-success-light)', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>Telegram</span>}
              </div>
            </div>
          </div>

          <p className={styles.avatarHint}>{t('profile.avatarHint')}</p>

          {/* Profile Completeness */}
          <div className={styles.completeness}>
            <div className={styles.completenessRow}>
              <span className={styles.completenessLabel}>Заполненность профиля</span>
              <span className={styles.completenessPercent}>{pct}%</span>
            </div>
            <div className={styles.completenessTrack}>
              <div className={styles.completenessFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={styles.completenessItems}>
              {completenessItems.map(item => (
                <span key={item.key} className={`${styles.completenessChip} ${item.done ? styles.chipDone : styles.chipMissing}`}>
                  {item.done ? '✓' : '○'} {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Personal info ─────────────────────────────────────────── */}
        <Card className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}><UserIcon size={18} /></span>
            {t('profile.personalInfo')}
          </h2>
          <div className={styles.fieldGrid}>
            <Input label={t('profile.name')} value={name} onChange={e => setName(e.target.value)} required />
            <Input label={t('profile.email')} type="email" value={email} disabled />
            <Input label={t('profile.phone')} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (777) 123-4567" />
            {isHR && (
              <Input label={t('profile.company')} value={company} onChange={e => setCompany(e.target.value)} />
            )}
          </div>
          <div className={styles.bioField}>
            <Input
              as="textarea"
              label={t('profile.bio')}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder={t('profile.bioPlaceholder')}
              rows={4}
            />
          </div>
        </Card>

        {/* ── Academic ──────────────────────────────────────────────── */}
        {!isHR && (
          <Card className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><GraduationCap size={18} /></span>
              {t('profile.academicInfo')}
            </h2>
            <div className={styles.fieldGrid}>
              <Input label={t('profile.university')} value={university} onChange={e => setUniversity(e.target.value)} />
              <Input label={t('profile.major')} value={major} onChange={e => setMajor(e.target.value)} />
              <Input label={t('profile.graduationYear')} type="number" value={graduationYear} onChange={e => setGraduationYear(e.target.value)} min={2020} max={2035} />
            </div>
          </Card>
        )}

        {/* ── Work Experience ───────────────────────────────────────── */}
        <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Briefcase size={18} /></span>
              {t('profile.expSection')}
            </h2>
            <button type="button" className={styles.addBtn} onClick={addExp}>
              + {t('profile.expAdd')}
            </button>
          </div>

          {cvExperience.length === 0
            ? <p className={styles.emptyHint}>{t('profile.expEmpty')}</p>
            : (
              <div className={styles.expList}>
                {cvExperience.map((exp, idx) => (
                  <div key={exp.id} className={styles.expCard}>
                    <div className={styles.expCardHeader}>
                      <span className={styles.expCardNum}>#{idx + 1}</span>
                      <button type="button" className={styles.removeBtn} onClick={() => removeExp(exp.id)}>
                        {t('profile.expRemove')}
                      </button>
                    </div>
                    <div className={styles.fieldGrid}>
                      <Input label={t('profile.expCompany')} value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} />
                      <Input label={t('profile.expPosition')} value={exp.position} onChange={e => updateExp(exp.id, 'position', e.target.value)} />
                      <Input label={t('profile.expStart')} type="month" value={exp.startDate} onChange={e => updateExp(exp.id, 'startDate', e.target.value)} />
                      <div className={styles.endDateGroup}>
                        <Input label={t('profile.expEnd')} type="month" value={exp.endDate} onChange={e => updateExp(exp.id, 'endDate', e.target.value)} disabled={exp.current} />
                        <label className={styles.currentCheck}>
                          <input type="checkbox" checked={exp.current} onChange={e => updateExp(exp.id, 'current', e.target.checked)} />
                          <span>{t('profile.expCurrent')}</span>
                        </label>
                      </div>
                    </div>
                    <div className={styles.bioField}>
                      <Input as="textarea" label={t('profile.expDescription')} value={exp.description} onChange={e => updateExp(exp.id, 'description', e.target.value)} placeholder={t('profile.expDescPlaceholder')} rows={3} />
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </Card>

        {/* ── Skills ───────────────────────────────────────────────── */}
        {!isHR && <Card className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}><Wrench size={18} /></span>
            {t('profile.skills')}
          </h2>
          <div className={styles.skillsContainer}>
            {skills.length > 0 && (
              <div className={styles.skillsList}>
                {skills.map(skill => (
                  <span key={skill} className={styles.skillPill}>
                    {skill}
                    <button type="button" className={styles.skillRemove} onClick={() => setSkills(p => p.filter(s => s !== skill))}>&times;</button>
                  </span>
                ))}
              </div>
            )}
            <input
              className={styles.skillInput}
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder={t('profile.addSkill')}
            />
          </div>
        </Card>}

        {/* ── Languages ────────────────────────────────────────────── */}
        {!isHR && <Card className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><Globe size={18} /></span>
              {t('profile.langSection')}
            </h2>
            <button type="button" className={styles.addBtn} onClick={addLang}>
              + {t('profile.langAdd')}
            </button>
          </div>

          {cvLanguages.length === 0
            ? <p className={styles.emptyHint}>{t('profile.langEmpty')}</p>
            : (
              <div className={styles.langList}>
                {cvLanguages.map(lang => (
                  <div key={lang.id} className={styles.langRow}>
                    <div className={styles.langInputs}>
                      <Input label={t('profile.langName')} value={lang.name} onChange={e => updateLang(lang.id, 'name', e.target.value)} placeholder="English" />
                      <div className={styles.langLevelWrap}>
                        <label className={styles.inputLabel}>{t('profile.langLevel')}</label>
                        <select className={styles.langSelect} value={lang.level} onChange={e => updateLang(lang.id, 'level', e.target.value)}>
                          {LANG_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="button" className={styles.removeBtn} onClick={() => removeLang(lang.id)}>
                      {t('profile.langRemove')}
                    </button>
                  </div>
                ))}
              </div>
            )
          }
        </Card>}

        <div className={styles.actions}>
          <Button type="submit" loading={saving}>{t('profile.save')}</Button>
        </div>
      </form>

      {/* ── CV Builder ──────────────────────────────────────────────── */}
      {!isHR && (
        <Card className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}><FileText size={18} /></span>
            {t('profile.cvSection')}
          </h2>
          <p className={styles.cvNote}>{t('profile.cvNote')}</p>
          <div className={styles.cvActions}>
            <Button onClick={handleGenerateCv} loading={generatingCv}>
              {resumeUrl ? t('profile.cvRegenerate') : t('profile.cvGenerate')}
            </Button>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className={styles.cvPreviewLink}>
                <Eye size={14} /> {t('profile.cvPreview')}
              </a>
            )}
          </div>
        </Card>
      )}

      {/* ── Telegram ────────────────────────────────────────────────── */}
      <Card className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}><Smartphone size={18} /></span>
          {t('profile.tgTitle')}
        </h2>
        {isTgLinked ? (
          <div className={styles.tgConnected}>
            <div className={styles.tgStatus}><span className={styles.tgDot} />{t('profile.tgLinked')}</div>
            <p className={styles.tgDesc}>{t('profile.tgLinkedDesc')}</p>
            <Button variant="secondary" onClick={handleDisconnectTg}>{t('profile.tgDisconnectBtn')}</Button>
          </div>
        ) : (
          <div className={styles.tgNotConnected}>
            <p className={styles.tgDesc}>{t('profile.tgDesc')}</p>
            {!tgCode ? (
              <Button onClick={handleGenerateTgCode} loading={tgGenerating}>{t('profile.tgConnectBtn')}</Button>
            ) : (
              <div className={styles.tgCodeBlock}>
                <p className={styles.tgInstruction}>{t('profile.tgInstruction')}</p>
                <div className={styles.tgCommand}>/start {tgCode}</div>
                <a href={`https://t.me/${tgBotUsername}?start=${tgCode}`} target="_blank" rel="noopener noreferrer" className={styles.tgBotLink}>
                  {t('profile.tgOpenBot')} @{tgBotUsername}
                </a>
                <div className={styles.tgActions}>
                  <Button onClick={handleCheckTgConnection} loading={tgChecking}>{t('profile.tgCheckBtn')}</Button>
                  <Button variant="secondary" onClick={() => setTgCode(null)}>{t('profile.tgCancel')}</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
