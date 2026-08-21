import React, { useCallback } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { ImageIcon, VideoIcon, FileIcon, CloseIcon } from '../common/Icons';
import { mediaPickerSheetStyles as styles } from '../../styles/MediaPickerSheet.styles';
import { useAlert } from '../../context/AlertContext';

interface MediaPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onPickImages: (uris: string[]) => void;
  onPickVideo: (uri: string) => void;
  onPickFile: (uri: string, name: string) => void;
  isLoading?: boolean;
}

const MediaPickerSheet: React.FC<MediaPickerSheetProps> = ({
  visible,
  onClose,
  onPickImages,
  onPickVideo,
  onPickFile,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();

  const handlePickImages = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 10,
        // 원본을 그대로 올리면 작은 썸네일에서도 매번 큰 원본을 내려받아
        // 로딩이 느려지므로 업로드 전에 리사이즈/압축한다.
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.assets && result.assets.length > 0) {
        const uris = result.assets.map(asset => asset.uri).filter((uri): uri is string => !!uri);
        if (uris.length > 0) {
          onPickImages(uris);
          onClose();
        }
      }
    } catch {
      // console.error('Failed to pick images:', error);
      showAlert({ title: '오류', message: '이미지 선택에 실패했습니다.', type: 'error' });
    }
  }, [onPickImages, onClose, showAlert]);

  const handlePickVideo = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1,
      });

      if (result.assets && result.assets[0]?.uri) {
        const videoUri = result.assets[0].uri;
        const videoName = result.assets[0].fileName || videoUri.split('/').pop();
        onPickVideo(videoUri, videoName);
        onClose();
      }
    } catch {
      // console.error('Failed to pick video:', error);
      showAlert({ title: '오류', message: '동영상 선택에 실패했습니다.', type: 'error' });
    }
  }, [onPickVideo, onClose, showAlert]);

  const handlePickFile = useCallback(async () => {
    try {
      const result = await pick({
        allowMultiple: true,
        type: [types.allFiles],
      });

      if (result && result.length > 0) {
        // 한 개씩 처리 (여러 개는 UI에서 마지막 하나만 사용)
        const file = result[result.length - 1];
        if (file.uri && file.name) {
          onPickFile(file.uri, file.name);
          onClose();
        }
      }
    } catch (err: any) {
      if (isErrorWithCode(err)) {
        if (err.code === errorCodes.OPERATION_CANCELED) {
          // User cancelled the operation
        } else {
          // console.error('파일 선택 오류:', err);
        }
      } else {
        // console.error('파일 선택 오류:', err);
      }
    }
  }, [onPickFile, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles['modal-overlay']}
        activeOpacity={1}
        onPress={onClose}
        disabled={isLoading}>
        <View
          style={[
            styles['modal-sheet'],
            { paddingBottom: Math.max(insets.bottom, 18) },
          ]}
          onStartShouldSetResponder={() => true}>
          {/* 드래그 핸들 */}
          <View style={styles['modal-handle']} />

          {/* 헤더 */}
          <View style={styles['modal-header']}>
            <Text style={styles['modal-title']}>미디어 공유</Text>
            <TouchableOpacity
              style={styles['modal-close-btn']}
              onPress={onClose}
              disabled={isLoading}>
              <CloseIcon color="#1A1A1A" size={20} />
            </TouchableOpacity>
          </View>

          {/* 콘텐츠 */}
          {isLoading ? (
            <View style={{ paddingVertical: 32, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#588DFF" />
              <Text style={{ marginTop: 12, color: '#9DAFC8', fontFamily: 'PretendardVariable' }}>
                업로드 중...
              </Text>
            </View>
          ) : (
            <View style={styles['modal-content']}>
              {/* 이미지 선택 */}
              <TouchableOpacity
                style={styles['picker-item']}
                onPress={handlePickImages}
                activeOpacity={0.7}>
                <View style={styles['picker-item-icon']}>
                  <ImageIcon color="#588DFF" size={20} />
                </View>
                <View style={styles['picker-item-text-container']}>
                  <Text style={styles['picker-item-label']}>이미지</Text>
                  <Text style={styles['picker-item-description']}>최대 10장 선택 가능</Text>
                </View>
              </TouchableOpacity>

              {/* 동영상 선택 */}
              <TouchableOpacity
                style={styles['picker-item']}
                onPress={handlePickVideo}
                activeOpacity={0.7}>
                <View style={styles['picker-item-icon']}>
                  <VideoIcon color="#FF9500" size={20} />
                </View>
                <View style={styles['picker-item-text-container']}>
                  <Text style={styles['picker-item-label']}>동영상</Text>
                  <Text style={styles['picker-item-description']}>1개만 선택 가능</Text>
                </View>
              </TouchableOpacity>

              {/* 파일 선택 */}
              <TouchableOpacity
                style={styles['picker-item']}
                onPress={handlePickFile}
                activeOpacity={0.7}>
                <View style={styles['picker-item-icon']}>
                  <FileIcon color="#588DFF" size={20} />
                </View>
                <View style={styles['picker-item-text-container']}>
                  <Text style={styles['picker-item-label']}>파일</Text>
                  <Text style={styles['picker-item-description']}>문서, PDF 등</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MediaPickerSheet;
