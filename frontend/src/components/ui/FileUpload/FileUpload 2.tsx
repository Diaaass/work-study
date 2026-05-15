import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  accept: string;           // 'image/*' | 'application/pdf'
  label: string;
  hint?: string;
  currentUrl?: string;      // текущий файл (превью)
  type?: 'image' | 'pdf';
  loading?: boolean;
  onUpload: (file: File) => Promise<void>;
}

export function FileUpload({ accept, label, hint, currentUrl, type = 'image', loading, onUpload }: FileUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || t('upload.error');
      setError(msg);
    } finally {
      setUploading(false);
      // сбрасываем input чтобы можно было загрузить тот же файл повторно
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const isLoading = uploading || loading;

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{label}</span>

      <div className={styles.row}>
        {/* Превью */}
        {type === 'image' && (
          <div className={styles.preview}>
            {currentUrl
              ? <img src={currentUrl} alt="preview" className={styles.previewImg} />
              : <div className={styles.previewPlaceholder}>—</div>
            }
          </div>
        )}

        {type === 'pdf' && currentUrl && (
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.pdfLink}
          >
            {t('upload.openPdf')}
          </a>
        )}

        {/* Кнопка */}
        <button
          type="button"
          className={styles.btn}
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
        >
          {isLoading ? t('upload.uploading') : currentUrl ? t('upload.replace') : t('upload.upload')}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className={styles.hiddenInput}
          onChange={handleChange}
        />
      </div>

      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
