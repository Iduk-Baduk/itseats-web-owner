// 알림음 URL
export const NOTIFICATION_SOUNDS = {
  NEW_ORDER: '/sounds/new-order.mp3',
  STATUS_CHANGE: '/sounds/status-change.mp3',
  ERROR: '/sounds/error.mp3'
};

// 알림음 볼륨 설정
export const NOTIFICATION_VOLUME = 0.5; // 0.0 ~ 1.0

// 알림음 재생 함수
export const playSound = (soundType) => {
  const audio = new Audio(NOTIFICATION_SOUNDS[soundType]);
  audio.volume = NOTIFICATION_VOLUME;
  audio.play().catch(error => console.error('Sound play failed:', error));
}; 
