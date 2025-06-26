import { useState } from "react";
import Button from "../../../components/basic/Button";
import TextInput from "../../../components/basic/TextInput";
import Stepper from "../../../components/register/Stepper";

import styles from "./RegisterStepThreeBizInfo.module.css";

export default function RegisterStepThreeBizInfo({ step, data, onSubmit }) {
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
        <b>매장 등록, 정산에</b>필요한 정보를 등록해주세요.
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
      <Button children="다음" onClick={() => onSubmit(values)} disabled={!allFilled} />
    </div>
  );
}
