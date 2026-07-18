<div align="center">
  <img width="180" alt="Memme Logo" src="https://github.com/user-attachments/assets/2320d022-f3da-481c-a669-bf775698e75a" />

  # MEMME Frontend

  React Native로 개발한 MEMME iOS·Android 애플리케이션입니다.

  <br />

  <img src="https://img.shields.io/badge/React_Native-0.83.1-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React Native 0.83.1" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5.8.3" />
  <img src="https://img.shields.io/badge/iOS-111111?style=flat-square&logo=apple&logoColor=white" alt="iOS" />
  <img src="https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white" alt="Android" />
</div>

## 프로젝트 소개

MEMME는 메신저처럼 생각을 빠르게 기록하고, 나중에 보드와 노트로 정리할 수 있는 개인 메모 앱입니다.

이 저장소는 iOS와 Android에서 동작하는 MEMME 모바일 클라이언트를 관리합니다.

## 주요 화면

### 시작과 로그인

| 화면 | 설명 |
|---|---|
| **스플래시** | 최초 실행 여부와 저장된 로그인 정보를 확인해 온보딩, 로그인, 메인 화면으로 이동합니다. 만료된 Access Token은 Refresh Token으로 갱신을 시도합니다. |
| **온보딩** | 빠른 메모, 보드·노트 정리, 검색이라는 MEMME의 주요 사용 방식을 세 장의 슬라이드로 소개합니다. |
| **로그인** | 이메일 로그인과 카카오·Apple 로그인을 지원합니다. 자동 로그인을 선택하면 앱을 다시 실행할 때 세션을 확인합니다. |
| **회원가입** | 이메일 인증 후 비밀번호를 설정하고, 필수 약관 동의를 거쳐 계정을 생성합니다. |
| **비밀번호 찾기** | 이메일 인증번호를 확인한 뒤 새로운 비밀번호를 설정합니다. |

### 메인 타임라인

메모와 보드가 시간순으로 함께 표시되는 앱의 중심 화면입니다. 최신 기록이 아래에 쌓이는 메신저 형태로 구성했습니다.

- 하단 입력창에서 텍스트 메모 작성
- 사진, 동영상, 파일을 선택해 미디어 메모 생성
- 메모 펼치기, 북마크, 삭제, 보드로 변환
- 보드와 노트의 펼침 상태 설정
- 메모·보드·노트·태그 및 첨부 유형 검색
- 외부 앱에서 공유된 링크 인박스 확인
- 사이드 메뉴에서 미디어와 북마크 모아보기

### 보드 상세

하나의 주제에 속한 노트를 관리하는 화면입니다. 보드의 제목, 설명, 태그를 수정할 수 있고 새 노트를 추가할 수 있습니다. 여러 노트를 선택해 한 번에 삭제하거나 다른 보드로 이동할 수도 있습니다.

### 노트 상세

노트의 제목과 본문을 작성하고 다음 자료를 첨부합니다.

| 첨부 유형 | 지원 기능 |
|---|---|
| **이미지** | 여러 이미지 선택, 미리보기, 삭제 |
| **동영상** | 업로드, 썸네일·재생 시간 표시, 미리보기 |
| **파일** | 문서 선택, 파일명 표시, 삭제 |
| **링크** | OG 미리보기, 링크 삭제, AI 요약을 본문에 추가 |

수정 중 뒤로 가면 변경 내용을 버릴지 확인하고, 저장 중이거나 업로드 중일 때는 중복 동작을 막습니다.

### 미디어 모아보기

메모와 노트에 흩어진 사진, 동영상, 파일, 링크, 북마크를 유형별로 모아봅니다. 항목을 선택하면 원본이 포함된 보드 상세 또는 타임라인 위치로 이동합니다.

### 설정

로그아웃과 회원 탈퇴를 제공하며, 서비스 소개와 개인정보 처리방침은 외부 웹 페이지로 연결합니다. 현재 앱 버전도 이 화면에서 확인할 수 있습니다.

## 기술 스택

<p>
  <img src="https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_Navigation-6B52AE?style=flat-square&logo=react&logoColor=white" alt="React Navigation" />
  <img src="https://img.shields.io/badge/Swift-F05138?style=flat-square&logo=swift&logoColor=white" alt="Swift" />
  <img src="https://img.shields.io/badge/Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white" alt="Kotlin" />
</p>
<p>
  <img src="https://img.shields.io/badge/Firebase_Analytics-FFCA28?style=flat-square&logo=firebase&logoColor=111111" alt="Firebase Analytics" />
  <img src="https://img.shields.io/badge/Kakao_Login-FFCD00?style=flat-square&logo=kakao&logoColor=111111" alt="Kakao Login" />
  <img src="https://img.shields.io/badge/Sign_in_with_Apple-111111?style=flat-square&logo=apple&logoColor=white" alt="Sign in with Apple" />
  <img src="https://img.shields.io/badge/Amazon_S3-569A31?style=flat-square&logo=amazons3&logoColor=white" alt="Amazon S3" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white" alt="Jest" />
