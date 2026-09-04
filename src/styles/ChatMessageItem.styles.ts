import { StyleSheet } from 'react-native';

// 메시지 버블 등의 최대 너비는 창 크기에 따라 실시간 계산되어(useWindowDimensions)
// 사용하는 컴포넌트(ChatMessageItem)에서 인라인으로 덮어씀 (Mac 창 리사이즈 대응)

export const chatMessageItemStyles = StyleSheet.create({
  // 메인 컨테이너
  'container': {
    width: '100%',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },

  // 메시지 + 시간 행
  'message-row': {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    justifyContent: 'flex-end',
  },

  // 미디어 + 시간 행 (미디어만 있을 때)
  'media-row': {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },

  // 시간 텍스트
  'chatMessageItem-time': {
    fontSize: 11,
    color: '#9DAFC8',
    marginRight: 6,
    marginBottom: 2,
    fontFamily: 'PretendardVariable',
  },

  // 메시지 bubble 래퍼
  // maxWidth는 컴포넌트에서 인라인으로 덮어씀
  'message-bubble-wrapper': {
    flexShrink: 1,
  },

  // 말풍선
  'chatMessageItem-bubble': {
    backgroundColor: '#588DFF',
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 1,
    flexGrow: 0,
  },

  // 말풍선 텍스트
  'chatMessageItem-bubble-text': {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'PretendardVariable',
    lineHeight: 20,
    flexWrap: 'wrap',
  },

  // 전문 보기 힌트
  'expand-hint-text': {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'PretendardVariable',
    marginTop: 6,
    fontStyle: 'italic',
    opacity: 0.8,
    textAlign: 'center',
  },

  // 링크 관련 아이템들 컨테이너
  'links-container': {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },

  // OG 데이터 로딩 중 표시
  'og-loading': {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E8EEF8',
    alignItems: 'center',
  },

  'og-loading-text': {
    fontSize: 11,
    color: '#AABBCC',
    marginTop: 6,
    fontFamily: 'PretendardVariable',
  },

  // 링크 카드
  // maxWidth는 컴포넌트에서 인라인으로 덮어씀
  'link-card': {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF8',
  },

  'link-card-image': {
    width: '100%',
    aspectRatio: 16 / 9,
  },

  'link-card-content': {
    padding: 12,
  },

  'link-card-title': {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    fontFamily: 'PretendardVariable',
  },

  'link-card-description': {
    fontSize: 11,
    color: '#666666',
    marginBottom: 6,
    fontFamily: 'PretendardVariable',
  },

  'link-card-domain': {
    fontSize: 10,
    color: '#9DAFC8',
    fontFamily: 'PretendardVariable',
  },

  // 링크만 있는 경우 (OgData 없음)
  'link-only-card': {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E8EEF8',
  },

  'link-only-text': {
    fontSize: 11,
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },

  // 링크 추가 버튼 래퍼
  'button-wrapper': {
    alignItems: 'flex-end',
  },

  // 링크 추가 버튼
  'add-link-button': {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },

  'add-link-button-text': {
    fontSize: 12,
    fontWeight: '600',
    color: '#588DFF',
    fontFamily: 'PretendardVariable',
  },

  // 미디어 컨테이너
  // maxWidth는 컴포넌트에서 인라인으로 덮어씀
  'media-container': {
    marginTop: 8,
    alignSelf: 'flex-end',
  },

  // 이미지 그리드 컨테이너
  'image-grid': {
    gap: 4,
    alignSelf: 'flex-end',
    marginTop: 8,
  },

  // 이미지 한 줄 (2열)
  'image-row': {
    flexDirection: 'row',
    gap: 4,
  },

  // 이미지 셀
  'image-cell': {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F4FF',
  },

  'image-thumbnail': {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  // 이미지 오버레이 (더보기 수)
  'image-overlay': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },

  'image-overlay-text': {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'PretendardVariable',
  },

  // 동영상 컨테이너
  // maxWidth는 컴포넌트에서 인라인으로 덮어씀
  'video-container': {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    position: 'relative',
    marginTop: 8,
    alignSelf: 'flex-end',
  },

  'video-thumbnail': {
    width: '100%',
    height: '100%',
  },

  'video-play-icon': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  'video-play-button': {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 파일 카드
  // maxWidth는 컴포넌트에서 인라인으로 덮어씀
  'file-container': {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E8EEF8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    alignSelf: 'flex-end',
  },

  'file-icon-container': {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#EEF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  'file-info': {
    flex: 1,
  },

  'file-name': {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'PretendardVariable',
  },

  'file-size': {
    fontSize: 10,
    color: '#9DAFC8',
    marginTop: 2,
    fontFamily: 'PretendardVariable',
  },
});
