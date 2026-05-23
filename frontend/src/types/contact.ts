export type ContactMessageStatus = 'PENDING_VERIFICATION' | 'UNREAD' | 'READ' | 'REPLIED';

export interface ContactMessageResponse {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export interface ContactMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface AdminReplyRequest {
  reply: string;
}

export interface PagedContactResponse {
  content: ContactMessageResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
