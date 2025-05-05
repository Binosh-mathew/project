import { FileDetails } from '@/types/order';
import { api } from './api';

// Storage key for the file metadata in localStorage
const FILE_STORAGE_KEY = 'print_spark_files';

export interface StoredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
  userId: string;
}

// Initialize file storage
const initializeFileStorage = (): StoredFile[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedFiles = localStorage.getItem(FILE_STORAGE_KEY);
    if (storedFiles) {
      return JSON.parse(storedFiles);
    }
    localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (error) {
    console.error('Error initializing file storage:', error);
    return [];
  }
};

// Get all stored files
export const getStoredFiles = async (): Promise<StoredFile[]> => {
  try {
    const response = await api.get('/files');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stored files:', error);
    return [];
  }
};

// Store a new file
export const storeFile = async (file: File): Promise<StoredFile> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Error storing file:', error);
    throw new Error('Failed to store file');
  }
};

// Get a file by ID
export const getFileById = async (fileId: string): Promise<StoredFile | null> => {
  try {
    const response = await api.get(`/files/${fileId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
};

// Download a file
export const downloadFile = (fileId: string): void => {
  console.log('Attempting to download file:', fileId);
  const file = getFileById(fileId);
  if (!file || !file.url) {
    console.error('File not found:', fileId);
    throw new Error('File not found');
  }

  // Create a link element
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log('File download initiated:', file.name);
};

// Clean up blob URLs when they're no longer needed
export const cleanupFile = (fileId: string): void => {
  const file = getFileById(fileId);
  if (file?.url) {
    // Remove the file from storage
    const files = getStoredFiles().filter(f => f.id !== fileId);
    localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(files));
  }
};

// Convert uploaded File to FileDetails
export const createFileDetails = async (file: File): Promise<{ fileDetails: FileDetails; fileId: string }> => {
  console.log('Creating file details for:', file.name);
  const fileId = await storeFile(file);
  console.log('File stored with ID:', fileId);
  
  const fileDetails: FileDetails = {
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    url: fileId,
    copies: 1,
    printType: 'blackAndWhite',
    specialPaper: 'none',
    binding: {
      needed: false,
      type: 'none'
    }
  };

  console.log('Created file details:', fileDetails);
  return { fileDetails, fileId };
};

export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await api.delete(`/files/${fileId}`);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}; 