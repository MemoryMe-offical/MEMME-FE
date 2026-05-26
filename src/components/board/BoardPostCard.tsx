import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Linking, Alert } from 'react-native';
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
  onPress?: (post: BoardPost) => void;
}

const normalizeUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

const openUrl = async (url: string) => {
  try {
    await Linking.openURL(normalizeUrl(url));
  } catch {
    Alert.alert('오류', '링크를 여는 중 문제가 발생했습니다.');
  }
};

// OG 카드 (링크 미리보기 + 바로가기 버튼)
const OgCard = ({ url, ogData }: { url: string; ogData?: BoardPost['ogData'] }) => (
  <View style={styles['card-og-card']}>
    {ogData?.imageUrl && (
      <Image
        source={{ uri: ogData.imageUrl }}
        style={styles['card-og-image']}
        resizeMode="cover"
      />
    )}
    <View style={styles['card-og-body']}>
      <View style={styles['card-og-text']}>
        {ogData?.siteName && (
          <Text style={styles['card-og-sitename']}>{ogData.siteName}</Text>
        )}
        <Text style={styles['card-og-title']} numberOfLines={2}>
          {ogData?.title || url}
        </Text>
        {ogData?.description && (
          <Text style={styles['card-og-desc']} numberOfLines={2}>
            {ogData.description}
          </Text>
        )}
        <Text style={styles['card-og-url']} numberOfLines={1}>{url}</Text>
      </View>
      <TouchableOpacity
        style={styles['card-og-goto']}
        onPress={() =>
          Alert.alert('링크 열기', '링크가 열립니다. 이동하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            { text: '이동', onPress: () => openUrl(url) },
          ])
        }
        activeOpacity={0.8}>
        <Text style={styles['card-og-goto-text']}>바로가기</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// 링크 섹션 (url 없으면 숨김)
const LinkSection = ({ url, ogData }: { url?: string; ogData?: BoardPost['ogData'] }) => {
  if (!url) return null;
  return (
    <View style={styles['card-section-row']}>
      <Text style={styles['card-section-label']}>링크</Text>
      <OgCard url={url} ogData={ogData} />
    </View>
  );
};

const BoardPostCard = ({ item, onContextMenu, onDetailPress, onPress }: BoardPostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isGroup = Array.isArray(item.subItems) && item.subItems.length > 0;
  const initialExpandedId = isGroup && item.subItems!.length > 0 ? item.subItems![0].id : null;
  const [expandedSubId, setExpandedSubId] = useState<string | null>(initialExpandedId);

  const toggleSubItem = (subId: string) => {
    setExpandedSubId(prev => prev === subId ? null : subId);
  };

  return (
    <View style={styles['card-row']}>
      <Text style={styles['card-time']}>{formatTime(item.createdAt)}</Text>
      <TouchableOpacity
        activeOpacity={0.97}
        onPress={() => onPress?.(item)}
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
                      <TouchableOpacity
                        style={styles['sub-accordion-header']}
                        onPress={() => toggleSubItem(sub.id)}
                        activeOpacity={0.7}>
                        <Text style={styles['sub-accordion-title']}>{sub.title}</Text>
                        {isSubExpanded
                          ? <ChevronUpIcon color="#555555" size={16} />
                          : <ChevronDownIcon color="#555555" size={16} />}
                      </TouchableOpacity>

                      {isSubExpanded && (
                        <View>
                          {!!sub.content && (
                            <>
                              <View style={styles['card-section-row']}>
                                <Text style={styles['card-section-label']}>내용</Text>
                                <Text style={styles['card-content-text']} numberOfLines={3}>
                                  {sub.content}
                                </Text>
                              </View>
                            </>
                          )}
                          {!!sub.imageUris?.length && (
                            <>
                              <View style={styles['card-section-row']}>
                                <Text style={styles['card-section-label']}>사진</Text>
                              </View>
                            </>
                          )}
                          <LinkSection url={sub.url ?? item.url} ogData={sub.ogData ?? item.ogData} />
                        </View>
                      )}
                    </View>
                  );
                })
              : <View>
                  {!!item.content && (
                    <>
                      <View style={styles['card-section-row']}>
                        <Text style={styles['card-section-label']}>내용</Text>
                        <Text style={styles['card-content-text']} numberOfLines={3}>
                          {item.content}
                        </Text>
                      </View>
                    </>
                  )}
                  {!!item.imageUris?.length && (
                    <>
                      <View style={styles['card-section-row']}>
                        <Text style={styles['card-section-label']}>사진</Text>
                      </View>
                    </>
                  )}
                  <LinkSection url={item.url} ogData={item.ogData} />
                </View>
            }
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BoardPostCard;