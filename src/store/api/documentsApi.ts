// ============================================================================
// DOCUMENTS API - RTK Query endpoints for documents
// Cookie-based auth via baseApi (credentials: 'include')
// ============================================================================

import { baseApi } from './baseApi';

export interface DocumentFileInfo {
  originalName: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  mimeType: string;
  size: number;
}

export interface DocumentUserRef {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImageUrl?: string;
  recentBooking?: {
    eventDetails?: {
      name?: string;
    };
  };
}

export interface DocumentItem {
  _id: string;
  documentName: string;
  documentType: 'MOU' | 'Contract' | 'Invoice' | 'Agreement';
  file: DocumentFileInfo;
  organizer: DocumentUserRef | null;
  speaker: DocumentUserRef | null;
  sender: string | DocumentUserRef | null;
  receiver: string | DocumentUserRef | null;
  direction: 'draft' | 'organizer_to_speaker' | 'speaker_to_organizer';
  status: 'uploaded' | 'assigned' | 'sent' | 'pending_review' | 'approved' | 'signed' | 'declined' | 'cancelled';
  assignedAt?: string | null;
  sentAt?: string | null;
  receivedAt?: string | null;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  declinedAt?: string | null;
  relatedBooking?: string | null;
  tags?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  documentId?: string;
  statusDisplay?: string;
  fileSizeFormatted?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary?: unknown;
}

