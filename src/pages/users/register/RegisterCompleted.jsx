import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/basic/Button";
import Stepper from "../../../components/register/Stepper";

import styles from "./RegisterCompleted.module.css";

export default function RegisterCompleted({ step, onNext }) {
  const navigate = useNavigate();

  return (
    <div className={styles.registerContainer}>
      <Stepper currentStep={step} />

      <h1>
        <b>회원가입</b>이 완료되었습니다.
      </h1>

      <Button
        onClick={() => {
          if (onNext) onNext();
          navigate("/login");
        }}
      >
        로그인 하기
      </Button>
    </div>
  );
}
