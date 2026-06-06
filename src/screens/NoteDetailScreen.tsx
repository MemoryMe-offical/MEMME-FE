import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Note, FileAttachment, OgData, MediaAttachment } from '../types';
import {
  ArrowLeftIcon,
  CloseIcon,
  TrashIcon,
  PlusIcon,
  AiIcon,
  FileIcon,
} from '../components/common/Icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { fetchOgData, fetchOgSummary, OgSummaryError } from '../services/ogService';
import { uploadImages, uploadFile, uploadVideo, MAX_UPLOAD_SIZE } from '../services/uploadService';
import OgPreviewCard from '../components/note/OgPreviewCard';
import LoadingImage from '../components/common/LoadingImage';
import * as noteService from '../services/noteService';
import { useAlert } from '../context/AlertContext';
import { showToastNotification } from '../utils/toastHelper';

type Props = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>;

const ImagePreview = ({ imageUrl, onRemove }: { imageUrl: string; onRemove: () => void }) => {
  return (
    <View style={styles['image-wrapper']}>
      <LoadingImage
        source={{ uri: imageUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles['image-remove-btn']}
        onPress={onRemove}
        hitSlop={4}>
        <CloseIcon color="#FFFFFF" size={12} />
      </TouchableOpacity>
    </View>
  );
};

const NoteDetailScreen = ({ route, navigation }: Props) => {
  const { note, boardId, boardTitle, isNew } = route.params;
  const insets = useSafeAreaInsets();
  const { showAlert, showConfirm } = useAlert();

  const [editTitle, setEditTitle] = useState(note?.title ?? '');
  const [editContent, setEditContent] = useState(note?.content ?? '');
  const [editImageUris, setEditImageUris] = useState<string[]>(note?.imageUris ?? []);
  const [editVideos, setEditVideos] = useState<MediaAttachment[]>(note?.videos ?? []);
  const [editUrls, setEditUrls] = useState<string[]>(note?.urls ?? (note?.url ? [note.url] : []));
  const [editOgDatas, setEditOgDatas] = useState<OgData[]>(
    note?.ogDatas ?? (note?.ogData ? [note.ogData] : [])
  );
  const [editFiles, setEditFiles] = useState<FileAttachment[]>(note?.files ?? []);

  const [loadingSummaryIndexes, setLoadingSummaryIndexes] = useState<Set<number>>(new Set());
  const [addedSummaryIndexes, setAddedSummaryIndexes] = useState<Set<number>>(new Set());

  const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [isFetchingOg, setIsFetchingOg] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingOgData, setIsLoadingOgData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contentHeight, setContentHeight] = useState(140);
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  // 저장 버튼으로 인한 goBack()과 일반 뒤로가기를 구분하는 플래그
  const isSavingRef = useRef(false);

  // editContent 변경 시 높이 자동 업데이트
  useEffect(() => {
    const lineCount = editContent.split('\n').length;
    const lineHeight = 26;
    const paddingVertical = 14;
    const newHeight = Math.max(140, lineCount * lineHeight + paddingVertical);
    setContentHeight(newHeight);
  }, [editContent]);

  // AsyncStorage에 요약 저장
  useEffect(() => {
    const saveSummaries = async () => {
      if (!note?.id) return;
      try {
        const summaryMap: Record<string, string> = {};
        editOgDatas.forEach((ogData, index) => {
          if (ogData.summary && editUrls[index]) {
            summaryMap[editUrls[index]] = ogData.summary;
          }
        });
        await AsyncStorage.setItem(`note_summaries_${note.id}`, JSON.stringify(summaryMap));
      } catch (error) {
        console.error('Failed to save summaries:', error);
      }
    };
    saveSummaries();
  }, [editOgDatas, editUrls, note?.id]);

  // 화면 포커스 시 note 데이터 초기화 + 저장된 요약 로드
  useFocusEffect(
    useCallback(() => {
      const loadDataWithSummaries = async () => {
        setEditTitle(route.params.note?.title ?? '');
        setEditContent(route.params.note?.content ?? '');
        setEditImageUris(route.params.note?.imageUris ?? []);
        setEditVideos(route.params.note?.videos ?? []);
        setEditUrls(route.params.note?.urls ?? (route.params.note?.url ? [route.params.note.url] : []));

        let ogDatas = route.params.note?.ogDatas ?? (route.params.note?.ogData ? [route.params.note.ogData] : []);

        // AsyncStorage에서 저장된 요약 로드
        if (route.params.note?.id) {
          try {
            const summaryJson = await AsyncStorage.getItem(`note_summaries_${route.params.note.id}`);
            if (summaryJson) {
              const summaryMap = JSON.parse(summaryJson);
              const urls = route.params.note?.urls ?? (route.params.note?.url ? [route.params.note.url] : []);

              // 각 URL에 해당하는 요약 병합
              ogDatas = ogDatas.map((ogData, index) => {
                const url = urls[index];
                const savedSummary = url ? summaryMap[url] : undefined;
                return savedSummary ? { ...ogData, summary: savedSummary } : ogData;
              });
            }
          } catch (error) {
            console.error('Failed to load summaries:', error);
          }
        }

        setEditOgDatas(ogDatas);
        setEditFiles(route.params.note?.files ?? []);
        setIsLoadingOgData(false);
      };

      loadDataWithSummaries();
    }, [route.params.note])
  );

  // editUrls이 있는데 editOgDatas가 없으면 자동으로 로드
  useEffect(() => {
    const loadOgDataIfNeeded = async () => {
      if (editUrls.length > 0 && editOgDatas.length < editUrls.length && !isLoadingOgData) {
        setIsLoadingOgData(true);
        try {
          const newOgDatas = [...editOgDatas];
          for (let i = editOgDatas.length; i < editUrls.length; i++) {
            const ogData = await fetchOgData(editUrls[i]);
            newOgDatas.push(ogData);
          }
          setEditOgDatas(newOgDatas);
        } catch (error) {
          console.error('Failed to load OG data:', error);
        } finally {
          setIsLoadingOgData(false);
        }
      }
    };
    loadOgDataIfNeeded();
  }, [editUrls]);

  const isDirty = useCallback(() => {
    if (isNew) {
      return (
        editTitle.trim().length > 0 ||
        editContent.trim().length > 0 ||
        editImageUris.length > 0 ||
        editVideos.length > 0 ||
        editUrls.length > 0 ||
        editFiles.length > 0
      );
    }
    return (
      editTitle !== (note?.title ?? '') ||
      editContent !== (note?.content ?? '') ||
      JSON.stringify(editImageUris) !== JSON.stringify(note?.imageUris ?? []) ||
      JSON.stringify(editVideos) !== JSON.stringify(note?.videos ?? []) ||
      JSON.stringify(editUrls) !== JSON.stringify(note?.urls ?? (note?.url ? [note.url] : [])) ||
      JSON.stringify(editFiles) !== JSON.stringify(note?.files ?? [])
    );
  }, [isNew, editTitle, editContent, editImageUris, editVideos, editUrls, editFiles, note]);

  // 뒤로가기 인터셉트 (Android 하드웨어 백 버튼 + iOS 스와이프 공통 처리)
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isDirty() || isSavingRef.current) return;
      e.preventDefault();
      showConfirm({
        title: '나가기',
        message: '저장하지 않은 변경사항이 있습니다. 나가시겠습니까?',
        confirmText: '나가기',
        cancelText: '계속 편집',
        destructive: true,
        onConfirm: () => navigation.dispatch(e.data.action),
      });
    });
    return unsubscribe;
  }, [navigation, isDirty]);

  const handleSave = async () => {
    if (!editTitle.trim()) {
      showAlert({ title: '알림', message: '노트 이름을 입력해주세요.' });
      return;
    }

    setIsSaving(true);
    isSavingRef.current = true;

    try {
      const noteData = {
        title: editTitle.trim(),
        content: editContent.trim() || undefined,
        imageUris: editImageUris.length > 0 ? editImageUris : undefined,
        videos: editVideos.length > 0 ? editVideos : undefined,
        urls: editUrls.length > 0 ? editUrls : undefined,
        files: editFiles.length > 0 ? editFiles : undefined,
        ogDatas: editOgDatas.length > 0 ? editOgDatas : undefined,
      };
      console.log('Saving note with data:', noteData);

      if (isNew) {
        await noteService.createNote(boardId, noteData);
      } else if (note) {
        await noteService.updateNote(boardId, note.id, noteData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save note:', error);
      showAlert({ title: '오류', message: '노트 저장에 실패했습니다.', type: 'error' });
      isSavingRef.current = false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    showConfirm({
      title: '노트 삭제',
      message: '이 노트를 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      destructive: true,
      onConfirm: async () => {
        try {
          setIsSaving(true);
          if (note) {
            await noteService.deleteNote(boardId, note.id);
          }
          navigation.goBack();
        } catch (error) {
          showAlert({ title: '오류', message: '노트 삭제에 실패했습니다.', type: 'error' });
          console.error('Failed to delete note:', error);
        } finally {
          setIsSaving(false);
        }
      },
    });
  };

  const handleAddImage = async () => {
    if (editImageUris.length >= 10) {
      showAlert({ title: '알림', message: '이미지는 최대 10개까지 추가할 수 있습니다.' });
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: Math.max(1, 10 - editImageUris.length),
      });
      if (result.assets && result.assets.length > 0) {
        // 파일 크기 검증
        let totalSize = 0;
        let hasOversized = false;

        for (const asset of result.assets) {
          if (asset.fileSize) {
            totalSize += asset.fileSize;
            if (asset.fileSize > MAX_UPLOAD_SIZE) {
              hasOversized = true;
            }
          }
        }

        if (hasOversized || totalSize > MAX_UPLOAD_SIZE) {
          showAlert({
            title: '용량 초과',
            message: `최대 100MB까지 업로드할 수 있습니다.\n현재 선택 크기: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`,
            type: 'error',
          });
          return;
        }

        const localUris = result.assets.filter(a => !!a.uri).map(a => a.uri!);
        setIsUploading(true);
        try {
          const response = await uploadImages(localUris);
          // presigned URLs를 저장 (화면 렌더링용)
          setEditImageUris(prev => [...prev, ...response.urls]);
        } catch (error) {
          showAlert({ title: '오류', message: '이미지 업로드에 실패했습니다.', type: 'error' });
          console.error('Image upload error:', error);
        } finally {
          setIsUploading(false);
        }
      }
    } catch {
      // 사용자 취소 — 무시
    }
  };

  const handleRemoveImage = (imageKey: string) => {
    setEditImageUris(prev => prev.filter(key => key !== imageKey));
  };

  const handleAddVideo = async () => {
    if (editVideos.length >= 10) {
      showAlert({ title: '알림', message: '동영상은 최대 10개까지 추가할 수 있습니다.' });
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: Math.max(1, 10 - editVideos.length),
      });
      if (result.assets && result.assets.length > 0) {
        // 파일 크기 검증
        let totalSize = 0;
        let hasOversized = false;

        for (const asset of result.assets) {
          if (asset.fileSize) {
            totalSize += asset.fileSize;
            if (asset.fileSize > MAX_UPLOAD_SIZE) {
              hasOversized = true;
            }
          }
        }

        if (hasOversized || totalSize > MAX_UPLOAD_SIZE) {
          showAlert({
            title: '용량 초과',
            message: `최대 100MB까지 업로드할 수 있습니다.\n현재 선택 크기: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`,
            type: 'error',
          });
          return;
        }

        const localUris = result.assets.filter(a => !!a.uri).map(a => a.uri!);
        setIsUploading(true);
        try {
          const uploadPromises = localUris.map(uri => uploadVideo(uri));
          const responses = await Promise.all(uploadPromises);
          const newVideos: MediaAttachment[] = responses.map((r, idx) => ({
            uid: `video-${Date.now()}-${idx}`,
            name: r.name,
            url: r.url,
            key: r.key,
            mimeType: 'video/mp4',
            size: r.size,
            thumbnailUrl: r.thumbnailUrl,
            duration: r.duration,
          }));
          setEditVideos(prev => [...prev, ...newVideos]);
        } catch (error) {
          showAlert({ title: '오류', message: '동영상 업로드에 실패했습니다.', type: 'error' });
          console.error('Video upload error:', error);
        } finally {
          setIsUploading(false);
        }
      }
    } catch {
      // 사용자 취소 — 무시
    }
  };

  const handleRemoveVideo = (videoUid: string) => {
    setEditVideos(prev => prev.filter(video => video.uid !== videoUid));
  };

  const handleOpenLinkModal = () => {
    if (editUrls.length >= 10) {
      showAlert({ title: '알림', message: '링크는 최대 10개까지 추가할 수 있습니다.' });
      return;
    }
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
      showAlert({ title: '알림', message: '올바른 URL을 입력해주세요.' });
      return;
    }

    const normalizedUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
    setIsFetchingOg(true);
    try {
      const ogData = await fetchOgData(normalizedUrl);
      setEditUrls(prev => [...prev, normalizedUrl]);
      setEditOgDatas(prev => [...prev, ogData]);
      setIsLinkModalVisible(false);
      setLinkInput('');
    } catch {
      showAlert({ title: '오류', message: '링크를 가져오는 데 실패했습니다. URL을 확인해주세요.', type: 'error' });
    } finally {
      setIsFetchingOg(false);
    }
  };

  const handleRemoveLink = (index: number) => {
    setEditUrls(prev => prev.filter((_, i) => i !== index));
    setEditOgDatas(prev => prev.filter((_, i) => i !== index));
  };

  const handleRequestSummary = async (index: number) => {
    const url = editUrls[index];
    const ogData = editOgDatas[index];
    if (!url || !ogData) return;
    setLoadingSummaryIndexes(prev => new Set(prev).add(index));
    try {
      const summary = await fetchOgSummary(url);
      setEditOgDatas(prev => {
        const updated = [...prev];
        updated[index] = { ...(updated[index] || {}), summary };
        return updated;
      });
    } catch (error) {
      if (error instanceof OgSummaryError) {
        showAlert({ title: 'AI 요약 실패', message: 'AI 요약을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.', type: 'error' });
      } else {
        showAlert({ title: '오류', message: 'AI 요약 요청 중 문제가 발생했습니다.', type: 'error' });
      }
    } finally {
      setLoadingSummaryIndexes(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleRequestAndAddSummary = async (index: number) => {
    const url = editUrls[index];
    const ogData = editOgDatas[index];
    if (!url || !ogData) return;

    const addToNoteAndShowToast = (summary: string) => {
      const linkTitle = ogData.title || url || '링크';
      const cleanedSummary = summary.split('\n')[0].slice(0, 500);
      const summaryBlock = `🔗 [${linkTitle}](${url})\n\nAI 요약:\n${cleanedSummary}`;

      setEditContent(prev => prev.trim() ? `${prev}\n\n---\n\n${summaryBlock}` : summaryBlock);
      setAddedSummaryIndexes(prev => new Set(prev).add(index));

      showToastNotification({
        message: '요약이 내용에 추가되었습니다',
        onAlert: msg => showAlert({ message: msg }),
      });

      // 3초 후에 버튼으로 복구
      setTimeout(() => {
        setAddedSummaryIndexes(prev => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
      }, 3000);
    };

    // 요약이 이미 있으면 바로 추가
    const existingSummary = editOgDatas[index]?.summary;
    if (existingSummary) {
      addToNoteAndShowToast(existingSummary);
      return;
    }

    // 요약이 없으면 생성 후 추가
    setLoadingSummaryIndexes(prev => new Set(prev).add(index));
    try {
      const summary = await fetchOgSummary(url);

      // ogDatas 업데이트
      setEditOgDatas(prev => {
        const updated = [...prev];
        updated[index] = { ...(updated[index] || {}), summary };
        return updated;
      });

      addToNoteAndShowToast(summary);
    } catch (error) {
      if (error instanceof OgSummaryError) {
        showAlert({ title: 'AI 요약 실패', message: 'AI 요약을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.', type: 'error' });
      } else {
        showAlert({ title: '오류', message: 'AI 요약 요청 중 문제가 발생했습니다.', type: 'error' });
      }
    } finally {
      setLoadingSummaryIndexes(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleAddSummaryToNote = (index: number) => {
    const summary = editOgDatas[index]?.summary;
    const url = editUrls[index];
    const ogData = editOgDatas[index];
    if (!summary || !url) return;

    const linkTitle = ogData?.title || url || '링크';

    // 요약 정리: 첫 번째 문장 또는 500자까지만
    const cleanedSummary = summary.split('\n')[0].slice(0, 500);

    const summaryBlock = `🔗 [${linkTitle}](${url})\n\nAI 요약:\n${cleanedSummary}`;

    // 기존 내용이 있으면 뒤에 이어서 추가
    setEditContent(prev => prev.trim() ? `${prev}\n\n---\n\n${summaryBlock}` : summaryBlock);
    setAddedSummaryIndexes(prev => new Set(prev).add(index));
  };

  const handleAddFile = async () => {
    if (editFiles.length >= 10) {
      showAlert({ title: '알림', message: '파일은 최대 10개까지 추가할 수 있습니다.' });
      return;
    }

    try {
      const results = await pick({
        type: [types.allFiles],
        allowMultiSelection: true,
      });

      // 최대 개수 제한 확인
      if (editFiles.length + results.length > 10) {
        const remainingSlots = 10 - editFiles.length;
        showAlert({ title: '알림', message: `파일은 최대 10개까지 추가할 수 있습니다. (${remainingSlots}개 더 추가 가능)` });
        return;
      }

      // 파일 크기 검증
      let totalSize = 0;
      let hasOversized = false;
      let oversizedFileName = '';

      for (const result of results) {
        if (result.size) {
          totalSize += result.size;
          if (result.size > MAX_UPLOAD_SIZE) {
            hasOversized = true;
            oversizedFileName = result.name || 'Unknown';
          }
        }
      }

      if (hasOversized || totalSize > MAX_UPLOAD_SIZE) {
        Alert.alert(
          '용량 초과',
          hasOversized
            ? `'${oversizedFileName}' 파일이 100MB를 초과합니다.`
            : `최대 100MB까지 업로드할 수 있습니다.\n현재 선택 크기: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`,
        );
        return;
      }

      setIsUploading(true);
      try {
        const uploadPromises = results.map(async r => {
          const uploadResponse = await uploadFile(r.uri);
          return {
            uid: uploadResponse.uid,
            name: uploadResponse.name,
            url: uploadResponse.url,
            key: uploadResponse.key,
            mimeType: uploadResponse.mimeType,
            size: uploadResponse.size,
          };
        });
        const newFiles = await Promise.all(uploadPromises);
        setEditFiles(prev => [...prev, ...newFiles]);
      } catch (error) {
        showAlert({ title: '오류', message: '파일 업로드에 실패했습니다.', type: 'error' });
        console.error('File upload error:', error);
      } finally {
        setIsUploading(false);
      }
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
        // 사용자 취소 — 무시
      } else {
        showAlert({ title: '오류', message: '파일을 가져오는 데 실패했습니다.', type: 'error' });
      }
    }
  };

  const handleRemoveFile = (fileUid: string) => {
    setEditFiles(prev => prev.filter(f => f.uid !== fileUid));
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
            disabled={!editTitle.trim() || isUploading || isSaving}
            activeOpacity={0.6}>
            <Text style={[styles['save-text'], (!editTitle.trim() || isUploading || isSaving) && styles['save-text-disabled']]}>
              {isUploading ? '업로드 중...' : isSaving ? '저장 중...' : '저장'}
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

          {/* 본문 */}
          <Text style={[styles['input-label'], { marginTop: 14 }]}>내용</Text>
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
          <View style={styles['attachments-container']}>
            {/* 이미지 */}
            <View style={styles['subsection-header']}>
              <View>
                <Text style={styles['subsection-label']}>이미지</Text>
                <Text style={styles['subsection-count']}>{editImageUris.length}/10</Text>
              </View>
              <TouchableOpacity
                onPress={handleAddImage}
                disabled={isUploading || editImageUris.length >= 10}
                hitSlop={8}>
                <PlusIcon color={isUploading || editImageUris.length >= 10 ? '#C0CDD8' : '#588DFF'} size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles['images-section']}>
              {editImageUris.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  persistentScrollbar={true}
                  scrollIndicatorInsets={{ bottom: 4 }}
                  contentContainerStyle={styles['images-row']}>
                  <>
                    {editImageUris.map((imageUrl) => (
                      <ImagePreview key={imageUrl} imageUrl={imageUrl} onRemove={() => handleRemoveImage(imageUrl)} />
                    ))}
                  </>
                </ScrollView>
              ) : (
                <Text style={styles['empty-section-text']}>첨부된 이미지가 없습니다</Text>
              )}
            </View>

            {/* 파일 */}
            <View style={styles['subsection-header']}>
              <View>
                <Text style={styles['subsection-label']}>파일</Text>
                <Text style={styles['subsection-count']}>{editFiles.length}/10</Text>
              </View>
              <TouchableOpacity
                onPress={handleAddFile}
                disabled={isUploading || editFiles.length >= 10}
                hitSlop={8}>
                <PlusIcon color={isUploading || editFiles.length >= 10 ? '#C0CDD8' : '#588DFF'} size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles['files-section']}>
              {editFiles.length > 0 ? (
                <>
                  {editFiles.map(file => (
                    <View key={file.uid} style={styles['file-row']}>
                      <View style={styles['file-icon-container']}>
                        <FileIcon color="#588DFF" size={20} />
                      </View>
                      <Text style={styles['file-name']} numberOfLines={1}>{decodeURIComponent(decodeURIComponent(file.name))}</Text>
                      <TouchableOpacity onPress={() => handleRemoveFile(file.uid)} hitSlop={8}>
                        <CloseIcon color="#9DAFC8" size={16} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              ) : (
                <Text style={styles['empty-section-text']}>첨부된 파일이 없습니다</Text>
              )}
            </View>

            {/* 동영상 */}
            <View style={styles['subsection-header']}>
              <View>
                <Text style={styles['subsection-label']}>동영상</Text>
                <Text style={styles['subsection-count']}>{editVideos.length}/10</Text>
              </View>
              <TouchableOpacity
                onPress={handleAddVideo}
                disabled={isUploading || editVideos.length >= 10}
                hitSlop={8}>
                <PlusIcon color={isUploading || editVideos.length >= 10 ? '#C0CDD8' : '#588DFF'} size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles['videos-section']}>
              {editVideos.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  persistentScrollbar={true}
                  scrollIndicatorInsets={{ bottom: 4 }}
                  contentContainerStyle={styles['videos-row']}>
                  <>
                    {editVideos.map((video) => (
                      <Pressable
                        key={video.uid}
                        onPress={() => {
                          setSelectedVideoUrl(video.url);
                          setVideoViewerVisible(true);
                        }}
                        style={({ pressed }) => [
                          styles['video-wrapper'],
                          pressed && styles['video-wrapper-pressed'],
                        ]}>
                        {video.thumbnailUrl ? (
                          <LoadingImage
                            source={{ uri: video.thumbnailUrl }}
                            style={styles['video-thumbnail']}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles['video-thumbnail']}>
                            <Text style={styles['video-icon']}>🎬</Text>
                          </View>
                        )}
                        {video.duration && (
                          <Text style={styles['video-duration']}>
                            {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                          </Text>
                        )}
                        <TouchableOpacity
                          style={styles['video-remove-btn']}
                          onPress={() => handleRemoveVideo(video.uid)}
                          hitSlop={4}>
                          <CloseIcon color="#FFFFFF" size={12} />
                        </TouchableOpacity>
                      </Pressable>
                    ))}
                  </>
                </ScrollView>
              ) : (
                <Text style={styles['empty-section-text']}>첨부된 동영상이 없습니다</Text>
              )}
            </View>

            {/* 링크 */}
            <View style={styles['subsection-header']}>
              <View>
                <Text style={styles['subsection-label']}>링크</Text>
                <Text style={styles['subsection-count']}>{editUrls.length}/10</Text>
              </View>
              <TouchableOpacity
                onPress={handleOpenLinkModal}
                disabled={editUrls.length >= 10}
                hitSlop={8}>
                <PlusIcon color={editUrls.length >= 10 ? '#C0CDD8' : '#588DFF'} size={20} />
              </TouchableOpacity>
            </View>
            <View style={styles['link-section']}>
              {editUrls.length > 0 ? (
                <>
                  {editUrls.map((url, index) => (
                    <View key={index} style={styles['link-item-wrapper']}>
                      <OgPreviewCard
                        url={url}
                        ogData={editOgDatas[index] || { title: url }}
                        onRemove={() => handleRemoveLink(index)}
                        containerStyle={styles['note-edit-og-card']}
                        isEditMode={true}
                      />
                      {loadingSummaryIndexes.has(index) ? (
                        <ActivityIndicator size={10} color="#588DFF" style={{ alignSelf: 'center', marginTop: 8 }} />
                      ) : addedSummaryIndexes.has(index) ? (
                        <Text style={[styles['summary-added-text'], { alignSelf: 'center' }]}>✓ 추가됨</Text>
                      ) : editOgDatas[index] ? (
                        <TouchableOpacity
                          style={styles['summary-button']}
                          onPress={() => handleRequestAndAddSummary(index)}
                          activeOpacity={0.7}>
                          <AiIcon color="#588DFF" size={12} />
                          <Text style={styles['summary-button-text']}>내용에 AI 요약 추가</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ))}
                </>
              ) : (
                <Text style={styles['empty-section-text']}>첨부된 링크가 없습니다</Text>
              )}
            </View>
          </View>

          <View style={{ height: 0 }} />
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

      {/* 동영상 뷰어 모달 */}
      <Modal
        visible={videoViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVideoViewerVisible(false)}>
        <View style={styles['video-viewer-container']}>
          <TouchableOpacity
            style={styles['video-viewer-close']}
            onPress={() => setVideoViewerVisible(false)}>
            <Text style={styles['video-viewer-close-text']}>✕</Text>
          </TouchableOpacity>
          {selectedVideoUrl && (
            <TouchableOpacity
              style={styles['video-player-container']}
              onPress={() => {
                Linking.openURL(selectedVideoUrl).catch(() => {
                  console.error('Failed to open video:', selectedVideoUrl);
                });
              }}>
              <Text style={styles['video-play-icon']}>▶</Text>
              <Text style={styles['video-open-text']}>눌러서 재생</Text>
            </TouchableOpacity>
          )}
        </View>
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
  'body-content': { padding: 20 },
  'title-input': {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    lineHeight: 28,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4ECFF',
  },
  divider: { height: 1, backgroundColor: '#D5DFED', marginVertical: 16 },
  'content-input': {
    fontSize: 11,
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
  'section-divider': {
    height: 1.2,
    backgroundColor: '#D5DFED',
    marginTop: 20,
    marginBottom: 10
  },
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
    gap: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  'subsection-header': {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  'subsection-label': {
    fontSize: 12,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.2,
  },
  'subsection-count': {
    fontSize: 11,
    fontWeight: '500',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    marginTop: 2,
  },
  'input-label': {
    fontSize: 12,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.2,
    marginBottom: 10,
  },
  'images-section': { paddingVertical: 12, marginBottom: 0 },
  'empty-section-text': {
    fontSize: 13,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
    paddingVertical: 12,
  },
  'images-row': {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingBottom: 12,
  },
  'image-wrapper': { position: 'relative' },
  thumbnail: {
    width: 64,
    height: 64,
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
    width: 64,
    height: 64,
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
  'videos-section': { paddingVertical: 12, marginBottom: 0 },
  'videos-row': {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingBottom: 12,
  },
  'video-wrapper': { position: 'relative' },
  'video-wrapper-pressed': {
    opacity: 0.7,
  },
  'video-thumbnail': {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#E8EEF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  'video-icon': {
    fontSize: 28,
  },
  'video-duration': {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'PretendardVariable',
  },
  'video-remove-btn': {
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
  'link-section': { gap: 10, paddingVertical: 12, marginBottom: 0 },
  'link-item-wrapper': { marginBottom: 6, flexDirection: 'column', gap: 8 },
  'note-edit-og-card': { width: '100%', height: 68 },
  'summary-button': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
  },
  'summary-button-text': {
    fontSize: 11,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },
  'summary-added-text': {
    fontSize: 11,
    color: '#AABBCC',
    fontFamily: 'PretendardVariable',
  },
  'files-section': { gap: 10, paddingVertical: 12, marginBottom: 0 },
  'file-row': {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    gap: 10,
  },
  'file-icon-container': {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  'file-name': {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
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
  'video-viewer-container': {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  'video-viewer-close': {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  'video-viewer-close-text': {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  'video-player-container': {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  'video-play-icon': {
    fontSize: 48,
    color: '#FFFFFF',
  },
  'video-open-text': {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },
});

export default NoteDetailScreen;
