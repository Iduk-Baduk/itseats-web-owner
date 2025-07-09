import { useState } from "react";
import Button from "../../../components/basic/Button";
import TextInput from "../../../components/basic/TextInput";
import Stepper from "../../../components/register/Stepper";

import styles from "./RegisterStepOneUserInfo.module.css";

export default function RegisterStepOneUserInfo({ step, data, onNext, isLoading }) {
  const [values, setValues] = useState(Array(data.length).fill(""));
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

  const emailRegEx =
    /^[A-Za-z0-9]([-_.]?[A-Za-z0-9])*@[A-Za-z0-9]([-_.]?[A-Za-z0-9])*\.[A-Za-z]{2,3}$/i;
  const passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

  const handleChange = (index, value) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    const field = data[index];

    if (field.type === "email") {
      setEmailError(emailRegEx.test(value) ? "" : "올바른 이메일 형식이 아닙니다.");
    } else {
      setEmailError("");
    }

    if (field.info === "password") {
      setPasswordError(
        passwordRegEx.test(value) ? "" : "비밀번호는 최소 8자리, 영문, 숫자, 특수문자를 포함해야 합니다."
      );
      // 입력값이 바뀌면 확인칸 일치도 다시 확인
      const confirmIndex = data.findIndex((f) => f.info === "passwordConfirm");
      if (values[confirmIndex] && values[confirmIndex] !== value) {
        setPasswordConfirmError("비밀번호가 일치하지 않습니다.");
      } else {
        setPasswordConfirmError("");
      }
    }

    if (field.info === "passwordConfirm") {
      const passwordIndex = data.findIndex((f) => f.info === "password");
      setPasswordConfirmError(
        value === values[passwordIndex] ? "" : "비밀번호가 일치하지 않습니다."
      );
    }
  };

  const allFilled = values.every((v) => v && v.trim() !== "");
  const allValid = allFilled && !emailError && !passwordError && !passwordConfirmError;

  return (
    <div className={styles.registerContainer}>
      <Stepper currentStep={step} />

      <h1>
        쿠팡이츠 <br />
        <b>스토어 회원</b>이 되어보세요
      </h1>
      <div className={styles.description}>
        회원가입은 쿠팡이츠 <strong>파트너센터(1234-1234)</strong>를 통해서도 가능합니다.
      </div>
      {data?.map((field, idx) => (
        <>
          <TextInput
            key={idx}
            value={values[idx]}
            type={field.type}
            placeholder={field.placeholder}
            onChange={(e) => handleChange(idx, e.target.value)}
          />
          {field.type === "email" && emailError && (
            <div style={{ color: "red", fontSize: "0.9rem" }}>{emailError}</div>
          )}
          {field.info === "password" && passwordError && (
            <div style={{ color: "red", fontSize: "0.9rem" }}>{passwordError}</div>
          )}
          {field.info === "passwordConfirm" && passwordConfirmError && (
            <div style={{ color: "red", fontSize: "0.9rem" }}>{passwordConfirmError}</div>
          )}
        </>
      ))}
      <Button onClick={() => onNext(values)} disabled={!allFilled || !allValid || isLoading}>
        다음
      </Button>
    </div>
  );
}
