import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BoardPost, OgData, SubPostItem } from '../types/chatBoard.type';
import {
  ArrowLeftIcon,
  EditIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusCircleIcon,
  ImageIcon,
} from '../components/common/Icons';
import { launchImageLibrary } from 'react-native-image-picker';

type Props = NativeStackScreenProps<RootStackParamList, 'BoardPostDetail'>;

// ── HTML 엔티티 디코딩 ──
const decodeHtmlEntities = (str: string): string =>
  str
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

// ── OG fetch ──
const fetchOgData = async (url: string): Promise<OgData> => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const getMeta = (prop: string) => {
      const m =
        html.match(new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${prop}["']`, 'i'));
      return m?.[1] ? decodeHtmlEntities(m[1]) : '';
    };
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return {
      title: getMeta('title') || (titleMatch?.[1] ? decodeHtmlEntities(titleMatch[1]) : url),
      description: getMeta('description'),
      imageUrl: getMeta('image'),
      siteName: getMeta('site_name'),
    };
  } catch {
    return { title: url };
  }
};

const formatFullTime = (iso: string) => {
  const d = new Date(iso);
  const h = d.getHours();
  const isAM = h < 12;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${isAM ? '오전' : '오후'} ${(h % 12) || 12}:${d.getMinutes().toString().padStart(2, '0')}`;
};

// ── 링크 열기 ──
const normalizeUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

const openUrl = async (url: string) => {
  try {
    await Linking.openURL(normalizeUrl(url));
  } catch {
    Alert.alert('오류', '링크를 여는 중 문제가 발생했습니다.');
  }
};

const openLinkWithConfirm = (url: string) => {
  Alert.alert(
    '링크 열기',
    '링크가 열립니다. 이동하시겠습니까?',
    [
      { text: '취소', style: 'cancel' },
      { text: '이동', onPress: () => openUrl(url) },
    ],
  );
};

// ── OG 카드 (공유 컴포넌트) ──
const OgPreviewCard = ({ url, ogData, onPress }: { url: string; ogData?: OgData; onPress?: () => void }) => (
  <TouchableOpacity
    style={styles.ogCard}
    onPress={onPress ?? (() => openLinkWithConfirm(url))}
    activeOpacity={0.85}>
    {ogData?.imageUrl
      ? <Image source={{ uri: ogData.imageUrl }} style={styles.ogImage} resizeMode="cover" />
      : null}
    <View style={styles.ogBody}>
      {ogData?.siteName ? <Text style={styles.ogSitename}>{ogData.siteName}</Text> : null}
      <Text style={styles.ogTitle} numberOfLines={2}>{ogData?.title || url}</Text>
      {ogData?.description ? <Text style={styles.ogDesc} numberOfLines={2}>{ogData.description}</Text> : null}
      <Text style={styles.ogUrl} numberOfLines={1}>{url}</Text>
    </View>
  </TouchableOpacity>
);

// ── OG 카드 + 바로가기 버튼 (뷰 모드) ──
const LinkCard = ({ url, ogData }: { url: string; ogData?: OgData }) => (
  <View style={styles.linkCard}>
    {ogData?.imageUrl && (
      <Image source={{ uri: ogData.imageUrl }} style={styles.linkCardImage} resizeMode="cover" />
    )}
    <View style={styles.linkCardBody}>
      <View style={styles.linkCardText}>
        {ogData?.siteName ? <Text style={styles.linkCardSitename}>{ogData.siteName}</Text> : null}
        <Text style={styles.linkCardTitle} numberOfLines={2}>{ogData?.title || url}</Text>
        {ogData?.description ? (
          <Text style={styles.linkCardDesc} numberOfLines={2}>{ogData.description}</Text>
        ) : null}
        <Text style={styles.linkCardUrl} numberOfLines={1}>{url}</Text>
      </View>
      <TouchableOpacity
        style={styles.linkCardGoto}
        onPress={() => openLinkWithConfirm(url)}
        activeOpacity={0.8}>
        <Text style={styles.linkCardGotoText}>바로가기</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── 서브아이템 링크 편집 (인라인) ──
const SubItemLinkEditor = ({
  inputValue,
  savedUrl,
  ogData,
  ogLoading,
  onChangeInput,
  onFetch,
  onClear,
}: {
  inputValue: string;
  savedUrl?: string;
  ogData?: OgData;
  ogLoading: boolean;
  onChangeInput: (v: string) => void;
  onFetch: () => void;
  onClear: () => void;
}) => (
  <View style={styles.subLinkSection}>
    {/* 링크 입력 필드 */}
    <View style={styles.linkInputRow}>
      <TextInput
        style={styles.linkInput}
        value={inputValue}
        onChangeText={onChangeInput}
        placeholder={savedUrl ? '새 링크로 대체하기' : '링크 URL'}
        placeholderTextColor="#AABBCC"
        autoCapitalize="none"
        keyboardType="url"
      />
      <TouchableOpacity
        style={[styles.linkFetchBtn, (!inputValue.trim() || ogLoading) && styles.linkFetchBtnDisabled]}
        onPress={onFetch}
        disabled={ogLoading || !inputValue.trim()}>
        {ogLoading
          ? <ActivityIndicator size="small" color="#FFFFFF" />
          : <Text style={styles.linkFetchText}>확인</Text>}
      </TouchableOpacity>
    </View>

    {/* 저장된 링크 미리보기 */}
    {savedUrl ? (
      <View style={styles.savedLinkRow}>
        <OgPreviewCard url={savedUrl} ogData={ogData} />
        <TouchableOpacity style={styles.linkClearBtn} onPress={onClear}>
          <CloseIcon color="#FF3B30" size={12} />
          <Text style={styles.linkClearText}>링크 삭제</Text>
        </TouchableOpacity>
      </View>
    ) : null}
  </View>
);

// ── 이미지 편집 행 (인라인) ──
const ImageEditRow = ({
  uris,
  onAdd,
  onRemove,
}: {
  uris: string[];
  onAdd: (newUris: string[]) => void;
  onRemove: (uri: string) => void;
}) => {
  const pick = () => {
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 10 }, res => {
      if (res.assets) {
        const picked = res.assets.map(a => a.uri).filter((u): u is string => !!u);
        onAdd(picked);
      }
    });
  };
  return (
    <View style={styles.imageRow}>
      {uris.map(uri => (
        <View key={uri} style={styles.imageThumbWrap}>
          <Image source={{ uri }} style={styles.imageThumb} />
          <TouchableOpacity style={styles.imageDeleteOverlay} onPress={() => onRemove(uri)} hitSlop={4}>
            <CloseIcon color="#FFFFFF" size={12} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.imageAddBtn} onPress={pick}>
        <ImageIcon color="#9DAFC8" size={24} />
      </TouchableOpacity>
    </View>
  );
};

// ──────────────────────────────────────────
// 메인 스크린
// ──────────────────────────────────────────
const BoardPostDetailScreen = ({ route, navigation }: Props) => {
  const { post: initialPost, subItemId, onSave, startEditing } = route.params;
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState<BoardPost>(initialPost);
  const [isEditing, setIsEditing] = useState(startEditing ?? false);

  // 편집 임시 상태
  const [editTitle, setEditTitle] = useState(initialPost.title);
  const [editContent, setEditContent] = useState(initialPost.content);
  const [editSubItems, setEditSubItems] = useState<SubPostItem[]>(initialPost.subItems ?? []);
  // editUrl: 확정된 링크 URL (OG 미리보기 표시용)
  const [editUrl, setEditUrl] = useState(initialPost.url ?? '');
  const [editOgData, setEditOgData] = useState<OgData | undefined>(initialPost.ogData);
  // editLinkInput: 링크 입력 필드 (확인 후 초기화)
  const [editLinkInput, setEditLinkInput] = useState('');
  const [editImageUris, setEditImageUris] = useState<string[]>(initialPost.imageUris ?? []);
  const [ogLoading, setOgLoading] = useState(false);

  // 서브아이템별 OG 로딩 상태
  const [subOgLoading, setSubOgLoading] = useState<Record<string, boolean>>({});
  // 서브아이템별 링크 입력 필드
  const [subLinkInputs, setSubLinkInputs] = useState<Record<string, string>>({});

  // 현재 편집 중인 서브아이템 ID
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // 뷰 모드 아코디언
  const [expandedSubId, setExpandedSubId] = useState<string | null>(
    subItemId ?? (initialPost.subItems?.[0]?.id ?? null),
  );

  const enterEdit = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    const subs = post.subItems ?? [];
    setEditSubItems(subs);
    setEditUrl(post.url ?? '');
    setEditOgData(post.ogData);
    setEditLinkInput('');
    setSubLinkInputs({});
    setEditImageUris(post.imageUris ?? []);
    setEditingSubId(subs.length > 0 ? subs[0].id : null);
    setIsEditing(true);
  };

  // 변경 여부 판단
  const isDirty = () => {
    if (editTitle.trim() !== post.title) return true;
    if (editContent.trim() !== (post.content ?? '')) return true;
    if (editUrl !== (post.url ?? '')) return true;
    if (editImageUris.length !== (post.imageUris ?? []).length) return true;
    if (editSubItems.length !== (post.subItems ?? []).length) return true;
    return editSubItems.some((s, i) => {
      const orig = post.subItems?.[i];
      return !orig || s.title !== orig.title || s.content !== orig.content ||
        s.url !== orig.url || (s.imageUris?.length ?? 0) !== (orig.imageUris?.length ?? 0);
    });
  };

  const cancelEdit = () => {
    if (isDirty()) {
      Alert.alert(
        '편집 취소',
        '수정사항이 사라집니다. 나가시겠습니까?',
        [
          { text: '계속 편집', style: 'cancel' },
          { text: '나가기', style: 'destructive', onPress: () => setIsEditing(false) },
        ],
      );
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    if (!editTitle.trim()) return;
    const updated: BoardPost = {
      ...post,
      title: editTitle.trim(),
      content: editContent.trim(),
      subItems: editSubItems.length > 0 ? editSubItems : undefined,
      url: editUrl.trim() || undefined,
      ogData: editUrl.trim() ? editOgData : undefined,
      imageUris: editImageUris.length > 0 ? editImageUris : undefined,
      updatedAt: new Date().toISOString(),
    };
    setPost(updated);
    setIsEditing(false);
    onSave?.(updated);
  };

  // ── 게시물 링크 OG ──
  const handleFetchPostOg = () => {
    const input = editLinkInput.trim();
    if (!input) return;
    const doFetch = async () => {
      setOgLoading(true);
      const og = await fetchOgData(input);
      setEditUrl(input);
      setEditOgData(og);
      setEditLinkInput('');
      setOgLoading(false);
    };
    if (editUrl) {
      Alert.alert(
        '링크 대체',
        '기존 링크가 대체됩니다. 계속하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '확인', onPress: doFetch },
        ],
      );
    } else {
      doFetch();
    }
  };

  // ── 서브아이템 핸들러 ──
  const addSubItem = () => {
    const newId = Date.now().toString();
    setEditSubItems(prev => [...prev, { id: newId, title: '', content: '' }]);
    setSubLinkInputs(prev => ({ ...prev, [newId]: '' }));
    setEditingSubId(newId);
  };

  const updateSubItem = (id: string, patch: Partial<SubPostItem>) => {
    setEditSubItems(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const deleteSubItem = (id: string) => {
    const target = editSubItems.find(s => s.id === id);
    Alert.alert(
      '항목 삭제',
      `'${target?.title || '이 항목'}'을(를) 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setEditSubItems(prev => prev.filter(s => s.id !== id));
            setSubLinkInputs(prev => { const n = { ...prev }; delete n[id]; return n; });
            if (editingSubId === id) setEditingSubId(null);
          },
        },
      ],
    );
  };

  const fetchSubOg = (id: string) => {
    const input = (subLinkInputs[id] ?? '').trim();
    if (!input) return;
    const sub = editSubItems.find(s => s.id === id);
    const doFetch = async () => {
      setSubOgLoading(prev => ({ ...prev, [id]: true }));
      const og = await fetchOgData(input);
      updateSubItem(id, { url: input, ogData: og });
      setSubLinkInputs(prev => ({ ...prev, [id]: '' }));
      setSubOgLoading(prev => ({ ...prev, [id]: false }));
    };
    if (sub?.url) {
      Alert.alert(
        '링크 대체',
        '기존 링크가 대체됩니다. 계속하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { text: '확인', onPress: doFetch },
        ],
      );
    } else {
      doFetch();
    }
  };

  // ── 빈 게시물 판별 ──
  const isEmpty =
    !post.content?.trim() &&
    !post.subItems?.length &&
    !post.url &&
    !post.imageUris?.length;

  // ──────────────────────────────────────────
  // 편집 모드
  // ──────────────────────────────────────────
  if (isEditing) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={[styles.headerSafeTop, { height: insets.top }]} />

        <View style={styles.header}>
          <TouchableOpacity onPress={cancelEdit} style={styles.headerSideBtn}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerCenterTitle}>게시물 수정</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerSideBtn, styles.headerSideBtnRight]}
            disabled={!editTitle.trim()}
            activeOpacity={0.6}>
            <Text style={[styles.saveText, !editTitle.trim() && styles.saveTextDisabled]}>저장</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.editBodyContent}
          keyboardShouldPersistTaps="handled">

          {/* 제목 */}
          <TextInput
            style={styles.editTitleInput}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="제목"
            placeholderTextColor="#AABBCC"
            maxLength={100}
          />
          <View style={styles.divider} />

          {/* 서브아이템이 없을 때만 내용/사진/링크 표시 */}
          {editSubItems.length === 0 && (
            <>
              <TextInput
                style={styles.editContentInput}
                value={editContent}
                onChangeText={setEditContent}
                placeholder="내용을 입력하세요"
                placeholderTextColor="#AABBCC"
                multiline
                textAlignVertical="top"
              />

              <View style={styles.sectionDivider} />
              <Text style={styles.sectionLabel}>링크</Text>

              {/* 링크 입력 필드 */}
              <View style={styles.linkInputRow}>
                <TextInput
                  style={styles.linkInput}
                  value={editLinkInput}
                  onChangeText={setEditLinkInput}
                  placeholder={editUrl ? '새 링크로 대체하기' : 'https://'}
                  placeholderTextColor="#AABBCC"
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <TouchableOpacity
                  style={[styles.linkFetchBtn, (!editLinkInput.trim() || ogLoading) && styles.linkFetchBtnDisabled]}
                  onPress={handleFetchPostOg}
                  disabled={ogLoading || !editLinkInput.trim()}>
                  {ogLoading
                    ? <ActivityIndicator size="small" color="#FFFFFF" />
                    : <Text style={styles.linkFetchText}>확인</Text>}
                </TouchableOpacity>
              </View>

              {/* 저장된 링크 미리보기 */}
              {editUrl ? (
                <View style={styles.savedLinkRow}>
                  <OgPreviewCard url={editUrl} ogData={editOgData} />
                  <TouchableOpacity style={styles.linkClearBtn} onPress={() => { setEditUrl(''); setEditOgData(undefined); }}>
                    <CloseIcon color="#FF3B30" size={12} />
                    <Text style={styles.linkClearText}>링크 삭제</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.sectionDivider} />
              <Text style={styles.sectionLabel}>사진</Text>
              <ImageEditRow
                uris={editImageUris}
                onAdd={uris => setEditImageUris(prev => [...prev, ...uris])}
                onRemove={uri => setEditImageUris(prev => prev.filter(u => u !== uri))}
              />
            </>
          )}

          {/* ── 서브아이템 섹션 ── */}
          {editSubItems.length > 0 && <View style={styles.sectionDivider} />}
          <Text style={styles.sectionLabel}>하위 항목</Text>

          {editSubItems.map((sub, idx) => {
            const isActive = editingSubId === sub.id;
            return (
              <View
                key={sub.id}
                style={[styles.subItemCard, isActive && styles.subItemCardActive]}>

                {/* 카드 헤더 — 탭으로 열기/닫기 */}
                <TouchableOpacity
                  style={styles.subItemCardHeader}
                  onPress={() => setEditingSubId(isActive ? null : sub.id)}
                  activeOpacity={0.7}>
                  <Text style={[styles.subItemIndex, isActive && styles.subItemIndexActive]}>
                    {idx + 1}
                  </Text>
                  <Text
                    style={[styles.subItemHeaderTitle, isActive && styles.subItemHeaderTitleActive]}
                    numberOfLines={1}>
                    {sub.title || `항목 ${idx + 1}`}
                  </Text>
                  <View style={styles.subItemHeaderRight}>
                    {isActive && (
                      <TouchableOpacity
                        onPress={() => deleteSubItem(sub.id)}
                        style={styles.subItemDeleteBtn}
                        hitSlop={8}>
                        <CloseIcon color="#FF3B30" size={14} />
                      </TouchableOpacity>
                    )}
                    {isActive
                      ? <ChevronUpIcon color="#588DFF" size={16} />
                      : <ChevronDownIcon color="#9DAFC8" size={16} />}
                  </View>
                </TouchableOpacity>

                {/* 펼쳐진 편집 영역 */}
                {isActive && (
                  <>
                    <View style={styles.subItemDivider} />

                    <TextInput
                      style={styles.subItemTitleInput}
                      value={sub.title}
                      onChangeText={v => updateSubItem(sub.id, { title: v })}
                      placeholder="항목 제목"
                      placeholderTextColor="#AABBCC"
                    />

                    <TextInput
                      style={styles.subItemContentInput}
                      value={sub.content}
                      onChangeText={v => updateSubItem(sub.id, { content: v })}
                      placeholder="항목 내용"
                      placeholderTextColor="#AABBCC"
                      multiline
                      textAlignVertical="top"
                    />

                    <Text style={styles.subItemSectionLabel}>사진</Text>
                    <ImageEditRow
                      uris={sub.imageUris ?? []}
                      onAdd={uris => updateSubItem(sub.id, { imageUris: [...(sub.imageUris ?? []), ...uris] })}
                      onRemove={uri => updateSubItem(sub.id, { imageUris: (sub.imageUris ?? []).filter(u => u !== uri) })}
                    />

                    <Text style={styles.subItemSectionLabel}>링크</Text>
                    <SubItemLinkEditor
                      inputValue={subLinkInputs[sub.id] ?? ''}
                      savedUrl={sub.url}
                      ogData={sub.ogData}
                      ogLoading={subOgLoading[sub.id] ?? false}
                      onChangeInput={v => setSubLinkInputs(prev => ({ ...prev, [sub.id]: v }))}
                      onFetch={() => fetchSubOg(sub.id)}
                      onClear={() => updateSubItem(sub.id, { url: undefined, ogData: undefined })}
                    />
                  </>
                )}
              </View>
            );
          })}

          <TouchableOpacity style={styles.addSubItemBtn} onPress={addSubItem}>
            <PlusCircleIcon color="#588DFF" size={18} />
            <Text style={styles.addSubItemText}>하위 항목 추가</Text>
          </TouchableOpacity>

          <View style={{ height: 48 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────
  // 뷰 모드
  // ──────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.headerSafeTop, { height: insets.top }]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <ArrowLeftIcon color="#1A1A1A" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{post.title}</Text>
        <TouchableOpacity onPress={enterEdit} hitSlop={8}>
          <EditIcon color="#588DFF" size={20} />
        </TouchableOpacity>
      </View>

      {/* 날짜 정보 바 */}
      <View style={styles.dateBadgeRow}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeLabel}>작성</Text>
          <Text style={styles.dateBadgeValue}>{formatFullTime(post.createdAt)}</Text>
        </View>
        {post.updatedAt && (
          <>
            <View style={styles.dateBadgeDot} />
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeLabel}>수정</Text>
              <Text style={styles.dateBadgeValue}>{formatFullTime(post.updatedAt)}</Text>
            </View>
          </>
        )}
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* 빈 게시물: 내용/서브아이템/링크/사진 모두 없을 때 */}
        {isEmpty ? (
          <TouchableOpacity style={styles.emptyState} onPress={enterEdit} activeOpacity={0.7}>
            <Text style={styles.emptyStateIcon}>✏️</Text>
            <Text style={styles.emptyStateTitle}>아직 내용이 없어요</Text>
            <Text style={styles.emptyStateDesc}>탭해서 내용, 사진, 링크를 추가해보세요</Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* 내용 (서브아이템 없을 때) */}
            {!post.subItems?.length && !!post.content && (
              <>
                <Text style={styles.contentLabel}>내용</Text>
                <Text style={styles.contentText}>{post.content}</Text>
              </>
            )}

            {/* 서브아이템 아코디언 */}
            {!!post.subItems?.length && (
              <View style={styles.subItemsView}>
                {post.subItems.map((sub, idx) => {
                  const isOpen = expandedSubId === sub.id;
                  const hasContent = !!sub.content || !!sub.imageUris?.length || !!sub.url;
                  return (
                    <View key={sub.id} style={[styles.subAccordion, idx === post.subItems!.length - 1 && styles.subAccordionLast]}>
                      <TouchableOpacity
                        style={styles.subAccordionHeader}
                        onPress={() => setExpandedSubId(isOpen ? null : sub.id)}
                        activeOpacity={0.7}>
                        <Text style={styles.subAccordionTitle}>{sub.title || `항목 ${idx + 1}`}</Text>
                        {isOpen
                          ? <ChevronUpIcon color="#588DFF" size={18} />
                          : <ChevronDownIcon color="#9DAFC8" size={18} />}
                      </TouchableOpacity>

                      {isOpen && (
                        <View style={styles.subAccordionBody}>
                          {sub.content ? (
                            <Text style={styles.subAccordionContent}>{sub.content}</Text>
                          ) : null}

                          {!!sub.imageUris?.length && (
                            <View style={[styles.imageRow, { marginTop: sub.content ? 10 : 10 }]}>
                              {sub.imageUris.map(uri => (
                                <Image key={uri} source={{ uri }} style={styles.imageThumb} />
                              ))}
                            </View>
                          )}

                          {sub.url && (
                            <View style={{ marginTop: 10 }}>
                              <LinkCard url={sub.url} ogData={sub.ogData} />
                            </View>
                          )}

                          {!hasContent && (
                            <Text style={[styles.emptyContent, { paddingTop: 10 }]}>내용 없음</Text>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* 게시물 이미지 */}
            {!!post.imageUris?.length && (
              <>
                <Text style={styles.contentLabel}>사진</Text>
                <View style={styles.imageRow}>
                  {post.imageUris.map(uri => (
                    <Image key={uri} source={{ uri }} style={styles.imageThumb} />
                  ))}
                </View>
              </>
            )}

            {/* 게시물 링크 */}
            {!!post.url && (
              <>
                <Text style={styles.contentLabel}>링크</Text>
                <LinkCard url={post.url} ogData={post.ogData} />
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ──────────────────────────────────────────
// 스타일
// ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FF' },

  // 헤더 safe 영역
  headerSafeTop: {
    backgroundColor: '#FFFFFF',
  },

  // 헤더
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
  headerSideBtn: { minWidth: 52 },
  headerSideBtnRight: { alignItems: 'flex-end' },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  headerCenterTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
  },
  cancelText: { fontSize: 15, color: '#9DAFC8', fontFamily: 'PretendardVariable' },
  saveText: { fontSize: 15, fontWeight: '600', color: '#588DFF', fontFamily: 'PretendardVariable' },
  saveTextDisabled: { color: '#C0CDD8' },

  // 날짜 바
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F7FAFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECFF',
  },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateBadgeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8FA8D0',
    fontFamily: 'PretendardVariable',
  },
  dateBadgeValue: {
    fontSize: 11,
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
  },
  dateBadgeDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#C0CDD8',
  },

  // Body
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 48 },
  editBodyContent: { paddingHorizontal: 20, paddingBottom: 48 },

  // 뷰 모드
  timeText: { fontSize: 12, color: '#9DAFC8', fontFamily: 'PretendardVariable', marginBottom: 20 },
  contentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  contentText: { fontSize: 15, color: '#1A1A1A', fontFamily: 'PretendardVariable', lineHeight: 24 },
  emptyContent: { fontSize: 14, color: '#C0CDD8', fontFamily: 'PretendardVariable', fontStyle: 'italic' },

  // 빈 상태
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E4ECFF',
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyStateIcon: { fontSize: 32, marginBottom: 4 },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
  },
  emptyStateDesc: {
    fontSize: 13,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    textAlign: 'center',
  },

  // 서브아이템 뷰
  subItemsView: { gap: 10, marginTop: 4 },
  subAccordion: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4ECFF',
  },
  subAccordionLast: {},
  subAccordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  subAccordionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  subAccordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 2,
    backgroundColor: '#F8FAFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF3FF',
  },
  subAccordionContent: {
    fontSize: 14,
    color: '#3A3A3A',
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
    paddingTop: 10,
  },

  // 이미지
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  imageThumbWrap: { position: 'relative' },
  imageThumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#E8EEF8' },
  imageDeleteOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 10,
    padding: 3,
  },
  imageAddBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#EEF3FF',
    borderWidth: 1.5,
    borderColor: '#C8D8FF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // OG 카드 + 바로가기 버튼 (뷰 모드)
  linkCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E4FF',
    backgroundColor: '#FAFCFF',
    overflow: 'hidden',
  },
  linkCardImage: { width: '100%', height: 140, backgroundColor: '#E8EEF8' },
  linkCardBody: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkCardText: { flex: 1, gap: 2 },
  linkCardSitename: { fontSize: 11, color: '#9DAFC8', fontFamily: 'PretendardVariable' },
  linkCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },
  linkCardDesc: { fontSize: 12, color: '#6B7E9A', fontFamily: 'PretendardVariable', lineHeight: 17 },
  linkCardUrl: { fontSize: 11, color: '#AABBCC', fontFamily: 'PretendardVariable', marginTop: 2 },
  linkCardGoto: {
    backgroundColor: '#588DFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexShrink: 0,
  },
  linkCardGotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
  },

  // OG 카드 (편집 미리보기용)
  ogCard: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E4ECFF', marginTop: 4 },
  ogImage: { width: '100%', height: 160, backgroundColor: '#E8EEF8' },
  ogBody: { padding: 12, backgroundColor: '#F8FAFF' },
  ogSitename: { fontSize: 11, color: '#9DAFC8', fontFamily: 'PretendardVariable', marginBottom: 2 },
  ogTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', fontFamily: 'PretendardVariable', marginBottom: 2 },
  ogDesc: { fontSize: 12, color: '#6B7E9A', fontFamily: 'PretendardVariable', lineHeight: 18, marginBottom: 4 },
  ogUrl: { fontSize: 11, color: '#9DAFC8', fontFamily: 'PretendardVariable' },

  // 편집 공통
  divider: { height: 1, backgroundColor: '#EEF3FF', marginBottom: 12 },
  sectionDivider: { height: 8, backgroundColor: '#F4F7FF', marginHorizontal: -20, marginVertical: 4 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  editTitleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    paddingTop: 20,
    paddingBottom: 12,
  },
  editContentInput: {
    fontSize: 15,
    color: '#3A3A3A',
    fontFamily: 'PretendardVariable',
    lineHeight: 24,
    minHeight: 100,
    paddingBottom: 8,
  },

  // 서브아이템 편집
  subItemCard: {
    backgroundColor: '#F8FAFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E4ECFF',
  },
  subItemCardActive: {
    borderColor: '#588DFF',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#588DFF',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  subItemCardHeader: { flexDirection: 'row', alignItems: 'center' },
  subItemIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 8,
    flexShrink: 0,
  },
  subItemIndexActive: {
    backgroundColor: '#588DFF',
    color: '#FFFFFF',
  },
  subItemHeaderTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7E9A',
    fontFamily: 'PretendardVariable',
  },
  subItemHeaderTitleActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  subItemHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  subItemDeleteBtn: { padding: 2 },
  subItemDivider: { height: 1, backgroundColor: '#EEF3FF', marginVertical: 12 },
  subItemTitleInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECFF',
    marginBottom: 10,
  },
  subItemContentInput: {
    fontSize: 14,
    color: '#3A3A3A',
    fontFamily: 'PretendardVariable',
    lineHeight: 22,
    minHeight: 60,
    marginBottom: 12,
  },
  subItemSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B0C4D8',
    fontFamily: 'PretendardVariable',
    letterSpacing: 0.4,
    marginBottom: 6,
    marginTop: 4,
  },
  subLinkSection: { marginBottom: 4 },
  savedLinkRow: { marginBottom: 8 },

  addSubItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  addSubItemText: {
    fontSize: 14,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
    fontWeight: '600',
  },

  // 링크 편집
  linkInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  linkInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4ECFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkFetchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#588DFF',
    borderRadius: 10,
    minWidth: 72,
    alignItems: 'center',
  },
  linkFetchBtnDisabled: { backgroundColor: '#C0CDD8' },
  linkFetchText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', fontFamily: 'PretendardVariable' },
  linkClearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, marginBottom: 6 },
  linkClearText: { fontSize: 12, color: '#FF3B30', fontFamily: 'PretendardVariable' },
});

export default BoardPostDetailScreen;