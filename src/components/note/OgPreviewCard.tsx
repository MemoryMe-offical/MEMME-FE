import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { OgData } from '../../types';
import { CloseIcon, LinkIcon } from '../common/Icons';
import LoadingImage from '../common/LoadingImage';

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
          <LoadingImage source={{ uri: ogData.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles['image-placeholder']}>
            <LinkIcon color="#AABBCC" size={32} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.domain} numberOfLines={1}>
            {ogData.siteName || displayDomain}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {ogData.title || '링크'}
          </Text>
          {!!ogData.description && (
            <Text style={styles.description} numberOfLines={1}>
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
    gap: 0,
  },
  image: { width: 68, height: 68 },
  'image-placeholder': {
    width: 68,
    height: 68,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2, padding: 8 },
  domain: {
    fontSize: 10,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 16,
  },
  description: {
    fontSize: 10,
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
    lineHeight: 15,
  },
  url: {
    fontSize: 10,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    lineHeight: 15,
  },
  'remove-btn': { padding: 8 },
  'summary-box': {
    backgroundColor: '#F0F5FF',
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  'summary-label': {
    fontSize: 9,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  'summary-text': {
    fontSize: 10,
    color: '#4A5568',
    fontFamily: 'PretendardVariable',
    lineHeight: 15,
  },
  'summary-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#EEF3FF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  'summary-btn-text': {
    fontSize: 10,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'summary-footer': {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  'add-to-note-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 2,
  },
  'add-to-note-text': {
    fontSize: 10,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'added-text': {
    fontSize: 10,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
  },
});

export default OgPreviewCard;
