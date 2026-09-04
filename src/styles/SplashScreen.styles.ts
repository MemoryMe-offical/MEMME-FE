import { StyleSheet } from 'react-native';

export const splashStyles = StyleSheet.create({
  // 스플래시 - 메인 컨테이너
  'splash-container': {
    flex: 1,
    backgroundColor: '#588DFF',
  },

  // 스플래시 - 로고 섹션 (상단 왼쪽)
  'splash-logoSection': {
    paddingTop: 80,
    paddingLeft: 30,
    paddingRight: 30,
  },

  'splash-logoSection-iconBox-image': {
    marginTop: 100,
    width: '20%',   
    height: '20%',
    marginBottom: 10,
},
  // 스플래시 - 로고 섹션 - 타이틀
  'splash-logoSection-title': {
    fontSize: 37,
    fontFamily: 'Paprika',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontStyle: 'italic',
  },

  // 스플래시 - 로고 섹션 - 서브타이틀
  'splash-logoSection-subtitle': {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.95,
    fontFamily: 'PretendardVariable',
  },

  // 스플래시 - 캐릭터 컨테이너 (하단)
  // bottom/left/width/height는 창 크기에 따라 실시간 계산되어 인라인으로 덮어씀
  // (Mac 창 리사이즈 대응)
  'splash-characterContainer': {
    position: 'absolute',
    overflow: 'visible', // 넘치는 부분 보이게
  },

  // 스플래시 - 캐릭터 컨테이너 - 이미지
  'splash-characterContainer-image': {
    resizeMode: 'contain',
  },
});