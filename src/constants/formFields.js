export const USER_INFO = [
  {
    info: "BusinessRegistrationNumber",
    placeholder: "사업자등록번호 (숫자만 입력)",
    type: "number",
  },
  { info: "username", placeholder: "아이디", type: "text" },
  { info: "email", placeholder: "이메일", type: "email" },
  { info: "password", placeholder: "비밀번호", type: "password" },
  { info: "passwordConfirm", placeholder: "비밀번호 확인", type: "password" },
  { info: "name", placeholder: "이름", type: "text" },
  { info: "nickname", placeholder: "닉네임", type: "text" },
  { info: "phone", placeholder: "휴대폰번호 (010-0000-0000)", type: "text" },
];

export const STORE_INFO = [
  { info: "storeName", placeholder: "상호", type: "text" },
  { info: "storeTel", placeholder: "매장 전화번호 (숫자만 입력)", type: "text" },
  { info: "storeManagerName", placeholder: "매장 담당자 이름", type: "text" },
  { info: "storeManagerPhone", placeholder: "담당자 연락처 (숫자만 입력)", type: "text" },
  { info: "storeAddress", placeholder: "주소 검색", type: "text" },
  { info: "storeAddressDetail", placeholder: "상세주소", type: "text" },
  {
    info: "storeDescription",
    placeholder: "매장 위치 상세 설명 (최대 50자, 선택사항)",
    type: "textarea",
  },
];

export const BUSINESS_REGISTRATION = [
  { info: "bank", placeholder: "은행 선택", type: "comboBox" },
  { info: "accountNumber", placeholder: "계좌번호 (숫자만 입력)", type: "number" },
  { info: "depositor", placeholder: "예금주", type: "text" },
  { info: "birthDate", placeholder: "생년월일 (6자리)", type: "number" },
  { info: "bizName", placeholder: "사업자 등록증 기재된 상호", type: "text" },
  { info: "bizType", placeholder: "업태", type: "text" },
  { info: "bizCategory", placeholder: "업종", type: "text" },
  { info: "bizRegistrationFile", placeholder: "사업자 등록증", type: "text" },
  { info: "bankbookFile", placeholder: "통장사본", type: "api" },
  { info: "menuImage", placeholder: "메뉴판이미지 (최대 10개)", type: "text" },
  { info: "etcImages", placeholder: "기타 이미지 (최대 10개)", type: "text" },
  { info: "referralPath", placeholder: "유입경로", type: "text" },
];
