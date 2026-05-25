import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { OgData } from '../../types';
import { CloseIcon, LinkIcon, AiIcon } from '../common/Icons';

interface OgPreviewCardProps {
  url: string;
  ogData: OgData;
  onRemove?: () => void;
  onRequestSummary?: () => void;
  isSummaryLoading?: boolean;
  summaryAdded?: boolean;
  onRequestAndAddSummary?: () => void;
}

const OgPreviewCard = ({ url, ogData, onRemove, onRequestSummary, isSummaryLoading, summaryAdded, onRequestAndAddSummary }: OgPreviewCardProps) => {
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
          {onRequestAndAddSummary ? (
            isSummaryLoading ? (
              <ActivityIndicator size={10} color="#588DFF" style={{ marginTop: 4, alignSelf: 'flex-start' }} />
            ) : summaryAdded ? (
              <Text style={styles['added-text']}>✓ 추가됨</Text>
            ) : (
              <TouchableOpacity
                style={styles['summary-btn']}
                onPress={onRequestAndAddSummary}
                hitSlop={4}>
                <AiIcon color="#588DFF" size={10} />
                <Text style={styles['summary-btn-text']}>내용에 AI 요약 추가</Text>
              </TouchableOpacity>
            )
          ) : onRequestSummary ? (
            isSummaryLoading ? (
              <ActivityIndicator size={10} color="#588DFF" style={{ marginTop: 4, alignSelf: 'flex-start' }} />
            ) : (
              <TouchableOpacity
                style={styles['summary-btn']}
                onPress={onRequestSummary}
                hitSlop={4}>
                <AiIcon color="#588DFF" size={10} />
                <Text style={styles['summary-btn-text']}>AI 요약</Text>
              </TouchableOpacity>
            )
          ) : null}
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
  image: { width: 68, height: 68 },
  'image-placeholder': {
    width: 68,
    height: 68,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, padding: 8, gap: 2 },
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
