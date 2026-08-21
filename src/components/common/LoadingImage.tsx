import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { getUploadObjectUrl } from '../../services/uploadService';

interface LoadingImageProps {
  source: { uri: string };
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  onError?: (error: any) => void;
  onLoad?: () => void;
  // S3 object key. presigned URL(source.uri)이 만료돼 로드가 실패하면
  // 이 key로 새 presigned URL을 받아와 한 번 재시도한다.
  objectKey?: string;
}

const LoadingImage = ({ source, style, resizeMode = 'cover', onError, onLoad, objectKey }: LoadingImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [uri, setUri] = useState(source.uri);
  const [hasRetried, setHasRetried] = useState(false);

  // 상위에서 다른 이미지로 source가 바뀌면 재시도 상태도 초기화한다.
  useEffect(() => {
    setUri(source.uri);
    setHasRetried(false);
    setIsLoading(true);
  }, [source.uri]);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = async (error: any) => {
    // presigned URL 만료가 의심되는 경우, object key로 새 URL을 한 번만
    // 받아와 재시도한다. key가 없거나 이미 재시도했다면 그대로 실패 처리.
    if (objectKey && !hasRetried) {
      setHasRetried(true);
      try {
        const freshUrl = await getUploadObjectUrl(objectKey);
        setUri(freshUrl);
        return;
      } catch {
        // 새 URL 조회도 실패하면 아래에서 일반 에러로 처리
      }
    }

    setIsLoading(false);
    onError?.(error);
  };

  return (
    <View style={[style, styles.container]}>
      <Image
        source={{ uri }}
        style={style}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color="#588DFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loaderOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

export default LoadingImage;
