import { useState } from "react";
import Header from "../../components/common/Header";
import styles from "./Reviews.module.css";
import TextInput from "../../components/basic/TextInput";
import UpperTextInput from "../../components/basic/UpperTextInput";
import RadioButton from "../../components/basic/RadioButton";
import Checkbox from "../../components/basic/Checkbox";
import ComboBox from "../../components/basic/ComboBox";

export default function Reviews() {
  const [sampleText, setSampleText] = useState("");

  return (
    <>
      <Header
        nickname="홍길동"
        showBackButton={true}
        onLeftClick={() => {
          console.log("뒤로가기 클릭됨");
        }}
      />
      <div className={styles.container}>
        <h1 style={{ margin: "20px 0" }}>리뷰 관리</h1>
        <h1 style={{ margin: "40px 0 20px" }}>공용 컴포넌트</h1>
        {/* 텍스트박스 1 */}
        <div className={styles.samples}>
          <TextInput
            name="textInput"
            value={sampleText}
            onChange={() => {
              setSampleText(event.target.value);
            }}
            placeholder="텍스트 입력"
            maxLength={1000}
            className={styles.textInput}
          />
        </div>
        {/* 텍스트박스 2 */}
        <div className={styles.samples}>
          <UpperTextInput
            name="textInput"
            value={sampleText}
            onChange={() => {
              setSampleText(event.target.value);
            }}
            placeholder="텍스트 입력"
            maxLength={1000}
            className={styles.textInput}
          />
          {/* 라디오 버튼 */}
          <div className={styles.samples}>
            <RadioButton
              type="radio"
              checked={false}
              onChange={() => {}}
              label="라디오 버튼"
            />
            <RadioButton
              type="radio"
              checked={true}
              onChange={() => {}}
              label="라디오 버튼"
            />
          </div>
          {/* 체크박스 */}
          <div className={styles.samples}>
            <Checkbox checked={true} onChange={() => {}} label="체크박스" />
            <Checkbox
              type="radio"
              checked={false}
              onChange={() => {}}
              label="체크박스"
            />
          </div>
          {/* 콤보박스 */}
          <div className={styles.samples}>
            <ComboBox
              name="comboBox"
              value=""
              onChange={() => {}}
              options={[
                { value: "option1", label: "옵션 1" },
                { value: "option2", label: "옵션 2" },
                { value: "option3", label: "옵션 3" },
              ]}
              placeholder="콤보박스 선택"
              className={styles.comboBox}
            />
          </div>
        </div>
      </div>
    </>
  );
}
