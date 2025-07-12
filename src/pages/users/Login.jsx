import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/basic/Button";
import TextInput from "../../components/basic/TextInput";
import styles from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login(credentials);
      navigate('/pos/orders');  // 로그인 성공 시 POS 주문 페이지로 이동
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.loginContainer}>
        <h1 className={styles.title}>쿠팡이츠 Portal</h1>
        <div className={styles.inputContainer}>
          <div className={styles.input}>
            <TextInput
              name="username"
              type="text"
              value={credentials.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="아이디"
              maxLength={20}
            />
            <TextInput
              name="password"
              type="password"
              value={credentials.password}
              onChange={(e) => handleChange('password', e.target.value)}
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
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '로그인 중...' : '로그인'}
        </Button>
      </div>
    </>
  );
}
