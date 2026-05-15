const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

async function uploadFile(endpoint: string, file: File): Promise<string> {
  const token = localStorage.getItem('ws_token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw { status: response.status, message: err.message || 'Ошибка загрузки' };
  }

  const data = await response.json();
  return data.url as string;
}

export const uploadApi = {
  avatar: (file: File) => uploadFile('/upload/avatar', file),
  resume: (file: File) => uploadFile('/upload/resume', file),
  logo:   (file: File) => uploadFile('/upload/logo', file),
};
