import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const BASE_URL = 'https://memme.o-r.kr/v1';

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

interface ImageUploadResponse {
  urls: string[];
  keys: string[];
}

interface VideoUploadResponse {
  url: string;
  key: string;
  duration: number;
  size: number;
}

interface FileUploadResponse {
  url: string;
  key: string;
  name: string;
  type: string;
  size: number;
}

/**
 * 이미지 업로드
 */
export const uploadImages = async (
  fileUris: string[]
): Promise<ImageUploadResponse> => {
  try {
    const formData = new FormData();

    for (const uri of fileUris) {
      const filename = uri.split('/').pop() || 'image.jpg';
      const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

      formData.append('files', {
        uri,
        type,
        name: filename,
      } as any);
    }

    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<ImageUploadResponse> = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error('Failed to upload images:', error);
    throw error;
  }
};

/**
 * 영상 업로드
 */
export const uploadVideo = async (fileUri: string): Promise<VideoUploadResponse> => {
  try {
    const formData = new FormData();

    const filename = fileUri.split('/').pop() || 'video.mp4';
    formData.append('file', {
      uri: fileUri,
      type: 'video/mp4',
      name: filename,
    } as any);

    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/upload/video`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<VideoUploadResponse> = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error('Failed to upload video:', error);
    throw error;
  }
};

/**
 * 파일 업로드
 */
export const uploadFile = async (fileUri: string): Promise<FileUploadResponse> => {
  try {
    const formData = new FormData();

    const filename = fileUri.split('/').pop() || 'file';
    formData.append('file', {
      uri: fileUri,
      type: 'application/octet-stream',
      name: filename,
    } as any);

    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/upload/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<FileUploadResponse> = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error('Failed to upload file:', error);
    throw error;
  }
};

/**
 * S3 객체 조회
 */
export const getUploadObject = async (key: string): Promise<any> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/upload/object?key=${encodeURIComponent(key)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<any> = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error('Failed to get upload object:', error);
    throw error;
  }
};
