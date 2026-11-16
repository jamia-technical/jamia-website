export interface JnetResult {
  Rank?: number;
  Application_no: string;
  stream : string;
  name: string;
  Phone_number: string;
  dob: string;
  writing_test: {
    Section_A: number;
    Section_B: number;
    Section_C: number;
    Section_D: number;
    Section_E: number;
    Section_F: number;
    total: number;
  };
  interview: {
    islamic_knowledge: number;
    science_aptness: number;
    communication: number;
    general_awareness: number;
    achievements: number;
    leadership: number;
    interpersonal: number;
    total: number;
  };
  Grand_total: number;
  Status: string;
  campus: string;
  additional_note?: string;
}
