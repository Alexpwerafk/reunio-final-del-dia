export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  reminder_hour: number;
  streak: number;
  created_at: string;
}

export interface DailyReview {
  id: string;
  user_id: string;
  date: string;
  accomplishments: string;
  pending: string;
  learnings: string;
  blockers: string;
  tomorrow_priority: string;
  newsletter_sent: boolean;
  created_at: string;
}

export interface ReviewFormData {
  accomplishments: string;
  pending: string;
  learnings: string;
  blockers: string;
  tomorrow_priority: string;
}
