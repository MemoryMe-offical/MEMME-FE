// 게시물 카드 컴포넌트 (드롭다운, 서브탭, 자세히 버튼)

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BoardPost, SubPostItem } from '../../types/chatBoard.type';
import { boardPostCardStyles as styles } from '../../styles/BoardPostCard.styles';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MoreIcon,
} from '../common/Icons';

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isAM = hours < 12;
  const displayHours = hours % 12 || 12;
  return `${isAM ? '오전' : '오후'} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

interface BoardPostCardProps {
  item: BoardPost;
  onContextMenu: (post: BoardPost) => void;
  onDetailPress: (post: BoardPost, subItemId?: string) => void;
}

const BoardPostCard = ({ item, onContextMenu, onDetailPress }: BoardPostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSubIndex, setActiveSubIndex] = useState(0);

  const isGroup = Array.isArray(item.subItems) && item.subItems.length > 0;
  const activeSubItem: SubPostItem | null = isGroup ? (item.subItems![activeSubIndex] ?? null) : null;
  const inactiveSubItems = isGroup
    ? item.subItems!.filter((_, i) => i !== activeSubIndex)
    : [];

  const handleSubTabPress = (subItem: SubPostItem) => {
    const idx = item.subItems!.findIndex(s => s.id === subItem.id);
    if (idx !== -1) {
      setActiveSubIndex(idx);
    }
  };

  const handleDetailPress = () => {
    onDetailPress(item, activeSubItem?.id);
  };

  return (
    <View style={styles['card-row']}>
      <Text style={styles['card-time']}>{formatTime(item.createdAt)}</Text>
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={() => onContextMenu(item)}
        delayLongPress={400}
        style={styles['card-wrapper']}>
        {/* 헤더 */}
        <View style={styles['card-header']}>
          <Text style={styles['card-header-title']} numberOfLines={1}>
            {item.title}
          </Text>
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

        {/* 접힌 상태 서브아이템 제목 */}
        {!isExpanded && isGroup && activeSubItem && (
          <View style={styles['card-collapsed-subtitle-row']}>
            <Text style={styles['card-collapsed-subtitle-text']} numberOfLines={2}>
              {activeSubItem.title}
            </Text>
          </View>
        )}

        {/* 바디 */}
        {isExpanded && (
          <View style={styles['card-body']}>
            {/* 그룹일 때 활성 서브아이템 제목 */}
            {isGroup && activeSubItem && (
              <Text style={styles['card-body-subtitle']}>{activeSubItem.title}</Text>
            )}

            <Text style={styles['card-section-label']}>내용</Text>
            <Text style={styles['card-content-text']} numberOfLines={3}>
              {isGroup ? (activeSubItem?.content ?? '') : item.content}
            </Text>

            <TouchableOpacity style={styles['card-detail-row']} onPress={handleDetailPress}>
              <Text style={styles['card-detail-btn']}>자세히 {'>'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 서브탭 (그룹이고 펼쳐진 상태, 비활성 서브아이템 있을 때) */}
        {isExpanded && isGroup && inactiveSubItems.length > 0 && (
          <View style={styles['card-subtab-row']}>
            {inactiveSubItems.map(sub => (
              <TouchableOpacity
                key={sub.id}
                style={styles['card-subtab-btn']}
                onPress={() => handleSubTabPress(sub)}
                activeOpacity={0.7}>
                <Text style={styles['card-subtab-text']}>{sub.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BoardPostCard;
