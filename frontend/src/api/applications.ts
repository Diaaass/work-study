import { apiClient } from './client';
import type { Application } from '@/types/models';
import type { ApplicationStatus } from '@/types/enums';

export const applicationsApi = {
  create(data: {
    internshipId: string;
    coverLetter: string;
    resumeUrl: string;
  }): Promise<Application> {
    return apiClient<Application>('/applications', {
      method: 'POST',
      body: data,
    });
  },

  getMy(): Promise<Application[]> {
    return apiClient<Application[]>('/applications/my');
  },

  getByInternship(internshipId: string): Promise<Application[]> {
    return apiClient<Application[]>(`/applications/internship/${internshipId}`);
  },

  updateStatus(
    id: string,
    status: ApplicationStatus,
    feedback?: string,
  ): Promise<Application> {
    return apiClient<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: { status, feedback },
    });
  },
};
