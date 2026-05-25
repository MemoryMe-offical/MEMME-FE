import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingImageProps {
  source: { uri: string };
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  onError?: (error: any) => void;
  onLoad?: () => void;
}

const LoadingImage = ({ source, style, resizeMode = 'cover', onError, onLoad }: LoadingImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    onError?.(error);
  };

  return (
    <View style={[style, styles.container]}>
      <Image
        source={source}
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
