import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function toISOString(date) {
  if (!date) return new Date().toISOString();
  try {
    return new Date(date).toISOString();
  } catch (error) {
    console.warn('Invalid date:', date);
    return new Date().toISOString();
  }
}

async function fixTimestamps(data) {
  // POS 상태 이력의 타임스탬프 수정
  if (data.pos?.statusHistory) {
    data.pos.statusHistory = data.pos.statusHistory.map(item => ({
      ...item,
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
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

migrateDatabase(); 
