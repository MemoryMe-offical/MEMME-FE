// 게시물 카드 컴포넌트 (드롭다운, 아코디언 서브아이템, 자세히 버튼)

import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
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

  const isGroup = Array.isArray(item.subItems) && item.subItems.length > 0;
  const initialExpandedId = isGroup && item.subItems!.length > 0 ? item.subItems![0].id : null;

  const [expandedSubId, setExpandedSubId] = useState<string | null>(initialExpandedId);

  // 서브아이템별 Animated.Value (0=닫힘, 1=열림)
  const animatedValues = useRef<Record<string, Animated.Value>>(
    isGroup
      ? Object.fromEntries(
          item.subItems!.map(sub => [
            sub.id,
            new Animated.Value(sub.id === initialExpandedId ? 1 : 0),
          ]),
        )
      : {},
  );

  const toggleSubItem = (subId: string) => {
    const isClosing = expandedSubId === subId;
    const prevId = expandedSubId;

    setExpandedSubId(isClosing ? null : subId);

    const animations: Animated.CompositeAnimation[] = [];

    // 이전 항목 닫기
    if (prevId && prevId !== subId) {
      animations.push(
        Animated.timing(animatedValues.current[prevId], {
          toValue: 0,
          duration: 220,
          useNativeDriver: false,
        }),
      );
    }

    // 현재 항목 열기 or 닫기
    animations.push(
      Animated.timing(animatedValues.current[subId], {
        toValue: isClosing ? 0 : 1,
        duration: 280,
        useNativeDriver: false,
      }),
    );

    Animated.parallel(animations).start();
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

        {/* 접힌 상태 */}
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
              ? item.subItems!.map((sub: SubPostItem, idx: number) => {
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

                      {/* 애니메이션 콘텐츠 */}
                      <Animated.View
                        style={{
                          maxHeight: animatedValues.current[sub.id].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 500],
                          }),
                          opacity: animatedValues.current[sub.id].interpolate({
                            inputRange: [0, 0.4, 1],
                            outputRange: [0, 0, 1],
                          }),
                          overflow: 'hidden',
                        }}>
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
                      </Animated.View>

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
