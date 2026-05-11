import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Note } from '../../types';
import { ImageIcon, LinkIcon } from '../common/Icons';

interface NoteCardProps {
  note: Note;
  expanded?: boolean;
  onToggleExpand?: (note: Note) => void;
  onPress?: () => void;
}

const NoteCard = ({ note, expanded = false, onToggleExpand, onPress }: NoteCardProps) => {
  const imageCount = note.imageUris?.length ?? 0;
  const fileCount = note.files?.length ?? 0;
  const hasLink = !!note.url;
  const hasAttachments = imageCount > 0 || fileCount > 0 || hasLink;
  const isLongContent = note.content && note.content.length > 100;

  const handlePress = () => {
    if (isLongContent && onToggleExpand) {
      onToggleExpand(note);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
      {!!note.content && (
        <Text style={styles.preview} numberOfLines={expanded ? 0 : 2}>
          {note.content}
          {!expanded && isLongContent && '...'}
        </Text>
      )}
      {hasAttachments && (
        <View style={styles.attachments}>
          {imageCount > 0 && (
            <View style={styles['attach-badge']}>
              <ImageIcon color="#588DFF" size={13} />
              <Text style={styles['attach-text']}>{imageCount}</Text>
            </View>
          )}
          {hasLink && (
            <View style={styles['attach-badge']}>
              <LinkIcon color="#588DFF" size={13} />
            </View>
          )}
          {fileCount > 0 && (
            <View style={styles['attach-badge']}>
              <Text style={styles['attach-file-text']}>📄 {fileCount}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4ECFF',
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
  attachments: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    alignItems: 'center',
  },
  'attach-badge': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  'attach-text': {
    fontSize: 12,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'attach-file-text': {
    fontSize: 12,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
});

export default NoteCard;
