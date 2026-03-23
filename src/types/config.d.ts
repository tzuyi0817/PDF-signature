export type Theme = 'light' | 'dark' | 'system';

export interface Loading {
  isShow: boolean;
  title: string;
  content: string;
  isProcess: boolean;
  completeness: number;
}
