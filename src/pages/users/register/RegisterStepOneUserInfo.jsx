import { useState } from "react";
import Button from "../../../components/basic/Button";
import TextInput from "../../../components/basic/TextInput";
import Stepper from "../../../components/register/Stepper";

import styles from "./RegisterStepOneUserInfo.module.css";

export default function RegisterStepOneUserInfo({ step, data, onNext }) {
  const [values, setValues] = useState(Array(data.length).fill(""));

  const handleChange = (index, value) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const allFilled = values.every((v) => v && v.trim() !== "");

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
        <TextInput
          key={idx}
          value={values[idx]}
          placeholder={field.placeholder}
          onChange={(e) => handleChange(idx, e.target.value)}
        />
      ))}
      <Button children="다음" onClick={() => onNext(values)} disabled={!allFilled} />
    </div>
  );
}
