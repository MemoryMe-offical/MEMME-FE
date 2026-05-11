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
      activeOpacity={0.7}
      disabled={onRemove ? false : true}>
      <View style={styles.content}>
        {ogData.imageUrl ? (
          <Image source={{ uri: ogData.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles['image-placeholder']}>
            <LinkIcon color="#AABBCC" size={24} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.domain} numberOfLines={1}>
            {ogData.siteName || displayDomain}
          </Text>
          <Text style={styles.title} numberOfLines={2}>
            {ogData.title || url}
          </Text>
          {!!ogData.description && (
            <Text style={styles.description} numberOfLines={2}>
              {ogData.description}
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
  image: { width: 72, height: 72 },
  'image-placeholder': {
    width: 72,
    height: 72,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, padding: 10, gap: 2 },
  domain: {
    fontSize: 11,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 18,
  },
  description: {
    fontSize: 12,
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
    lineHeight: 16,
    marginTop: 2,
  },
  'remove-btn': { padding: 10 },
});

export default OgPreviewCard;
