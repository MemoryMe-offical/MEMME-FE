// 게시물 카드 컴포넌트 (드롭다운, 아코디언 서브아이템, 자세히 버튼)

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { BoardPost, SubPostItem } from '../../types/chatBoard.type';
import { boardPostCardStyles as styles } from '../../styles/BoardPostCard.styles';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MoreIcon,
} from '../common/Icons';

// Android에서 LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

  const isGroup = Array.isArray(item.subItems) && item.subItems.length > 0;

  // 아코디언: 현재 열린 서브아이템 ID (단일 선택, 기본: 첫 번째)
  const [expandedSubId, setExpandedSubId] = useState<string | null>(
    isGroup && item.subItems!.length > 0 ? item.subItems![0].id : null,
  );

  const toggleSubItem = (subId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubId(prev => (prev === subId ? null : subId));
  };

  const handleCardExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(prev => !prev);
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
            <TouchableOpacity onPress={handleCardExpand} hitSlop={8}>
              {isExpanded
                ? <ChevronUpIcon color="#FFFFFF" size={20} />
                : <ChevronDownIcon color="#FFFFFF" size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* 접힌 상태 — 활성 서브아이템 제목만 표시 */}
        {!isExpanded && isGroup && (
          <View style={styles['card-collapsed-subtitle-row']}>
            <Text style={styles['card-collapsed-subtitle-text']} numberOfLines={1}>
              {expandedSubId
                ? item.subItems!.find(s => s.id === expandedSubId)?.title ?? item.subItems![0].title
                : item.subItems![0].title}
            </Text>
          </View>
        )}

        {/* 펼쳐진 상태 */}
        {isExpanded && (
          <View style={styles['card-inner-card']}>
            {isGroup
              ? /* 그룹 게시물: 아코디언 */
                item.subItems!.map((sub: SubPostItem, idx: number) => {
                  const isSubExpanded = expandedSubId === sub.id;
                  const isLast = idx === item.subItems!.length - 1;
                  return (
                    <View key={sub.id}>
                      {/* 아코디언 헤더 */}
                      <TouchableOpacity
                        style={styles['sub-accordion-header']}
                        onPress={() => toggleSubItem(sub.id)}
                        activeOpacity={0.7}>
                        <Text style={styles['sub-accordion-title']}>{sub.title}</Text>
                        {isSubExpanded
                          ? <ChevronUpIcon color="#555555" size={16} />
                          : <ChevronDownIcon color="#555555" size={16} />}
                      </TouchableOpacity>

                      {/* 아코디언 내용 (펼쳐진 경우) */}
                      {isSubExpanded && (
                        <View>
                          <View style={styles['card-section-divider']} />
                          <View style={styles['card-section-row']}>
                            <Text style={styles['card-section-label']}>내용</Text>
                            <Text style={styles['card-content-text']} numberOfLines={3}>
                              {sub.content}
                            </Text>
                          </View>
                          <View style={styles['card-section-divider']} />
                          <View style={styles['card-section-row']}>
                            <Text style={styles['card-section-label']}>사진</Text>
                          </View>
                          <View style={styles['card-section-divider']} />
                          <View style={styles['card-section-row']}>
                            <Text style={styles['card-section-label']}>링크</Text>
                          </View>
                          <TouchableOpacity
                            style={styles['card-detail-row']}
                            onPress={() => onDetailPress(item, sub.id)}>
                            <Text style={styles['card-detail-btn']}>자세히 {'>'}</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* 아이템 사이 구분선 (마지막 제외) */}
                      {!isLast && <View style={styles['sub-accordion-divider']} />}
                    </View>
                  );
                })
              : /* 단일 게시물 */
                <View>
                  <View style={styles['card-section-row']}>
                    <Text style={styles['card-section-label']}>내용</Text>
                    <Text style={styles['card-content-text']} numberOfLines={3}>
                      {item.content}
                    </Text>
                  </View>
                  <View style={styles['card-section-divider']} />
                  <View style={styles['card-section-row']}>
                    <Text style={styles['card-section-label']}>사진</Text>
                  </View>
                  <View style={styles['card-section-divider']} />
                  <View style={styles['card-section-row']}>
                    <Text style={styles['card-section-label']}>링크</Text>
                  </View>
                  <TouchableOpacity
                    style={styles['card-detail-row']}
                    onPress={() => onDetailPress(item)}>
                    <Text style={styles['card-detail-btn']}>자세히 {'>'}</Text>
                  </TouchableOpacity>
                </View>
            }
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BoardPostCard;
