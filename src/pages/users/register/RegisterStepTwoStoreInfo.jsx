import { useState } from "react";
import Button from "../../../components/basic/Button";
import TextInput from "../../../components/basic/TextInput";
import Stepper from "../../../components/register/Stepper";

import styles from "./RegisterStepTwoStoreInfo.module.css";

export default function RegisterStepTwoStoreInfo({ step, data, onNext }) {
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
        <b>매장 기본 정보</b>를 알려주세요.
      </h1>

      {data?.map((field, idx) =>
        field.type === "textarea" ? (
          <textarea
            key={idx}
            value={values[idx]}
            placeholder={field.placeholder}
            onChange={(e) => handleChange(idx, e.target.value)}
            className={styles.textarea}
          />
        ) : (
          <TextInput
            key={idx}
            type={field.type}
            value={values[idx]}
            placeholder={field.placeholder}
            onChange={(e) => handleChange(idx, e.target.value)}
          />
        )
      )}
      <Button children="다음" onClick={() => onNext(values)} disabled={!allFilled} />
    </div>
  );
}
