const fs = require('fs').promises;
const path = require('path');

function toISOString(date) {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

async function fixTimestamps(data) {
  // POS 상태 이력의 타임스탬프 수정
  if (Array.isArray(data.history)) {
    data.history = data.history.map(item => ({
      ...item,
      timestamp: toISOString(item.timestamp)
    }));
  }

  // 설정의 타임스탬프 수정
  if (data.settings?.updatedAt) {
    data.settings.updatedAt = toISOString(data.settings.updatedAt);
  }

  // 자동화 설정의 타임스탬프 수정
  if (data.autoSettings?.updatedAt) {
    data.autoSettings.updatedAt = toISOString(data.autoSettings.updatedAt);
  }

  return data;
}

async function migrateDatabase() {
  try {
    // db.json 파일 읽기
    const dbPath = path.join(__dirname, '..', 'data', 'db.json');
    const rawData = await fs.readFile(dbPath, 'utf8');
    const database = JSON.parse(rawData);

    // POS 데이터의 타임스탬프 수정
    if (database.pos) {
      database.pos = await Promise.all(
        database.pos.map(pos => fixTimestamps(pos))
      );
    }

    // 수정된 데이터를 파일에 저장
    await fs.writeFile(
      dbPath,
      JSON.stringify(database, null, 2),
      'utf8'
    );

    console.log('✅ 타임스탬프 마이그레이션이 완료되었습니다.');
    
    // 마이그레이션 완료 표시 파일 생성
    await fs.writeFile(
      path.join(__dirname, '..', 'data', '.timestamp_migrated'),
      new Date().toISOString(),
      'utf8'
    );
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

migrateDatabase(); 