export const documentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Unified list for current user: returns { incoming: [], outgoing: [] }
    getMyDocuments: builder.query<
      PaginatedResponse<{ incoming: DocumentItem[]; outgoing: DocumentItem[] }>,
      { page?: number; limit?: number; status?: string; direction?: string } | void
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.page) params.set('page', String(args.page));
        if (args?.limit) params.set('limit', String(args.limit));
        if (args?.status) params.set('status', args.status);
        if (args?.direction) params.set('direction', args.direction);
        const qs = params.toString();
        return { url: `/documents/all${qs ? `?${qs}` : ''}`, method: 'GET' };
      },
      providesTags: ['Document'],
    }),

    // Organizer-specific list
    getOrganizerDocuments: builder.query<
      PaginatedResponse<DocumentItem[]>,
      { page?: number; limit?: number; status?: string; direction?: string } | void
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.page) params.set('page', String(args.page));
        if (args?.limit) params.set('limit', String(args.limit));
        if (args?.status) params.set('status', args.status);
        if (args?.direction) params.set('direction', args.direction);
        const qs = params.toString();
        return { url: `/documents/organizer${qs ? `?${qs}` : ''}`, method: 'GET' };
      },
      providesTags: ['Document'],
    }),

    // Speaker-specific list
    getSpeakerDocuments: builder.query<
      PaginatedResponse<DocumentItem[]>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.page) params.set('page', String(args.page));
        if (args?.limit) params.set('limit', String(args.limit));
        if (args?.status) params.set('status', args.status);
        const qs = params.toString();
        return { url: `/documents/speaker${qs ? `?${qs}` : ''}`, method: 'GET' };
      },
      providesTags: ['Document'],
    }),

    // Stats
    getOrganizerStats: builder.query<PaginatedResponse<any>, void>({
      query: () => ({ url: '/documents/organizer/stats', method: 'GET' }),
      providesTags: ['Document'],
    }),
    getSpeakerStats: builder.query<PaginatedResponse<any>, void>({
      query: () => ({ url: '/documents/speaker/stats', method: 'GET' }),
      providesTags: ['Document'],
    }),

    // Eligible organizers for speaker to assign
    getEligibleOrganizers: builder.query<
      { success: boolean; message: string; data: DocumentUserRef[]; total: number },
      void
    >({
      query: () => ({ url: '/documents/speaker/eligible-organizers', method: 'GET' }),
    }),

    // Upload document (multipart form-data)
    uploadDocument: builder.mutation<
      { success: boolean; message: string; data: DocumentItem },
      { documentName: string; documentType: DocumentItem['documentType']; tags?: string[] | string; notes?: string; file: File }
    >({
      query: ({ documentName, documentType, tags, notes, file }) => {
        const form = new FormData();
        form.append('documentName', documentName);
        form.append('documentType', documentType);
        if (Array.isArray(tags)) {
          form.append('tags', tags.join(','));
        } else if (typeof tags === 'string') {
          form.append('tags', tags);
        }
        if (notes) form.append('notes', notes);
        form.append('file', file);
        return { url: '/documents/upload', method: 'POST', body: form };
      },
      invalidatesTags: ['Document'],
    }),

    // Assignments
    assignToOrganizer: builder.mutation<
      { success: boolean; message: string; data: DocumentItem },
      { documentId: string; organizerId: string; relatedBookingId?: string }
    >({
      query: ({ documentId, organizerId, relatedBookingId }) => ({
        url: `/documents/${documentId}/assign-organizer`,
        method: 'POST',
        body: { organizerId, relatedBookingId },
      }),
      invalidatesTags: ['Document'],
    }),
    assignToSpeaker: builder.mutation<
      { success: boolean; message: string; data: DocumentItem },
      { documentId: string; speakerId: string; relatedBookingId?: string }
    >({
      query: ({ documentId, speakerId, relatedBookingId }) => ({
        url: `/documents/${documentId}/assign`,
        method: 'POST',
        body: { speakerId, relatedBookingId },
      }),
      invalidatesTags: ['Document'],
    }),

    // Send actions
    sendToOrganizer: builder.mutation<
      { success: boolean; message: string; data: DocumentItem },
      { documentId: string }
    >({
      query: ({ documentId }) => ({ url: `/documents/${documentId}/send-to-organizer`, method: 'POST' }),
      invalidatesTags: ['Document'],
    }),
    sendToSpeaker: builder.mutation<
      { success: boolean; message: string; data: DocumentItem },
      { documentId: string }
    >({
      query: ({ documentId }) => ({ url: `/documents/${documentId}/send`, method: 'POST' }),
      invalidatesTags: ['Document'],
    }),

    // Status update
    updateStatus: builder.mutation<
      { success: boolean; message: string; data: DocumentItem },
      { documentId: string; status: DocumentItem['status'] }
    >({
      query: ({ documentId, status }) => ({
        url: `/documents/${documentId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Document'],
    }),

    // Delete
    deleteDocument: builder.mutation<
      { success: boolean; message: string },
      { documentId: string }
    >({
      query: ({ documentId }) => ({ url: `/documents/${documentId}`, method: 'DELETE' }),
      invalidatesTags: ['Document'],
    }),

    // Get single document by ID
    getDocumentById: builder.query<
      { success: boolean; message: string; data: DocumentItem },
      string
    >({
      query: (documentId) => ({ url: `/documents/${documentId}`, method: 'GET' }),
      providesTags: ['Document'],
    }),

    // Get download URL for a document
    downloadDocument: builder.query<
      { success: boolean; message: string; data: { document: DocumentItem; downloadUrl: string } },
      string
    >({
      query: (documentId) => ({ url: `/documents/${documentId}/download`, method: 'GET' }),
      providesTags: ['Document'],
    }),
  }),
});

export const {
  useGetMyDocumentsQuery,
  useGetOrganizerDocumentsQuery,
  useGetSpeakerDocumentsQuery,
  useGetOrganizerStatsQuery,
  useGetSpeakerStatsQuery,
  useGetEligibleOrganizersQuery,
  useUploadDocumentMutation,
  useAssignToOrganizerMutation,
  useAssignToSpeakerMutation,
  useSendToOrganizerMutation,
  useSendToSpeakerMutation,
  useUpdateStatusMutation,
  useDeleteDocumentMutation,
  useGetDocumentByIdQuery,
  useLazyGetDocumentByIdQuery,
  useDownloadDocumentQuery,
  useLazyDownloadDocumentQuery,
} = documentsApi;


