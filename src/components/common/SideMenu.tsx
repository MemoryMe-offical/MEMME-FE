// 햄버거 메뉴 - 우측 슬라이드 패널

import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Board, TimelineItem, Memo } from '../../types';
import { CloseIcon, EditIcon, SettingsIcon } from './Icons';
import { SIDE_MENU_WIDTH, sideMenuStyles as styles } from '../../styles/SideMenu.styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  visible: boolean;
  items: TimelineItem[];
  onClose: () => void;
  onSettings: () => void;
  onBookmarkPress: (item: TimelineItem) => void;
  isBookmarkFilterActive?: boolean;
  onBookmarkFilterToggle?: (active: boolean) => void;
}

const SideMenu = ({ visible, items, onClose, onSettings, onBookmarkPress, isBookmarkFilterActive, onBookmarkFilterToggle }: Props) => {
  const slideAnim = useRef(new Animated.Value(SIDE_MENU_WIDTH)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SIDE_MENU_WIDTH);
      Animated.spring(slideAnim, {
        toValue: 0,
        bounciness: 3,
        speed: 14,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SIDE_MENU_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const bookmarkedItems = items.filter(item => item.bookMark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.38)" />

      <View style={styles['sideMenu-overlay']}>
        {/* 백드롭 */}
        <TouchableOpacity
          style={styles['sideMenu-backdrop']}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* 패널 */}
        <Animated.View
          style={[
            styles['sideMenu-panel'],
            {
              marginTop: insets.top,
              height: SCREEN_HEIGHT - insets.top - insets.bottom,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles['sideMenu-safeArea']}>
            {/* 파란 헤더 */}
            <View style={styles['sideMenu-headerBg']}>
              <View style={styles['sideMenu-header']}>
                <TouchableOpacity
                  style={styles['sideMenu-header-btn']}
                  onPress={handleClose}
                >
                  <CloseIcon color="rgba(255,255,255,0.85)" size={25} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles['sideMenu-header-btn']}
                  onPress={onSettings}
                >
                  <SettingsIcon color="rgba(255,255,255,0.85)" size={23} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 흰 프로필 영역 */}
            <View style={styles['sideMenu-profileSection']}>
              <Image
                source={require('../../assets/imgs/mainart.png')}
                style={styles['sideMenu-profile-avatar']}
              />

              <View style={styles['sideMenu-profile-nameRow']}>
                <Text style={styles['sideMenu-profile-name']}>사용자 님</Text>
                <EditIcon color="#9DAFC8" size={14} />
              </View>

              {/* 스토리지 */}
              <View style={styles['sideMenu-storage']}>
                <View style={styles['sideMenu-storage-textRow']}>
                  <Text style={styles['sideMenu-storage-usedText']}>0 GB</Text>
                  <Text style={styles['sideMenu-storage-totalText']}>/ 100 GB</Text>
                  <TouchableOpacity style={styles['sideMenu-storage-detailBtn']}>
                    <Text style={styles['sideMenu-storage-detailText']}>자세히</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles['sideMenu-storage-barWrapper']}>
                  <View style={styles['sideMenu-storage-barBg']}>
                    <View
                      style={[
                        styles['sideMenu-storage-barFill'],
                        { width: '0%' },
                      ]}
                    />
                  </View>
                  <View
                    style={[
                      styles['sideMenu-storage-barThumb'],
                      { left: 0 },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* 흰 콘텐츠 영역 */}
            <ScrollView
              style={styles['sideMenu-scroll']}
              contentContainerStyle={[
                styles['sideMenu-scrollContent'],
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* 북마크 */}
              <View style={styles['sideMenu-section']}>
                <TouchableOpacity
                  style={[styles['sideMenu-section-header'], { paddingVertical: 12 }]}
                  onPress={() => onBookmarkFilterToggle?.(!isBookmarkFilterActive)}>
                  <Text style={[styles['sideMenu-section-title'], isBookmarkFilterActive && { color: '#588DFF', fontWeight: '700' }]}>
                    북마크{isBookmarkFilterActive ? ' (필터 활성화)' : ''}
                  </Text>
                  {bookmarkedItems.length > 0 && (
                    <Text style={[styles['sideMenu-section-count'], isBookmarkFilterActive && { color: '#588DFF', backgroundColor: '#E8EEFF' }]}>
                      {bookmarkedItems.length}
                    </Text>
                  )}
                </TouchableOpacity>

                {bookmarkedItems.length === 0 ? (
                  <Text style={styles['sideMenu-empty-text']}>
                    북마크된 항목이 없습니다
                  </Text>
                ) : (
                  bookmarkedItems.map(item => {
                    const isBoard = item.type === 'board';
                    const label = isBoard
                      ? (item as Board).title
                      : (item as Memo).text;
                    const accentColor = isBoard ? '#FF9500' : '#588DFF';
                    const badgeBg = isBoard ? '#FFF0D9' : '#E8EEFF';
                    const badgeColor = isBoard ? '#FF9500' : '#588DFF';
                    const badgeLabel = isBoard ? '보드' : '메모';

                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={styles['sideMenu-bookmark-card']}
                        activeOpacity={0.7}
                        onPress={() => {
                          handleClose();
                          onBookmarkPress(item);
                        }}
                      >
                        <View
                          style={[
                            styles['sideMenu-bookmark-accent'],
                            { backgroundColor: accentColor },
                          ]}
                        />
                        <Text
                          style={styles['sideMenu-bookmark-label']}
                          numberOfLines={1}
                        >
                          {label}
                        </Text>
                        <View
                          style={[
                            styles['sideMenu-bookmark-badge'],
                            { backgroundColor: badgeBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles['sideMenu-bookmark-badgeText'],
                              { color: badgeColor },
                            ]}
                          >
                            {badgeLabel}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <View style={styles['sideMenu-divider']} />

              {/* 사진 */}
              <View style={styles['sideMenu-section']}>
                <View style={styles['sideMenu-section-header']}>
                  <Text style={styles['sideMenu-section-title']}>사진</Text>
                  <Text style={styles['sideMenu-section-size']}>0 GB</Text>
                </View>
                <View style={styles['sideMenu-placeholder-box']}>
                  <Text style={styles['sideMenu-placeholder-text']}>준비 중</Text>
                  <Text style={styles['sideMenu-placeholder-subText']}>
                    사진을 추가하면 이곳에 표시됩니다
                  </Text>
                </View>
              </View>

              <View style={styles['sideMenu-divider']} />

              {/* 동영상 */}
              <View style={styles['sideMenu-section']}>
                <View style={styles['sideMenu-section-header']}>
                  <Text style={styles['sideMenu-section-title']}>동영상</Text>
                  <Text style={styles['sideMenu-section-size']}>0 GB</Text>
                </View>
                <View style={styles['sideMenu-placeholder-box']}>
                  <Text style={styles['sideMenu-placeholder-text']}>준비 중</Text>
                  <Text style={styles['sideMenu-placeholder-subText']}>
                    동영상을 추가하면 이곳에 표시됩니다
                  </Text>
                </View>
              </View>

              <View style={styles['sideMenu-divider']} />

              {/* 파일 */}
              <View style={styles['sideMenu-section']}>
                <View style={styles['sideMenu-section-header']}>
                  <Text style={styles['sideMenu-section-title']}>파일</Text>
                </View>
                <View style={styles['sideMenu-placeholder-box']}>
                  <Text style={styles['sideMenu-placeholder-text']}>준비 중</Text>
                  <Text style={styles['sideMenu-placeholder-subText']}>
                    파일을 추가하면 이곳에 표시됩니다
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SideMenu;