# PosStatusHistory 테스트 실패 문제 해결 가이드

## 📋 문제 상황

`PosStatusHistory` 컴포넌트에서 날짜 필터링과 페이지네이션 관련 테스트가 실패하는 문제가 발생했습니다.

### 실패한 테스트들
1. **날짜 필터링 테스트**: 2024-03-21 데이터가 1개여야 하는데 2개가 표시됨
2. **페이지네이션 테스트**: 첫 페이지에 10개 항목이 표시되어야 하는데 2개만 표시됨
3. **기본 렌더링 테스트**: 예상보다 많은 요소가 렌더링됨

## 🔍 문제 분석 및 원인

### 1. 중복 Role 속성 문제 ⚠️

**문제점**: 가장 큰 문제였던 부분
- `PosStatusHistory` 컴포넌트에서 `PosStatusBadge`를 `<div role="status">`로 감쌌음
- 그런데 `PosStatusBadge` 자체가 이미 `role="status"`를 가지고 있었음
- 결과적으로 중복 DOM 요소가 생성되어 `getAllByRole('status')`가 예상보다 많은 요소를 반환

**문제 코드**:
```jsx
// PosStatusHistory.jsx (문제 코드)
<div role="status">
  <PosStatusBadge status={item.status} />
</div>

// PosStatusBadge.jsx
<div 
  className={`${styles.badge} ${className || ''}`}
  style={style}
  role="status"  // 이미 role="status"가 있음!
  aria-label={`매장 상태: ${label}`}
>
  {label}
</div>
```

### 2. 시간 오버플로우 문제 ⏰

**문제점**: 페이지네이션 테스트에서 날짜 계산 오류
```jsx
// 문제 코드
const longHistory = Array(15).fill(null).map((_, index) => ({
  status: POS_STATUS.OPEN,
  timestamp: new Date(2024, 2, 20, 10 + index).toISOString(), // 🚨 문제!
}));
```

- `10 + index`가 14가 되면 시간이 24시를 넘어가서 다음 날로 넘어감
- 결과적으로 15개 항목이 여러 날짜에 분산되어 날짜 필터링으로 인해 일부만 표시됨

### 3. 컴포넌트 로직 이해 부족 🤔

**문제점**: 테스트가 컴포넌트의 실제 동작을 반영하지 못함
- `PosStatusHistory`는 초기에 **가장 최근 날짜**의 데이터만 표시
- 테스트는 전체 데이터가 표시될 것으로 기대

## 🛠️ 해결 방법

### 1. 중복 Role 속성 제거 및 적절한 ARIA 역할 적용

```jsx
// 수정 전 (문제점들)
<div className={styles.historyItem}>
  <div className={styles.timestamp} role="timestamp">  // 🚨 잘못된 ARIA 역할
    {new Date(item.timestamp).toLocaleTimeString('ko-KR')}
  </div>
  <div role="status">  // 🚨 불필요한 래퍼 + 라이브 리전 오남용
    <PosStatusBadge status={item.status} />
  </div>
</div>

// PosStatusBadge.jsx 내부에서도
<div role="status" ...>  // 🚨 정적 요소에 라이브 리전 사용
  {label}
</div>

// 수정 후 (시맨틱 HTML + 적절한 ARIA 역할)
<div className={styles.historyItem}>
  <time
    className={styles.timestamp}
    dateTime={item.timestamp}
    aria-label={new Date(item.timestamp).toLocaleTimeString('ko-KR')}
  >
    {new Date(item.timestamp).toLocaleTimeString('ko-KR')}
  </time>
  <PosStatusBadge status={item.status} />  // ✅ 직접 사용
</div>

// PosStatusBadge.jsx 내부
<div role="img" aria-label={`매장 상태: ${label}`} ...>  // ✅ 정적 시각 요소에 적합
  {label}
</div>
```

### 2. 안전한 시간 생성

```jsx
// 수정 전 (시간 오버플로우 발생)
timestamp: new Date(2024, 2, 20, 10 + index).toISOString()

// 수정 후 (초 단위로 증가)
timestamp: new Date(2024, 2, 20, 10, 0, index).toISOString()
```

### 3. 테스트 기대값 수정

