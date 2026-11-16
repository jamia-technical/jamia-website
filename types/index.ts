import React from "react";

export interface StateData {
  state: string;
  districts: string[];
}

export interface Programme {
  id: number;
  streamId: string;
  name?: string;
  course?: string;
  intake: number;
  outcomes: string[];
  icon: React.ReactNode;
  image?: string;
}

export interface NavItem {
  label: string;
  href?: string;
  type: "link" | "external" | "dropdown-about" | "dropdown";
  activePaths?: string[];
  items?: { label: string; href: string; matchPath?: string }[];
  dropdownClass?: string;
  subDropdown?: {
    label: string;
    activePaths: string[];
    items: { label: string; href: string }[];
  };
}

export interface PosterItem {
  id?: string | number;
  imgid?: string;
  image: string;
  timestamp?: string;
}

export interface NewsItem {
  _id?: string;
  id?: string | number;
  title: string;
  slug: string;
  image?: string;
  category?: string;
  excerpt?: string;
  content?: string;
  created_at?: string;
  createdat?: string | null;
  publishedat?: string | null;
  ispublished?: boolean | null;
}

export interface ContactItem {
  id?: string | number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status?: 'unread' | 'read';
  created_at?: string | Date;
}

export interface Application {
  id: string;
  name: string;
  whatsapp: string;
  stream: string;
  place: string;
  district: string;
  state: string;
  level: string;
  photo?: string;
  imgid?: string;
  islamic_education?: string;
  islamic_details?: string;
  school_name?: string;
  last_exam_mark?: string;
  address?: string;
  achievements?: string;
  skills?: string;
  interview_done?: boolean;
  fee_done?: boolean;
  status?: string;
  email_status?: string;
  created_at?: string;
  updated_at?: string;
  exam_results?: ExamResult;
}

export interface ExamResult {
  id?: number;
  admission_id?: number;
  islamic_knowledge?: number | null;
  science_aptness?: number | null;
  communication?: number | null;
  general_awareness?: number | null;
  achievements?: number | null;
  leadership?: number | null;
  interpersonal?: number | null;
  written_test?: number | null;
  created_at?: string;
  updated_at?: string;
}
