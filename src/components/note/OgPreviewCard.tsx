import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { OgData } from '../../types';
import { CloseIcon, LinkIcon } from '../common/Icons';

interface OgPreviewCardProps {
  url: string;
  ogData: OgData;
  onRemove?: () => void;
}

const OgPreviewCard = ({ url, ogData, onRemove }: OgPreviewCardProps) => {
  const displayDomain = (() => {
    const match = url.match(/^(?:https?:\/\/)?([^/?#]+)/);
    return match ? match[1] : url;
  })();

  const handlePress = () => {
    if (url) {
      Linking.openURL(url).catch(() => {
        console.error('Failed to open URL:', url);
      });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {ogData.imageUrl ? (
          <Image source={{ uri: ogData.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles['image-placeholder']}>
            <LinkIcon color="#AABBCC" size={32} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.domain} numberOfLines={1}>
            {ogData.siteName || displayDomain}
          </Text>
          <Text style={styles.title} numberOfLines={3}>
            {ogData.title || '링크'}
          </Text>
          {!!ogData.description && (
            <Text style={styles.description} numberOfLines={2}>
              {ogData.description}
            </Text>
          )}
          {!ogData.title && (
            <Text style={styles.url} numberOfLines={2}>
              {url}
            </Text>
          )}
        </View>
      </View>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles['remove-btn']} hitSlop={8}>
          <CloseIcon color="#9DAFC8" size={18} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    overflow: 'hidden',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  image: { width: 88, height: 88 },
  'image-placeholder': {
    width: 88,
    height: 88,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, padding: 14, gap: 6 },
  domain: {
    fontSize: 11,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
  },
  url: {
    fontSize: 12,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    lineHeight: 18,
  },
  'remove-btn': { padding: 12 },
});

export default OgPreviewCard;
