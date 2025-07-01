// 알림음 URL
export const NOTIFICATION_SOUNDS = {
  NEW_ORDER: '/sounds/new-order.mp3',
  STATUS_CHANGE: '/sounds/status-change.mp3',
  ERROR: '/sounds/error.mp3'
};

// 알림음 볼륨 설정
export const NOTIFICATION_VOLUME = 0.5; // 0.0 ~ 1.0

// 알림음 재생 함수
export const playSound = async (soundType) => {
  try {
    const audio = new Audio(NOTIFICATION_SOUNDS[soundType]);
    audio.volume = NOTIFICATION_VOLUME;
    
    // 자동 재생 정책을 우회하기 위한 설정
    audio.muted = true;
    await audio.play();
    audio.muted = false;
    await audio.play();
  } catch (error) {
    // 사운드 재생 실패는 무시하고 계속 진행
    console.warn('Sound play failed:', error);
  }
}; 