</p>

### 적용 방식

| 영역 | 적용 방식 | 선택 이유 |
|---|---|---|
| **멀티 플랫폼** | React Native로 화면과 도메인 로직을 공유하고 공유 기능만 Swift·Kotlin으로 구현 | iOS와 Android의 UI를 함께 관리하면서 네이티브 진입점은 직접 제어하기 위해 |
| **타임라인** | Cursor Pagination과 `inverted FlatList` 사용 | 새 기록이 계속 추가되어도 중복·누락을 줄이고 채팅형 UI를 유지하기 위해 |
| **인증** | 401 발생 시 토큰 갱신 후 재시도하고, 동시 갱신 요청은 하나의 Promise로 공유 | 화면별 만료 처리를 없애고 Refresh API 중복 호출을 막기 위해 |
| **미디어** | FormData 업로드 후 S3 Key와 Presigned URL 분리 관리 | 만료되는 URL 대신 Object Key를 기준으로 파일을 다시 조회하기 위해 |
| **외부 공유** | iOS Share Extension, Android Sharing Intent 구현 | 앱이 실행되지 않은 상태에서도 공유된 링크를 놓치지 않기 위해 |

핵심 구현은 [`tokenUtils.ts`](./src/utils/tokenUtils.ts), [`timelineService.ts`](./src/services/timelineService.ts), [`uploadService.ts`](./src/services/uploadService.ts)에서 확인할 수 있습니다.

## 프로젝트 구조

```text
src/
├── screens/        화면
├── components/     공통·도메인 UI
├── services/       API와 응답 변환
├── navigation/     Route와 화면 이동
├── types/          도메인 타입
└── utils/          인증·저장소·분석
```

플랫폼 코드는 `ios/`, `android/`에서, 전체 화면 구조는 [IA 문서](./docs/IA.md)에서 확인할 수 있습니다.

## 시작하기

### 요구 사항

- Node.js 20 이상
- npm
- React Native CLI 개발 환경
- Android Studio, Android SDK 및 ADB
- iOS 개발 시 macOS, Xcode, CocoaPods, Bundler

네이티브 개발 환경은 [React Native 개발 환경 설정](https://reactnative.dev/docs/set-up-your-environment)을 참고해 준비합니다.

### 의존성 설치

```bash
npm install
```

`postinstall`에서 `patch-package`가 자동으로 적용됩니다.

iOS를 개발하는 경우 Pod 의존성도 설치합니다.

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## 환경 설정

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성합니다.

```dotenv
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_REDIRECT_URI=your_kakao_redirect_uri
```

환경 변수의 타입은 `env.d.ts`, Babel 설정은 `babel.config.js`에서 관리합니다.

### Firebase

각 플랫폼의 Firebase 설정 파일을 추가합니다.

```text
android/app/google-services.json
ios/MEMME/GoogleService-Info.plist
```

`.env`와 Firebase 설정 파일은 Git에 포함하지 않습니다. 팀의 보안 채널을 통해 전달받아 사용합니다.

### 네이티브 로그인 설정

카카오 및 Apple 로그인은 환경 변수만으로 동작하지 않습니다. 각 개발자의 앱 등록 정보에 맞춰 다음 항목도 확인해야 합니다.

- iOS URL Scheme, Bundle ID, Sign in with Apple Capability
- Android Package Name, Key Hash, Redirect URI
- 카카오 Developers에 등록된 플랫폼 및 Redirect URI

## 실행

Metro 서버를 먼저 실행합니다.

```bash
npm start
```

### iOS

```bash
# Simulator
npm run ios

# 연결된 기기
npm run ios:provision
```

### Android

```bash
npm run android
```

현재 `npm run android`는 Android 16의 streaming install 문제를 우회하기 위해 APK를 빌드한 뒤 ADB로 직접 설치합니다. 해당 스크립트는 Windows의 `gradlew.bat`을 기준으로 작성되어 있습니다.

macOS 또는 Linux에서는 표준 React Native 명령을 사용할 수 있습니다.

```bash
npx react-native run-android
```

Release APK를 빌드하고 연결된 기기에 설치하려면 다음 명령을 사용합니다.

```bash
npm run android:release
```

Release 스크립트 역시 Windows 및 ADB 연결 환경을 기준으로 합니다.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run ios` | iOS Simulator 실행 |
| `npm run android` | Android Debug APK 빌드·설치·실행 |



## 관련 문서

| 문서 | 내용 |
|---|---|
| [Information Architecture](./docs/IA.md) | 화면 계층과 주요 사용자 흐름 |