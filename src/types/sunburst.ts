export interface SunburstData {
  name: string;
  children?: SunburstData[];
  value?: number;
}