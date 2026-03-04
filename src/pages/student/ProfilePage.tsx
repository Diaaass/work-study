import { useState, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/api/users';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import type { ApiError } from '@/types/models';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { t } = useTranslation('student');
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // Personal info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [bio, setBio] = useState('');

  // Academic info
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');

  // Skills
  const [skills, setSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setTelegram(user.telegramId || '');
    setBio(user.bio || '');
    setUniversity(user.university || '');
    setMajor(user.major || '');
    setGraduationYear(user.graduationYear ? String(user.graduationYear) : '');
    setSkills(user.skills || []);
  }, [user]);

  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills((prev) => [...prev, trimmed]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      telegramId: telegram.trim() || undefined,
      bio: bio.trim() || undefined,
      university: university.trim() || undefined,
      major: major.trim() || undefined,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      skills,
    };

    try {
      const updated = await usersApi.updateProfile(data);
      updateUser(updated);
      showToast(t('profile.saved'), 'success');
    } catch (err) {
      const apiErr = err as ApiError;
      showToast(apiErr.message || t('profile.saveError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{t('profile.title')}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <Card className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>{t('profile.personalInfo')}</h2>
          <div className={styles.fieldGrid}>
            <Input
              label={t('profile.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label={t('profile.email')}
              type="email"
              value={email}
              disabled
            />
            <Input
              label={t('profile.phone')}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (777) 123-4567"
            />
            <Input
              label={t('profile.telegram')}
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className={styles.bioField}>
            <Input
              as="textarea"
              label={t('profile.bio')}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('profile.bioPlaceholder')}
              rows={4}
            />
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>{t('profile.academicInfo')}</h2>
          <div className={styles.fieldGrid}>
            <Input
              label={t('profile.university')}
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
            <Input
              label={t('profile.major')}
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
            <Input
              label={t('profile.graduationYear')}
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              min={2020}
              max={2035}
            />
          </div>
        </Card>

        <Card className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>{t('profile.skills')}</h2>
          <div className={styles.skillsContainer}>
            <div className={styles.skillsList}>
              {skills.map((skill) => (
                <span key={skill} className={styles.skillPill}>
                  {skill}
                  <button
                    type="button"
                    className={styles.skillRemove}
                    onClick={() => handleRemoveSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <input
              className={styles.skillInput}
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              placeholder={t('profile.addSkill')}
            />
          </div>
        </Card>

        <div className={styles.actions}>
          <Button type="submit" loading={saving}>
            {t('profile.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
