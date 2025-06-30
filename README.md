# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## 데이터베이스 마이그레이션

### 타임스탬프 형식 마이그레이션

기존 데이터베이스의 타임스탬프를 ISO 8601 형식으로 표준화하기 위해 다음 명령을 실행하세요:

```bash
npm run migrate:timestamps
```

이 마이그레이션은 다음 작업을 수행합니다:
- POS 상태 이력의 타임스탬프 정규화
- 설정 업데이트 시간 정규화
- 자동화 설정 업데이트 시간 정규화

마이그레이션이 완료되면 `.timestamp_migrated` 파일이 생성되어 마이그레이션 완료를 표시합니다.
