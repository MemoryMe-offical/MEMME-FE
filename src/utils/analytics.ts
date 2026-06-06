import analytics from '@react-native-firebase/analytics';

// 화면 조회 로깅
export const logScreenView = async (screenName: string) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  } catch (error) {
    console.error('Analytics screen view error:', error);
  }
};

// 커스텀 이벤트 로깅
export const logEvent = async (
  eventName: string,
  params?: Record<string, any>
) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error('Analytics event error:', error);
  }
};

// 사용자 ID 설정 (로그인 후 호출)
export const setUserId = async (userId: string) => {
  try {
    await analytics().setUserId(userId);
  } catch (error) {
    console.error('Analytics setUserId error:', error);
  }
};

// 사용자 속성 설정
export const setUserProperties = async (properties: Record<string, string>) => {
  try {
    await analytics().setUserProperties(properties);
  } catch (error) {
    console.error('Analytics setUserProperties error:', error);
  }
};

// ===== 자주 사용할 이벤트 함수들 =====

// 보드 생성
export const logBoardCreated = async (boardName: string, boardType?: string) => {
  await logEvent('board_created', {
    board_name: boardName,
    board_type: boardType || 'personal',
  });
};

// 보드 삭제
export const logBoardDeleted = async (boardId: string) => {
  await logEvent('board_deleted', {
    board_id: boardId,
  });
};

// 노트 생성
export const logNoteCreated = async (boardId: string, noteType?: string) => {
  await logEvent('note_created', {
    board_id: boardId,
    note_type: noteType || 'text',
  });
};

// 노트 삭제
export const logNoteDeleted = async (boardId: string, noteId: string) => {
  await logEvent('note_deleted', {
    board_id: boardId,
    note_id: noteId,
  });
};

// 로그인
export const logUserLogin = async (method: string) => {
  await logEvent('user_login', {
    login_method: method, // 'email', 'google', 'apple' 등
  });
};

// 회원가입
export const logUserSignup = async (method: string) => {
  await logEvent('user_signup', {
    signup_method: method,
  });
};

// 이미지 추가
export const logImageAdded = async (boardId: string) => {
  await logEvent('image_added', {
    board_id: boardId,
  });
};

// 비디오 추가
export const logVideoAdded = async (boardId: string) => {
  await logEvent('video_added', {
    board_id: boardId,
  });
};

// 링크 공유
export const logLinkShared = async (shareTarget: string) => {
  await logEvent('link_shared', {
    share_target: shareTarget, // 'direct', 'sns', 'email' 등
  });
};

// 검색 수행
export const logSearch = async (searchQuery: string) => {
  await logEvent('search_performed', {
    search_query: searchQuery,
  });
};

// 설정 변경
export const logSettingsChanged = async (settingName: string, value: string) => {
  await logEvent('settings_changed', {
    setting_name: settingName,
    setting_value: value,
  });
};
