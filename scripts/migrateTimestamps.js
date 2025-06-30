import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { toISOString } from '../src/utils/dateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 고유 ID 생성 헬퍼
const generateId = () => 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

// 상태 이력 항목의 기본값
const DEFAULT_HISTORY_ITEM = {
  reason: '사유 없음',
  userId: 'system',
  userName: '시스템',
  notes: '',
  estimatedRevenueLoss: 0,
  affectedOrderCount: 0,
  category: 'MANUAL',
  requiresApproval: false,
  approvedBy: null
};

async function fixTimestamps(data) {
  // POS 상태 이력의 타임스탬프 수정 및 누락 필드 보완
  if (data.pos?.statusHistory) {
    data.pos.statusHistory = data.pos.statusHistory.map(item => ({
      ...DEFAULT_HISTORY_ITEM,  // 기본값 적용
      ...item,  // 기존 데이터 유지
      id: item.id || generateId(),  // ID가 없는 경우 생성
      timestamp: toISOString(item.timestamp),
      approvedAt: item.approvedAt ? toISOString(item.approvedAt) : null
    }));
  }

  // POS 마지막 업데이트 시간 수정
  if (data.pos?.lastUpdated) {
    data.pos.lastUpdated = toISOString(data.pos.lastUpdated);
  }

  // 알림의 타임스탬프 수정
  if (data.pos?.notifications) {
    data.pos.notifications = data.pos.notifications.map(item => ({
      ...item,
      id: item.id || generateId(),  // ID가 없는 경우 생성
      timestamp: toISOString(item.timestamp)
    }));
  }

  return data;
}

async function migrateDatabase() {
  try {
    // db.json 파일 읽기
    const dbPath = join(__dirname, '..', 'data', 'db.json');
    const rawData = await fs.readFile(dbPath, 'utf8');
    const database = JSON.parse(rawData);

    // 데이터베이스 타임스탬프 수정
    const updatedDatabase = await fixTimestamps(database);

    // 수정된 데이터를 파일에 저장
    await fs.writeFile(
      dbPath,
      JSON.stringify(updatedDatabase, null, 2),
      'utf8'
    );

    console.log('✅ 타임스탬프 마이그레이션이 완료되었습니다.');
    
    // 마이그레이션 완료 표시 파일 생성
    await fs.writeFile(
      join(__dirname, '..', 'data', '.timestamp_migrated'),
      new Date().toISOString(),
      'utf8'
    );

    // 마이그레이션 결과 로깅
    console.log('📊 마이그레이션 통계:');
    if (database.pos?.statusHistory) {
      console.log(`- 상태 이력 항목: ${database.pos.statusHistory.length}개`);
    }
    if (database.pos?.notifications) {
      console.log(`- 알림: ${database.pos.notifications.length}개`);
    }
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

migrateDatabase(); 
