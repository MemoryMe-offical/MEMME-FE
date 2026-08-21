// 컴포넌트 트리 밖(유틸 함수 등)에서 네비게이션을 트리거하기 위한 참조.
// tokenUtils.ts의 fetchWithAutoLogoutHandler처럼 화면이 아닌 곳에서
// 세션 만료를 감지했을 때 Login 화면으로 강제 이동시키는 용도.
import { createNavigationContainerRef } from '@react-navigation/native';
// 타입만 사용하므로 런타임 순환 참조를 피하기 위해 import type 사용
// (RootNavigator.tsx가 화면들을 거쳐 이 파일을 다시 참조할 수 있음)
import type { RootStackParamList } from './RootNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// 동시에 여러 API 호출이 401을 받아도 reset이 중복 실행되지 않도록 방지
let isResettingToLogin = false;

/**
 * 세션이 만료(401 확정)됐을 때 네비게이션 스택을 초기화하고 Login으로 보낸다.
 * BoardDetail/NoteDetail 등 인증이 필요한 화면들이 스택에 남아있지 않도록
 * navigate가 아닌 reset을 사용한다.
 */
export const resetToLogin = () => {
  if (!navigationRef.isReady() || isResettingToLogin) {
    return;
  }

  // 이미 Login 화면이면 다시 리셋할 필요 없음
  if (navigationRef.getCurrentRoute()?.name === 'Login') {
    return;
  }

  isResettingToLogin = true;

  navigationRef.reset({
    index: 0,
    routes: [{ name: 'Login' }],
  });

  // 다음 틱에 플래그 해제 (reset 자체는 동기적으로 완료됨)
  setTimeout(() => {
    isResettingToLogin = false;
  }, 0);
};
