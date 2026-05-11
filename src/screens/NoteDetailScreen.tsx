import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  Platform,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Note, FileAttachment, OgData } from '../types';
import {
  ArrowLeftIcon,
  CloseIcon,
  TrashIcon,
  PlusIcon,
} from '../components/common/Icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { fetchOgData } from '../services/ogService';
import { uploadImages, uploadFile } from '../services/uploadService';
import OgPreviewCard from '../components/note/OgPreviewCard';

type Props = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>;

const NoteDetailScreen = ({ route, navigation }: Props) => {
  const { note, boardTitle, isNew, onSave, onDelete } = route.params;
  const insets = useSafeAreaInsets();

  const [editTitle, setEditTitle] = useState(note?.title ?? '');
  const [editContent, setEditContent] = useState(note?.content ?? '');
  const [editImageUris, setEditImageUris] = useState<string[]>(note?.imageUris ?? []);
  const [editUrl, setEditUrl] = useState<string | undefined>(note?.url);
  const [editOgData, setEditOgData] = useState<OgData | undefined>(note?.ogData);
  const [editFiles, setEditFiles] = useState<FileAttachment[]>(note?.files ?? []);

  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [isFetchingOg, setIsFetchingOg] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingOgData, setIsLoadingOgData] = useState(false);
  const [contentHeight, setContentHeight] = useState(140);

  // 저장 버튼으로 인한 goBack()과 일반 뒤로가기를 구분하는 플래그
  const isSavingRef = useRef(false);

  // 화면 포커스 시 note 데이터 초기화
  useFocusEffect(
    useCallback(() => {
      setEditTitle(route.params.note?.title ?? '');
      setEditContent(route.params.note?.content ?? '');
      setEditImageUris(route.params.note?.imageUris ?? []);
      setEditUrl(route.params.note?.url);
      setEditOgData(route.params.note?.ogData);
      setEditFiles(route.params.note?.files ?? []);
      setIsLoadingOgData(false);
    }, [route.params.note])
  );

  // editUrl이 있는데 editOgData가 없으면 자동으로 로드
  useEffect(() => {
    const loadOgDataIfNeeded = async () => {
      if (editUrl && !editOgData && !isLoadingOgData) {
        setIsLoadingOgData(true);
        try {
          const ogData = await fetchOgData(editUrl);
          setEditOgData(ogData);
        } catch (error) {
          console.error('Failed to load OG data:', error);
        } finally {
          setIsLoadingOgData(false);
        }
      }
    };
    loadOgDataIfNeeded();
  }, [editUrl]);

  const isDirty = useCallback(() => {
    if (isNew) {
      return (
        editTitle.trim().length > 0 ||
        editContent.trim().length > 0 ||
        editImageUris.length > 0 ||
        !!editUrl ||
        editFiles.length > 0
      );
    }
    return (
      editTitle !== (note?.title ?? '') ||
      editContent !== (note?.content ?? '') ||
      JSON.stringify(editImageUris) !== JSON.stringify(note?.imageUris ?? []) ||
      editUrl !== note?.url ||
      JSON.stringify(editFiles) !== JSON.stringify(note?.files ?? [])
    );
  }, [isNew, editTitle, editContent, editImageUris, editUrl, editFiles, note]);

  // 뒤로가기 인터셉트 (Android 하드웨어 백 버튼 + iOS 스와이프 공통 처리)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isDirty() || isSavingRef.current) return;
      e.preventDefault();
      Alert.alert(
        '나가기',
        '저장하지 않은 변경사항이 있습니다. 나가시겠습니까?',
        [
          { text: '계속 편집', style: 'cancel' },
          {
            text: '나가기',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    });
    return unsubscribe;
  }, [navigation, isDirty]);

  const handleSave = () => {
    if (!editTitle.trim()) {
      Alert.alert('알림', '노트 이름을 입력해주세요.');
      return;
    }
    const noteToSave: Note = {
      id: note?.id ?? `note_${Date.now()}`,
      title: editTitle.trim(),
      content: editContent.trim() || undefined,
      imageUris: editImageUris.length > 0 ? editImageUris : undefined,
      url: editUrl,
      ogData: editOgData,
      files: editFiles.length > 0 ? editFiles : undefined,
    };
    onSave?.(noteToSave);
    isSavingRef.current = true;
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert('노트 삭제', '이 노트를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          onDelete?.(note!.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleAddImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: Math.max(1, 10 - editImageUris.length),
      });
      if (result.assets && result.assets.length > 0) {
        const localUris = result.assets.filter(a => !!a.uri).map(a => a.uri!);
        setIsUploading(true);
        try {
          const response = await uploadImages(localUris);
          setEditImageUris(prev => [...prev, ...response.urls]);
        } catch (error) {
          Alert.alert('오류', '이미지 업로드에 실패했습니다.');
          console.error('Image upload error:', error);
        } finally {
          setIsUploading(false);
        }
      }
    } catch {
      // 사용자 취소 — 무시
    }
  };

  const handleRemoveImage = (idx: number) => {
    setEditImageUris(prev => prev.filter((_, i) => i !== idx));
  };

  const handleOpenLinkModal = () => {
    setLinkInput('');
    setIsLinkModalVisible(true);
  };

  const handleFetchLink = async () => {
    const trimmedUrl = linkInput.trim();
    if (!trimmedUrl) return;

    // 기본 URL 형식 검증
    try {
      new URL(trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`);
    } catch {
      Alert.alert('알림', '올바른 URL을 입력해주세요.');
      return;
    }

    const normalizedUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
    setIsFetchingOg(true);
    try {
      const ogData = await fetchOgData(normalizedUrl);
      setEditUrl(normalizedUrl);
      setEditOgData(ogData);
      setIsLinkModalVisible(false);
      setLinkInput('');
    } catch {
      Alert.alert('오류', '링크를 가져오는 데 실패했습니다. URL을 확인해주세요.');
    } finally {
      setIsFetchingOg(false);
    }
  };

  const handleRemoveLink = () => {
    setEditUrl(undefined);
    setEditOgData(undefined);
  };

  const handleAddFile = async () => {
    try {
      const results = await pick({
        type: [types.allFiles],
        allowMultiSelection: true,
      });
      setIsUploading(true);
      try {
        const uploadPromises = results.map(async r => {
          const uploadResponse = await uploadFile(r.uri);
          return {
            id: `file_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            name: r.name ?? 'unknown',
            url: uploadResponse.url,
            mimeType: r.type ?? 'application/octet-stream',
            size: uploadResponse.size ?? r.size ?? 0,
          };
        });
        const newFiles = await Promise.all(uploadPromises);
        setEditFiles(prev => [...prev, ...newFiles]);
      } catch (error) {
        Alert.alert('오류', '파일 업로드에 실패했습니다.');
        console.error('File upload error:', error);
      } finally {
        setIsUploading(false);
      }
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
        // 사용자 취소 — 무시
      } else {
        Alert.alert('오류', '파일을 가져오는 데 실패했습니다.');
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setEditFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const canDelete = !isNew && !!note;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* iOS 상단 Safe Area 배경 */}
      <View style={[styles['header-safe-top'], { height: insets.top }]} />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles['header-side-btn']}>
          <ArrowLeftIcon color="#1A1A1A" size={22} />
        </TouchableOpacity>
        <Text style={styles['header-title']} numberOfLines={1}>
          {boardTitle ?? '노트'}
        </Text>
        <View style={styles['header-right']}>
          {canDelete && (
            <TouchableOpacity onPress={handleDelete} hitSlop={8}>
              <TrashIcon color="#FF3B30" size={18} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSave}
            hitSlop={8}
            disabled={!editTitle.trim() || isUploading}
            activeOpacity={0.6}>
            <Text style={[styles['save-text'], (!editTitle.trim() || isUploading) && styles['save-text-disabled']]}>
              {isUploading ? '업로드 중...' : '저장'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 50}>
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles['body-content']}
          keyboardShouldPersistTaps="handled">

          {/* 노트 제목 */}
          <Text style={styles['input-label']}>제목</Text>
          <TextInput
            style={styles['title-input']}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="노트 제목"
            placeholderTextColor="#AABBCC"
            maxLength={200}
            returnKeyType="next"
          />
          <View style={styles.divider} />

          {/* 본문 */}
          <Text style={styles['input-label']}>내용</Text>
          <TextInput
            style={[styles['content-input'], { height: contentHeight }]}
            value={editContent}
            onChangeText={setEditContent}
            onContentSizeChange={(e) => {
              const newHeight = Math.max(140, e.nativeEvent.contentSize.height);
              setContentHeight(newHeight);
            }}
            placeholder="내용을 입력하세요..."
            placeholderTextColor="#AABBCC"
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />

          {/* 첨부 섹션 */}
          <View style={styles['section-divider']} />

          <View style={styles['attachments-container']}>
            {/* 이미지 */}
            <View style={styles['subsection-header']}>
            <Text style={styles['subsection-label']}>이미지</Text>
            <TouchableOpacity
              onPress={handleAddImage}
              disabled={isUploading}
              hitSlop={8}>
              <PlusIcon color={isUploading ? '#C0CDD8' : '#588DFF'} size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles['images-section']}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles['images-row']}>
              {editImageUris.map((uri, idx) => (
                <View key={`${idx}`} style={styles['image-wrapper']}>
                  <Image source={{ uri }} style={styles.thumbnail} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles['image-remove-btn']}
                    onPress={() => handleRemoveImage(idx)}
                    hitSlop={4}>
                    <CloseIcon color="#FFFFFF" size={12} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 파일 */}
          <View style={styles['subsection-header']}>
            <Text style={styles['subsection-label']}>파일</Text>
            <TouchableOpacity
              onPress={handleAddFile}
              disabled={isUploading}
              hitSlop={8}>
              <PlusIcon color={isUploading ? '#C0CDD8' : '#588DFF'} size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles['files-section']}>
            {editFiles.map(file => (
              <View key={file.id} style={styles['file-row']}>
                <Text style={styles['file-icon']}>📄</Text>
                <Text style={styles['file-name']} numberOfLines={1}>{file.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveFile(file.id)} hitSlop={8}>
                  <CloseIcon color="#9DAFC8" size={16} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* 링크 */}
          <View style={styles['subsection-header']}>
            <Text style={styles['subsection-label']}>링크</Text>
            {!editUrl && (
              <TouchableOpacity
                onPress={handleOpenLinkModal}
                hitSlop={8}>
                <PlusIcon color="#588DFF" size={20} />
              </TouchableOpacity>
            )}
          </View>
            <View style={styles['link-section']}>
              {editUrl && (
                <OgPreviewCard
                  url={editUrl}
                  ogData={editOgData || { title: editUrl }}
                  onRemove={handleRemoveLink}
                />
              )}
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 링크 추가 바텀시트 모달 */}
      <Modal
        visible={isLinkModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isFetchingOg) setIsLinkModalVisible(false);
        }}>
        <TouchableOpacity
          style={styles['modal-overlay']}
          activeOpacity={1}
          onPress={() => {
            if (!isFetchingOg) setIsLinkModalVisible(false);
          }}>
          {/* 내부 터치 전파 차단 */}
          <View
            style={[styles['modal-sheet'], { paddingBottom: insets.bottom + 16 }]}
            onStartShouldSetResponder={() => true}>
            <View style={styles['modal-handle']} />
            <Text style={styles['modal-title']}>링크 추가</Text>
            <TextInput
              style={styles['modal-input']}
              value={linkInput}
              onChangeText={setLinkInput}
              placeholder="https://example.com"
              placeholderTextColor="#AABBCC"
              autoCapitalize="none"
              keyboardType="url"
              returnKeyType="done"
              onSubmitEditing={handleFetchLink}
              autoFocus
              editable={!isFetchingOg}
            />
            <TouchableOpacity
              style={[
                styles['modal-confirm-btn'],
                (!linkInput.trim() || isFetchingOg) && styles['modal-confirm-btn-disabled'],
              ]}
              onPress={handleFetchLink}
              disabled={!linkInput.trim() || isFetchingOg}
              activeOpacity={0.8}>
              {isFetchingOg
                ? <ActivityIndicator color="#FFFFFF" size="small" />
                : <Text style={styles['modal-confirm-btn-text']}>추가</Text>
              }
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },
  flex1: { flex: 1 },
  'header-safe-top': { backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF8',
    gap: 12,
  },
  'header-side-btn': { minWidth: 32 },
  'header-title': {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
  },
  'header-right': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 32,
    justifyContent: 'flex-end',
  },
  'save-text': {
    fontSize: 15,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'save-text-disabled': { color: '#C0CDD8' },
  body: { flex: 1 },
  'body-content': { padding: 20, paddingBottom: 40 },
  'title-input': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 28,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4ECFF',
  },
  divider: { height: 1, backgroundColor: '#D5DFED', marginVertical: 16 },
  'content-input': {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 26,
    paddingVertical: 14,
    paddingHorizontal: 16,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4ECFF',
  },
  'section-divider': { height: 1.2, backgroundColor: '#D5DFED', marginTop: 20, marginBottom: 16 },
  'section-label': {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  'attachments-container': {
    backgroundColor: '#F7FAFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  'subsection-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  'subsection-label': {
    fontSize: 14,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.2,
  },
  'input-label': {
    fontSize: 14,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  'images-section': { marginBottom: 16 },
  'images-row': {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  'image-wrapper': { position: 'relative' },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
  'image-remove-btn': {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  'add-image-btn': {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C0D0F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F0F5FF',
  },
  'add-btn-text': {
    fontSize: 11,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'add-image-btn-disabled': {
    opacity: 0.6,
  },
  'link-section': { marginBottom: 16 },
  'files-section': { gap: 10, marginBottom: 16 },
  'file-row': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    gap: 10,
  },
  'file-icon': { fontSize: 18 },
  'file-name': {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
  },
  'add-attach-btn': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F5FF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C0D0F0',
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
  },
  'add-attach-btn-text': {
    fontSize: 14,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },
  'add-attach-btn-disabled': {
    opacity: 0.6,
  },
  'modal-overlay': {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  'modal-sheet': {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 20,
    gap: 18,
  },
  'modal-handle': {
    width: 40,
    height: 5,
    backgroundColor: '#E0E8F8',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 8,
  },
  'modal-title': {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 26,
  },
  'modal-input': {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
    borderWidth: 1,
    borderColor: '#E4ECFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#FAFCFF',
  },
  'modal-confirm-btn': {
    backgroundColor: '#588DFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  'modal-confirm-btn-disabled': { backgroundColor: '#C0CDD8' },
  'modal-confirm-btn-text': {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
    lineHeight: 24,
  },
});

export default NoteDetailScreen;