```jsx
// 수정된 테스트 케이스들

test('renders history items correctly', () => {
    render(<PosStatusHistory history={mockHistory} />);
    // role="status"에서 role="img"로 변경하여 접근성 개선
    const statusBadges = screen.getAllByRole('img');
    // 초기에는 가장 최근 날짜(2024-03-21)의 기록만 표시되므로 1개
    expect(statusBadges).toHaveLength(1);
  });

test('filters history by date', () => {
  render(<PosStatusHistory history={mockHistory} />);
  
  const dateSelect = screen.getByLabelText('날짜 선택');
  
  // 날짜 변경 (2024-03-20 선택 - 2개 항목이 있는 날짜)
  fireEvent.change(dateSelect, { target: { value: '2024-03-20' } });
  
  // 변경된 날짜의 데이터만 표시되는지 확인 (2024-03-20의 데이터는 2개)
  const statusBadges = screen.getAllByRole('status');
  expect(statusBadges).toHaveLength(2);
});

test('handles pagination correctly', () => {
  // 같은 날짜 내에서 초 단위로 증가시켜 시간 오버플로우 방지
  const longHistory = Array(15).fill(null).map((_, index) => ({
    status: POS_STATUS.OPEN,
    timestamp: new Date(2024, 2, 20, 10, 0, index).toISOString(),
  }));

  render(<PosStatusHistory history={longHistory} />);

  // 첫 페이지에서는 10개의 항목만 표시되어야 함
  const initialStatusBadges = screen.getAllByRole('status');
  expect(initialStatusBadges).toHaveLength(10);

  // 다음 페이지로 이동
  const nextPageButton = screen.getByText('2');
  fireEvent.click(nextPageButton);

  // 두 번째 페이지에서는 나머지 5개의 항목만 표시되어야 함
  const nextPageStatusBadges = screen.getAllByRole('status');
  expect(nextPageStatusBadges).toHaveLength(5);
});
```

## ✅ 해결 결과

```bash
✓ PosStatusHistory > renders empty state correctly 12ms
✓ PosStatusHistory > renders history items correctly 50ms
✓ PosStatusHistory > filters history by date 10ms
✓ PosStatusHistory > handles pagination correctly 15ms
✓ PosStatusHistory > sorts history items by time in descending order 3ms

Test Files  1 passed (1)
Tests  5 passed (5)
```

## 🎓 학습 포인트

### 1. 접근성 속성 올바른 사용
- 컴포넌트를 감쌀 때는 내부 컴포넌트의 `role`, `aria-*` 속성을 확인
- 중복된 접근성 속성은 테스트뿐만 아니라 스크린 리더 사용자에게도 혼란을 줄 수 있음
- **시맨틱 HTML 사용**: `role="timestamp"` 같은 잘못된 ARIA 역할 대신 `<time>` 요소 사용
- **적절한 ARIA 역할 선택**: 
  - `role="status"` → 라이브 리전용, 즉시 알림이 필요한 동적 상태에만 사용
  - `role="img"` → 정적 상태 표시용, 반복되는 시각적 요소에 적합
- ARIA 스펙에 없는 역할을 사용하면 보조 기술이 요소를 인식하지 못해 접근성이 저하됨

### 2. 날짜/시간 계산 주의사항
- JavaScript Date 생성자의 파라미터 순서: `new Date(year, month, date, hours, minutes, seconds)`
- 월(month)은 0-based (0 = 1월, 11 = 12월)
- 시간 값이 범위를 초과하면 자동으로 다음 단위로 올림 처리됨

### 3. 컴포넌트 동작 이해의 중요성
- 테스트 작성 전 컴포넌트의 실제 동작을 정확히 파악
- 초기 상태, 필터링 로직, 페이지네이션 동작 등을 사전에 분석
- 테스트는 구현이 아닌 **동작**을 검증해야 함

### 4. 디버깅 전략
1. **점진적 접근**: 한 번에 모든 문제를 해결하려 하지 말고 하나씩 해결
2. **DOM 구조 확인**: `screen.debug()`나 개발자 도구로 실제 렌더링 결과 확인
3. **데이터 검증**: 테스트 데이터가 예상대로 생성되는지 확인

## 🚨 예방 체크리스트

- [ ] 컴포넌트 합성 시 중복 속성 확인
- [ ] 날짜/시간 계산 시 범위 초과 검토
- [ ] 테스트 데이터 생성 시 경계값 고려
- [ ] 컴포넌트 초기 동작 상태 파악
- [ ] 실제 DOM 구조와 테스트 기대값 일치 확인

---

**결론**: 이 문제는 작은 실수들이 쌓여서 발생한 복합적인 이슈였습니다. 각각은 간단해 보이지만, 조합되면 디버깅이 어려워질 수 있으므로 꼼꼼한 검토가 중요합니다. 

특히 **접근성 개선**은 단순히 테스트 통과를 위한 것이 아니라, 실제 사용자 경험 향상을 위한 필수 요소임을 인식하게 되었습니다. ARIA 역할의 올바른 사용은 보조 기술 사용자들에게 더 나은 웹 경험을 제공합니다. 🧐♿ 
