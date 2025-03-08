export interface FitnessData {
  content: any;
  hash: string;
  deviceId: number;
  timestamp: string;
}

export interface ProcessedData {
  files: {
    [filename: string]: FitnessData[];
  };
  timestamp: string;
  deviceCount: number;
}