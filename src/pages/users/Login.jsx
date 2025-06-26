import { Link } from "react-router-dom";

import Button from "../../components/basic/Button";
import TextInput from "../../components/basic/TextInput";

import styles from "./Login.module.css";

export default function Login() {
  return (
    <>
      <div className={styles.loginContainer}>
        <h1 className={styles.title}>쿠팡이츠 Portal</h1>
        <div className={styles.inputContainer}>
          <div className={styles.input}>
            <TextInput
              name="login"
              type="text"
              onChange={() => {}}
              placeholder="아이디"
              maxLength={20}
            />
            <TextInput
              name="password"
              type="password"
              onChange={() => {}}
              placeholder="비밀번호"
              maxLength={15}
            />
          </div>
          <span style={{ opacity: 0.6 }}>ⓘ 영문, 숫자, 특수문자 포함 8~15자 </span>
        </div>

        <div className={styles.registerContainer}>
          <div style={{ opacity: 0.6 }}>아직 계정이 없나요?</div>
          <Link to="/register" className={styles.register}>
            회원가입
          </Link>
        </div>

        <Button
          onClick={() => {
            alert("구현 필요");
          }}
        >
          로그인
        </Button>
      </div>
    </>
  );
}
