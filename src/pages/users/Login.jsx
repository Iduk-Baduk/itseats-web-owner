import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <h1>로그인 페이지</h1>
      <Link to="/sales">가맹점 페이지 이동 (임시)</Link>
      <Link to="/register">회원가입 이동 (임시)</Link>
    </div>
  );
}
