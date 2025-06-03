import axios from 'axios';
import { config } from '../config';
import { getAuthToken } from '../utils/auth';

export interface UploadResponse {
  message: string;
  fileName: string;
  bucketName: string;
  publicUrl: string;
  uploadTime: string;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class FileUploadService {
  static async uploadFile(
    file: File,
    onProgress?: (progress: FileUploadProgress) => void,
    customFileName?: string,
    bucketName?: string
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (customFileName) {
      formData.append('fileName', customFileName);
    }
    
    if (bucketName) {
      formData.append('bucketName', bucketName);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress: FileUploadProgress = {
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100)
            };
            onProgress(progress);
          }
        });
      }

      xhr.onload = () => {
        console.log('Upload response status:', xhr.status);
        console.log('Upload response text:', xhr.responseText);
        
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else if (xhr.status === 403) {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            console.error('403 Forbidden response:', errorResponse);
            reject(new Error(`Access denied: ${errorResponse.error || 'Authentication failed or insufficient permissions'}`));
          } catch {
            reject(new Error('Access denied: Authentication failed or insufficient permissions'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'));
      };

      // Set timeout to 5 minutes
      xhr.timeout = 5 * 60 * 1000;

      xhr.open('POST', `${config.apiUrl}/api/v1/files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${getAuthToken()}`);
      xhr.send(formData);
    });
  }

  static async deleteFile(fileName: string, bucketName?: string): Promise<void> {
    const params = new URLSearchParams({ fileName });
    if (bucketName) {
      params.append('bucketName', bucketName);
    }

    const response = await axios.delete(`${config.apiUrl}/api/v1/files/delete?${params}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to delete file');
    }
  }

  static async checkFileExists(fileName: string, bucketName?: string): Promise<boolean> {
    const params = new URLSearchParams({ fileName });
    if (bucketName) {
      params.append('bucketName', bucketName);
    }

    try {
      const response = await axios.get(`${config.apiUrl}/api/v1/files/exists?${params}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data.exists;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  static validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'File is empty' };
    }

    // 10MB limit (adjust as needed)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    // Common allowed extensions (adjust as needed)
    const allowedExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', // Images
      '.mp4', '.avi', '.mov', '.wmv', '.webm', // Videos
      '.pdf', '.doc', '.docx', '.txt', '.rtf', // Documents
      '.zip', '.rar', '.7z', // Archives
    ];

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return { 
        valid: false, 
        error: `File type ${fileExtension} is not allowed. Allowed types: ${allowedExtensions.join(', ')}` 
      };
    }

    return { valid: true };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const iconMap: { [key: string]: string } = {
      // Images
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️',
      // Videos
      mp4: '🎥', avi: '🎥', mov: '🎥', wmv: '🎥', webm: '🎥',
      // Documents
      pdf: '📄', doc: '📝', docx: '📝', txt: '📄', rtf: '📝',
      // Archives
      zip: '📦', rar: '📦', '7z': '📦',
    };

    return iconMap[extension || ''] || '📎';
  }
} 