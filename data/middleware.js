const { v4: uuidv4 } = require('uuid');

// 메뉴 목록
const MENUS = [
  { id: 'menu001', name: '후라이드 치킨', price: 18000 },
  { id: 'menu002', name: '양념 치킨', price: 19000 },
  { id: 'menu003', name: '간장 치킨', price: 19000 },
  { id: 'menu004', name: '마늘 치킨', price: 19000 },
  { id: 'menu005', name: '반반 치킨', price: 19000 }
];

// 랜덤 주문 생성 함수
const generateRandomOrder = (storeId) => {
  const orderItems = [];
  const itemCount = Math.floor(Math.random() * 3) + 1; // 1~3개 아이템

  for (let i = 0; i < itemCount; i++) {
    const menu = MENUS[Math.floor(Math.random() * MENUS.length)];
    const quantity = Math.floor(Math.random() * 2) + 1; // 1~2개 수량
    
    orderItems.push({
      menuId: menu.id,
      name: menu.name,
      quantity: quantity,
      price: menu.price
    });
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    id: `order-${uuidv4().slice(0, 8)}`,
    storeId: storeId,
    status: 'PENDING',
    items: orderItems,
    totalAmount: totalAmount,
    orderTime: new Date().toISOString(),
    customerRequest: '',
    paymentMethod: 'CARD',
    customerName: `고객${Math.floor(Math.random() * 1000)}`
  };
};

// 주문 통계 업데이트 함수
const updateOrderStats = (db, storeId, order) => {
  const stats = db.get('stats').get(storeId).value();
  
  if (stats) {
    const daily = stats.daily || {};
    daily.totalOrders = (daily.totalOrders || 0) + 1;
    daily.totalSales = (daily.totalSales || 0) + order.totalAmount;
    daily.averageOrderAmount = Math.floor(daily.totalSales / daily.totalOrders);
    daily.pendingOrders = (daily.pendingOrders || 0) + 1;

    db.get('stats').get(storeId).set('daily', daily).write();
  }
};

module.exports = (req, res, next) => {
  // API 라우팅 처리
  if (req.path.startsWith('/api/owner/')) {
    const parts = req.path.split('/');
    if (parts[3] === 'orders') {
      const storeId = parts[2];
      if (req.method === 'GET') {
        // 주문 목록 조회
        const orders = req.app.db.get('orders').filter({ storeId: storeId }).value();
        res.json(orders);
        return;
      }
    } else if (parts[2] === 'orders' && parts[3]) {
      const orderId = parts[3];
      if (req.method === 'GET') {
        // 주문 상세 조회
        const order = req.app.db.get('orders').find({ id: orderId }).value();
        if (order) {
          res.json(order);
        } else {
          res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
        }
        return;
      } else if (req.method === 'PATCH') {
        // 주문 상태 업데이트
        const order = req.app.db.get('orders').find({ id: orderId }).value();
        if (order) {
          const updatedOrder = { ...order, ...req.body };
          req.app.db.get('orders').find({ id: orderId }).assign(updatedOrder).write();
          res.json(updatedOrder);
        } else {
          res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
        }
        return;
      }
    }
  }

  if (req.method === 'POST' && req.path === '/api/auth/login') {
    const { username, password } = req.body;
    const users = req.app.db.get('users').value();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        storeId: user.storeId
      });
    } else {
      res.status(401).json({ message: '잘못된 사용자 정보입니다.' });
    }
    return;
  }

  // 주문 시뮬레이션 API
  if (req.method === 'POST' && req.path === '/api/simulation/start') {
    const { storeId } = req.body;
    if (!storeId) {
      res.status(400).json({ message: '매장 ID가 필요합니다.' });
      return;
    }

    // 새로운 주문 생성
    const newOrder = generateRandomOrder(storeId);
    const orders = req.app.db.get('orders');
    orders.push(newOrder).write();

    // 통계 업데이트
    updateOrderStats(req.app.db, storeId, newOrder);

    res.json(newOrder);
    return;
  }

  // API 응답 지연 시뮬레이션
  setTimeout(() => {
    next();
  }, 300);
}; 
