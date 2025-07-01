import axios from 'axios';

const STORE_ID = 'store001';  // 시뮬레이션할 매장 ID
const SIMULATION_INTERVAL = 30000;  // 30초마다 주문 생성
const API_URL = 'http://localhost:3001';  // Mock 서버 주소

// 메뉴 목록
const MENUS = [
  { id: '93cd', name: '아메리카노', price: 2000 },
  { id: 'df19', name: '커피번', price: 3500 },
  { id: '2048', name: '1', price: 2 },
  { id: '4359', name: '12', price: 11 }
];

function generateRandomOrder() {
  // 1~3개의 메뉴를 랜덤하게 선택
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const items = [];
  let totalAmount = 0;

  for (let i = 0; i < itemCount; i++) {
    const menu = MENUS[Math.floor(Math.random() * MENUS.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const price = menu.price * quantity;
    
    items.push({
      menuId: menu.id,
      name: menu.name,
      quantity,
      price
    });
    
    totalAmount += price;
  }

  return {
    id: `order-${Date.now()}`,
    storeId: STORE_ID,
    status: 'PENDING',
    items,
    totalAmount,
    createdAt: new Date().toISOString()
  };
}

async function createOrder() {
  try {
    const order = generateRandomOrder();
    const response = await axios.post(`${API_URL}/orders`, order);
    console.log('새로운 주문이 생성되었습니다:', response.data);
  } catch (error) {
    console.error('주문 생성 실패:', error.message);
  }
}

// 주문 시뮬레이션 시작
console.log('주문 시뮬레이션을 시작합니다...');
console.log(`매장 ID: ${STORE_ID}`);
console.log(`주문 생성 간격: ${SIMULATION_INTERVAL / 1000}초`);

// 첫 주문 즉시 생성
createOrder();

// 이후 주기적으로 주문 생성
setInterval(createOrder, SIMULATION_INTERVAL); 
