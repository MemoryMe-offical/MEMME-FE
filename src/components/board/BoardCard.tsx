import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Board } from '../../types';
import { boardCardStyles as styles } from '../../styles/BoardCard.styles';
import { ChevronDownIcon, ChevronUpIcon, MoreIcon } from '../common/Icons';

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;
  return `${isAM ? '오전' : '오후'} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

interface BoardCardProps {
  item: Board;
  onContextMenu: (board: Board) => void;
  onDetailPress: (board: Board, noteId?: string) => void;
  onPress?: (board: Board) => void;
}

const BoardCard = ({ item, onContextMenu, onDetailPress, onPress }: BoardCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasNotes = Array.isArray(item.notes) && item.notes.length > 0;
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(
    hasNotes ? item.notes![0].id : null,
  );

  const toggleNote = (noteId: string) => {
    setExpandedNoteId(prev => (prev === noteId ? null : noteId));
  };

  return (
    <View style={styles['card-row']}>
      <Text style={styles['card-time']}>{formatTime(item.createdAt)}</Text>
      <View
        onLongPress={() => onContextMenu(item)}
        style={styles['card-wrapper']}>

        {/* 헤더 */}
        <View style={styles['card-header']}>
          <TouchableOpacity
            style={styles['card-header-title-touch']}
            onPress={() => onDetailPress(item)}
            activeOpacity={0.7}>
            <Text style={styles['card-header-title']} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
          <View style={styles['card-header-actions']}>
            <TouchableOpacity onPress={() => onContextMenu(item)} hitSlop={8}>
              <MoreIcon color="#FFFFFF" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsExpanded(prev => !prev)} hitSlop={8}>
              {isExpanded
                ? <ChevronUpIcon color="#FFFFFF" size={20} />
                : <ChevronDownIcon color="#FFFFFF" size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* 태그 칩 */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles['card-tags-row']}>
            {item.tags.map(tag => (
              <View key={tag} style={styles['card-tag-chip']}>
                <Text style={styles['card-tag-text']}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 접힌 상태 */}
        {!isExpanded && hasNotes && (
          <View style={styles['card-collapsed-subtitle-row']}>
            <Text style={styles['card-collapsed-subtitle-text']} numberOfLines={1}>
              {expandedNoteId
                ? item.notes!.find(n => n.id === expandedNoteId)?.title ?? item.notes![0].title
                : item.notes![0].title}
            </Text>
          </View>
        )}

        {/* 펼쳐진 상태 */}
        {isExpanded && (
          <View style={styles['card-inner-card']}>
            {hasNotes
              ? (
                <View>
                  {item.notes!.slice(0, 3).map((note, idx) => {
                    const isNoteExpanded = expandedNoteId === note.id;
                    const isLast = idx === Math.min(item.notes!.length - 1, 2);
                    return (
                      <View key={note.id}>
                        <TouchableOpacity
                          style={styles['sub-accordion-header']}
                          onPress={() => toggleNote(note.id)}
                          activeOpacity={0.7}>
                          <Text style={styles['sub-accordion-title']} numberOfLines={1}>
                            {note.title}
                          </Text>
                          {isNoteExpanded
                            ? <ChevronUpIcon color="#555555" size={16} />
                            : <ChevronDownIcon color="#555555" size={16} />}
                        </TouchableOpacity>

                        {isNoteExpanded && !!note.content && (
                          <TouchableOpacity
                            onPress={() => onDetailPress(item, note.id)}
                            activeOpacity={0.7}>
                            <View style={styles['card-section-divider']} />
                            <View style={styles['card-section-row']}>
                              <Text style={styles['card-section-label']}>내용</Text>
                              <Text style={styles['card-content-text']} numberOfLines={3}>
                                {note.content}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        )}

                        {!isLast && <View style={styles['sub-accordion-divider']} />}
                      </View>
                    );
                  })}
                  {item.notes!.length > 3 && (
                    <>
                      <View style={styles['sub-accordion-divider']} />
                      <TouchableOpacity
                        style={styles['more-notes-button']}
                        onPress={() => onDetailPress(item)}
                        activeOpacity={0.7}>
                        <Text style={styles['more-notes-text']}>
                          +{item.notes!.length - 3}개 더보기
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )
              : (
                <View style={styles['card-empty-notes']}>
                  <Text style={styles['card-empty-notes-text']}>노트 없음</Text>
                </View>
              )}
          </View>
        )}
      </View>
    </View>
  );
};

export default BoardCard;
