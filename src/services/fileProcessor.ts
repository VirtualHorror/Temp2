import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { ProcessedData, FitnessData } from '../types/index.js';

const PROCESSED_DIR = path.join(process.cwd(), 'storage', 'processed');
const TEMP_DIR = path.join(process.cwd(), 'storage', 'temp');

export async function processUpload(file: Express.Multer.File): Promise<ProcessedData> {
  try {
    const zip = new AdmZip(file.path);
    
    // Extract to processed directory
    await fs.mkdir(PROCESSED_DIR, { recursive: true });
    zip.extractAllTo(PROCESSED_DIR, true);

    const fitDataPath = path.join(PROCESSED_DIR, 'Takeout', 'Fit', 'All Data');
    const files = await fs.readdir(fitDataPath);
    
    const processedData: ProcessedData = {
      files: {},
      timestamp: new Date().toISOString(),
      deviceCount: 0
    };
    
    const deviceMap = new Map<string, number>();

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(fitDataPath, file);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const hash = crypto.createHash('sha256').update(fileContent).digest('hex');
        
        // Extract base filename without device number
        const baseFilename = file.replace(/\(\d+\)\.json$/, '.json');
        
        // Track device count
        if (!deviceMap.has(baseFilename)) {
          deviceMap.set(baseFilename, 1);
        } else {
          deviceMap.set(baseFilename, deviceMap.get(baseFilename)! + 1);
        }

        const data: FitnessData = {
          content: JSON.parse(fileContent),
          hash,
          deviceId: deviceMap.get(baseFilename)!,
          timestamp: new Date().toISOString()
        };

        if (!processedData.files[baseFilename]) {
          processedData.files[baseFilename] = [];
        }
        processedData.files[baseFilename].push(data);
      }
    }

    processedData.deviceCount = Math.max(...Array.from(deviceMap.values()));

    // Cleanup temp file
    await fs.unlink(file.path);
    
    return processedData;
  } catch (error) {
    console.error('Processing error:', error);
    throw new Error('File processing failed');
  }
}

export async function getData(): Promise<ProcessedData | null> {
  try {
    // In a real application, this would retrieve from a database
    // For now, we'll return null to indicate no data
    return null;
  } catch (error) {
    console.error('Data retrieval error:', error);
    throw new Error('Failed to retrieve data');
  }
}

export async function getHash(filename: string): Promise<string> {
  try {
    // In a real application, this would retrieve from a secure key vault
    // For now, we'll return a placeholder
    return 'hash-not-implemented';
  } catch (error) {
    console.error('Hash retrieval error:', error);
    throw new Error('Failed to retrieve hash');
  }
}