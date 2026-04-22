import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/useToast';
import { internshipsApi } from '@/api/internships';
import { uploadApi } from '@/api/upload';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { FileUpload } from '@/components/ui/FileUpload/FileUpload';
import { InternshipType } from '@/types/enums';
import type { ApiError } from '@/types/models';
import styles from './PostInternshipPage.module.css';

interface FormData {
  title: string;
  company: string;
  location: string;
  type: InternshipType;
  description: string;
  duration: string;
  salary: string;
  deadline: string;
  requirements: string[];
  skills: string[];
}

export default function PostInternshipPage() {
  const { t } = useTranslation('hr');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormData>({
    title: '',
    company: '',
    location: '',
    type: InternshipType.Remote,
    description: '',
    duration: '',
    salary: '',
    deadline: '',
    requirements: [''],
    skills: [],
  });

  const [logoUrl, setLogoUrl] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const locations = [
    { value: '', label: t('post.selectLocation') },
    { value: 'Алматы', label: 'Алматы' },
    { value: 'Астана', label: 'Астана' },
    { value: 'Удалённо', label: 'Удалённо' },
  ];

  const typeOptions = [
    { value: InternshipType.Remote, label: t('post.typeRemote') },
    { value: InternshipType.Office, label: t('post.typeOnsite') },
    { value: InternshipType.Hybrid, label: t('post.typeHybrid') },
  ];

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const updateRequirement = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.requirements];
      updated[index] = value;
      return { ...prev, requirements: updated };
    });
  };

  const addRequirement = () => {
    setForm((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ''],
    }));
  };

  const removeRequirement = (index: number) => {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const skill = skillInput.trim();
      if (skill && !form.skills.includes(skill)) {
        setForm((prev) => ({
          ...prev,
          skills: [...prev.skills, skill],
        }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = t('post.required');
    if (!form.company.trim()) errs.company = t('post.required');
    if (!form.description.trim()) errs.description = t('post.required');
    if (!form.location) errs.location = t('post.required');
    if (!form.duration.trim()) errs.duration = t('post.required');
    if (!form.deadline) errs.deadline = t('post.required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const filteredRequirements = form.requirements.filter((r) => r.trim());
      await internshipsApi.create({
        title: form.title.trim(),
        company: form.company.trim(),
        companyLogo: logoUrl || undefined,
        city: form.location,
        workType: form.type,
        description: form.description.trim(),
        duration: form.duration.trim(),
        salary: form.salary.trim() ? Number(form.salary.trim().replace(/[^\d.]/g, '')) || undefined : undefined,
        deadline: form.deadline,
        requirements: filteredRequirements,
        skills: form.skills,
      });
      showToast(t('post.successMessage'), 'success');
      navigate('/hr/internships');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors) {
        setErrors(apiErr.fieldErrors);
      }
      setServerError(apiErr.message || t('post.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('post.title')}</h1>
        <p className={styles.subtitle}>{t('post.subtitle')}</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {serverError && <div className={styles.serverError}>{serverError}</div>}

        {/* Section 1: Basic Info */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('post.basicInfo')}</h2>
          <div className={styles.sectionFields}>
            <Input
              label={t('post.internshipTitle')}
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              error={errors.title}
              placeholder={t('post.titlePlaceholder')}
            />

            <Input
              label={t('post.company')}
              value={form.company}
              onChange={(e) => updateField('company', e.target.value)}
              error={errors.company}
              placeholder={t('post.company')}
            />

            <FileUpload
              accept="image/*"
              label={t('post.companyLogo')}
              hint={t('post.companyLogoHint')}
              type="image"
              currentUrl={logoUrl}
              onUpload={async (file) => {
                const url = await uploadApi.logo(file);
                setLogoUrl(url);
              }}
            />

            <div className={styles.row}>
              <Input
                as="select"
                label={t('post.location')}
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                error={errors.location}
              >
                {locations.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </Input>

              <div className={styles.radioGroup}>
                <span className={styles.radioGroupLabel}>{t('post.type')}</span>
                <div className={styles.radioOptions}>
                  {typeOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`${styles.radioOption} ${form.type === opt.value ? styles.radioOptionActive : ''}`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={opt.value}
                        checked={form.type === opt.value}
                        onChange={() =>
                          setForm((prev) => ({ ...prev, type: opt.value }))
                        }
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Details */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('post.details')}</h2>
          <div className={styles.sectionFields}>
            <Input
              as="textarea"
              label={t('post.description')}
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              error={errors.description}
              placeholder={t('post.descriptionPlaceholder')}
              rows={5}
            />

            <div className={styles.row}>
              <Input
                label={t('post.duration')}
                value={form.duration}
                onChange={(e) => updateField('duration', e.target.value)}
                error={errors.duration}
                placeholder={t('post.durationPlaceholder')}
              />
              <Input
                label={t('post.salary')}
                value={form.salary}
                onChange={(e) => updateField('salary', e.target.value)}
                placeholder={t('post.salaryPlaceholder')}
                helperText={t('post.salaryHelper')}
              />
            </div>

            <Input
              label={t('post.deadline')}
              type="date"
              value={form.deadline}
              onChange={(e) => updateField('deadline', e.target.value)}
              error={errors.deadline}
            />
          </div>
        </div>

        {/* Section 3: Requirements */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('post.requirements')}</h2>
          <div className={styles.sectionFields}>
            <div className={styles.requirementsList}>
              {form.requirements.map((req, index) => (
                <div key={index} className={styles.requirementItem}>
                  <Input
                    label={`${t('post.requirement')} ${index + 1}`}
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder={t('post.requirementPlaceholder')}
                  />
                  {form.requirements.length > 1 && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => removeRequirement(index)}
                      aria-label={t('post.removeRequirement')}
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.addBtn}
              onClick={addRequirement}
            >
              + {t('post.addRequirement')}
            </button>
          </div>
        </div>

        {/* Section 4: Skills */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('post.skills')}</h2>
          <div className={styles.sectionFields}>
            <div className={styles.skillsInput}>
              <Input
                label={t('post.addSkill')}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={t('post.skillPlaceholder')}
                helperText={t('post.skillHelper')}
              />

              {form.skills.length > 0 && (
                <div className={styles.skillsTags}>
                  {form.skills.map((skill) => (
                    <span key={skill} className={styles.skillTag}>
                      {skill}
                      <button
                        type="button"
                        className={styles.skillTagRemove}
                        onClick={() => removeSkill(skill)}
                        aria-label={`${t('post.removeSkill')} ${skill}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className={styles.formFooter}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/hr/internships')}
          >
            {t('post.cancel')}
          </Button>
          <Button type="submit" loading={loading}>
            {t('post.publish')}
          </Button>
        </div>
      </form>
    </div>
  );
}
