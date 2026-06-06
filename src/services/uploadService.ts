import { fetchWithAutoLogoutHandler } from '../utils/tokenUtils';

const BASE_URL = 'https://memme.o-r.kr/v1';

// 파일 업로드 제한
export const MAX_UPLOAD_SIZE = 100 * 1024 * 1024; // 100MB (한 번에 최대 100MB까지 업로드 가능)

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

interface ImageUploadResponse {
  urls: string[];
  keys: string[];
  names: string[];
}

interface VideoUploadResponse {
  url: string;
  key: string;
  name: string;
  thumbnailUrl?: string;
  duration: number;
  size: number;
}

interface FileUploadResponse {
  uid: string;
  url: string;
  key: string;
  name: string;
  mimeType: string;
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

    // 상대 경로 URL을 절대 경로로 변환
    const absoluteUrls = apiResponse.data.urls.map(url => {
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return `${BASE_URL}${url}`;
      return url;
    });

    return {
      keys: apiResponse.data.keys,
      urls: absoluteUrls,
      names: apiResponse.data.names,
    };
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
    // URL이 상대 경로이면 절대 경로로 변환
    const url = apiResponse.data.url.startsWith('http')
      ? apiResponse.data.url
      : apiResponse.data.url.startsWith('/')
        ? `${BASE_URL}${apiResponse.data.url}`
        : `${BASE_URL}/${apiResponse.data.url}`;
    return { ...apiResponse.data, url };
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
    // URL이 상대 경로이면 절대 경로로 변환
    const url = apiResponse.data.url.startsWith('http')
      ? apiResponse.data.url
      : apiResponse.data.url.startsWith('/')
        ? `${BASE_URL}${apiResponse.data.url}`
        : `${BASE_URL}/${apiResponse.data.url}`;
    return { ...apiResponse.data, url };
  } catch (error) {
    console.error('Failed to upload file:', error);
    throw error;
  }
};

/**
 * S3 객체 접근 URL 조회 (presigned URL)
 */
export const getUploadObjectUrl = async (key: string): Promise<string> => {
  try {
    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/upload/object-url?key=${encodeURIComponent(key)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<{ url: string }> = await response.json();
    return apiResponse.data.url;
  } catch (error) {
    console.error('Failed to get upload object URL:', error);
    throw error;
  }
};

/**
 * S3 객체 조회 (레거시 - redirect API)
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

/**
 * 이미지 파일로 메모 직접 생성 (새로운 방식)
 * 여러 이미지를 한 번에 보내면 하나의 메모에 함께 묶입니다 (카카오톡처럼)
 */
export const createMemoWithImage = async (fileUris: string | string[]): Promise<any> => {
  try {
    const formData = new FormData();

    // 단일 이미지 또는 배열 처리
    const uris = Array.isArray(fileUris) ? fileUris : [fileUris];

    for (const fileUri of uris) {
      const filename = fileUri.split('/').pop() || 'image.jpg';
      const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';

      formData.append('files', {
        uri: fileUri,
        type,
        name: filename,
      } as any);
    }

    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/memos/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<any> = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error('Failed to create memo with image:', error);
    throw error;
  }
};

/**
 * 영상 파일로 메모 직접 생성 (새로운 방식)
 */
export const createMemoWithVideo = async (fileUri: string, videoName?: string): Promise<any> => {
  try {
    const formData = new FormData();

    const filename = videoName || fileUri.split('/').pop() || 'video.mp4';

    formData.append('file', {
      uri: fileUri,
      type: 'video/mp4',
      name: filename,
    } as any);

    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/memos/video`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<any> = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error('Failed to create memo with video:', error);
    throw error;
  }
};

/**
 * 일반 파일로 메모 직접 생성 (새로운 방식)
 */
export const createMemoWithFile = async (fileUri: string, fileName?: string): Promise<any> => {
  try {
    const formData = new FormData();

    const filename = fileName || fileUri.split('/').pop() || 'file';

    formData.append('file', {
      uri: fileUri,
      type: 'application/octet-stream',
      name: filename,
    } as any);

    const response = await fetchWithAutoLogoutHandler(`${BASE_URL}/memos/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const apiResponse: ApiResponse<any> = await response.json();
    return apiResponse.data;
  } catch (error) {
    console.error('Failed to create memo with file:', error);
    throw error;
  }
};
