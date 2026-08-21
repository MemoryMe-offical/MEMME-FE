import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Modal,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Text,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon } from './Icons';

interface Props {
  visible: boolean;
  imageUris: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageViewerModal = ({ visible, imageUris, initialIndex = 0, onClose }: Props) => {
  // 창 크기에 따라 실시간으로 다시 계산 (Mac에서는 창 크기를 조절할 수 있음)
  const { width, height } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const iosTopInset = Platform.OS === 'ios' ? insets.top : 0;
  const iosBottomInset = Platform.OS === 'ios' ? insets.bottom : 0;

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
    }
  }, [visible, initialIndex]);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <SafeAreaView
          style={styles.safeArea}
          edges={Platform.OS === 'ios' ? ['bottom'] : []}>
          {/* 헤더 */}
          <View style={[styles.header, { paddingTop: iosTopInset + 12 }]}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              style={[styles.closeButton, { top: iosTopInset + 12 }]}>
              <CloseIcon color="#FFFFFF" size={24} />
            </TouchableOpacity>
            <Text style={styles.pageNumber}>
              {currentIndex + 1} / {imageUris.length}
            </Text>
          </View>

          {/* 이미지 스크롤 */}
          <FlatList
            ref={flatListRef}
            data={imageUris}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.imageContainer,
                  { width, height: height - 60 - iosTopInset - iosBottomInset },
                ]}>
                <Image
                  source={{ uri: item }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            )}
            horizontal
            pagingEnabled
            scrollEnabled={imageUris.length > 1}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    position: 'absolute',
    left: 16,
  },
  pageNumber: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'PretendardVariable',
  },
  imageContainer: {
    // width는 컴포넌트에서 인라인으로 덮어씀 (창 크기에 따라 실시간 계산)
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default ImageViewerModal;
