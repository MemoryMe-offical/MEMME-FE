import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Note } from '../../types';
import { ImageIcon, LinkIcon, ChevronDownIcon } from '../common/Icons';
import OgPreviewCard from './OgPreviewCard';

interface NoteCardProps {
  note: Note;
  expanded: boolean;
  onToggleExpand: () => void;
}

const NoteCard = ({ note, expanded, onToggleExpand }: NoteCardProps) => {
  const imageCount = note.imageUris?.length ?? 0;
  const fileCount = note.files?.length ?? 0;
  const hasLink = !!note.url;
  const hasAttachments = imageCount > 0 || fileCount > 0 || hasLink;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={onToggleExpand}
        activeOpacity={0.7}>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
          {!expanded && !!note.content && (
            <Text style={styles.preview} numberOfLines={2}>{note.content}</Text>
          )}
        </View>
        <View style={[
          styles.chevron,
          expanded && styles.chevronRotated,
        ]}>
          <ChevronDownIcon color="#588DFF" size={20} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          {!!note.content && (
            <Text style={styles.fullContent}>{note.content}</Text>
          )}

          {hasAttachments && (
            <View style={styles.attachmentsSection}>
              {imageCount > 0 && (
                <View style={styles.attachmentGroup}>
                  <View style={styles['attach-badge']}>
                    <ImageIcon color="#588DFF" size={13} />
                    <Text style={styles['attach-text']}>사진 {imageCount}개</Text>
                  </View>
                  <View style={styles.imageGrid}>
                    {note.imageUris?.slice(0, 3).map((uri, idx) => (
                      <Image
                        key={idx}
                        source={{ uri }}
                        style={styles.thumbnail}
                      />
                    ))}
                    {imageCount > 3 && (
                      <View style={styles.moreImages}>
                        <Text style={styles.moreText}>+{imageCount - 3}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {hasLink && (
                <View style={styles.attachmentGroup}>
                  <View style={styles['attach-badge']}>
                    <LinkIcon color="#588DFF" size={13} />
                    <Text style={styles['attach-text']}>링크</Text>
                  </View>
                  <OgPreviewCard url={note.url!} ogData={note.ogData} />
                </View>
              )}

              {fileCount > 0 && (
                <View style={styles['attach-badge']}>
                  <Text style={styles['attach-file-text']}>📄 파일 {fileCount}개</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  titleSection: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  preview: {
    fontSize: 13,
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
  },
  chevron: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F4FF',
    gap: 12,
  },
  fullContent: {
    fontSize: 13,
    color: '#3A3A3A',
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
  },
  attachmentsSection: {
    gap: 12,
  },
  attachmentGroup: {
    gap: 8,
  },
  'attach-badge': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  'attach-text': {
    fontSize: 12,
    color: '#588DFF',
    fontWeight: '500',
    fontFamily: 'PretendardVariable',
  },
  'attach-file-text': {
    fontSize: 12,
    color: '#588DFF',
    fontWeight: '500',
    fontFamily: 'PretendardVariable',
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
  },
  moreImages: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E8EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
});

export default NoteCard;
