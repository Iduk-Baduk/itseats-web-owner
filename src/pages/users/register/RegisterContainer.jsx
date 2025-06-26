import { useState } from "react";
import RegisterStepOneUserInfo from "./RegisterStepOneUserInfo";
import RegisterStepTwoStoreInfo from "./RegisterStepTwoStoreInfo";
import RegisterStepThreeBizInfo from "./RegisterStepThreeBizInfo";
import RegisterSubmitPage from "./RegisterCompleted";
import { USER_INFO, STORE_INFO, BUSINESS_REGISTRATION } from "../../../constants/formFields";

export default function RegisterContainer() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userInfo: {},
    storeInfo: {},
    businessInfo: {},
  });

  const goNext = () => setStep((prev) => prev + 1);
  const goBack = () => setStep((prev) => prev - 1);

  const mapValuesToInfo = (values, fields) => {
    const result = {};
    fields.forEach((field, idx) => {
      result[field.info] = values[idx];
    });
    return result;
  };

  return (
    <>
      {step === 1 && (
        <RegisterStepOneUserInfo
          step={step - 1}
          data={USER_INFO}
          onNext={(values) => {
            setFormData((prev) => ({
              ...prev,
              userInfo: mapValuesToInfo(values, USER_INFO),
            }));
            goNext();
          }}
        />
      )}
      {step === 2 && (
        <RegisterStepTwoStoreInfo
          step={step - 1}
          data={STORE_INFO}
          onNext={(values) => {
            setFormData((prev) => ({
              ...prev,
              storeInfo: mapValuesToInfo(values, STORE_INFO),
            }));
            goNext();
          }}
          onBack={goBack}
        />
      )}
      {step === 3 && (
        <RegisterStepThreeBizInfo
          step={step - 1}
          data={BUSINESS_REGISTRATION}
          onSubmit={(values) => {
            const businessInfo = mapValuesToInfo(values, BUSINESS_REGISTRATION);
            const finalData = {
              ...formData,
              businessInfo,
            };
            setFormData(finalData);
            console.log(finalData);
            goNext();
          }}
          onBack={goBack}
        />
      )}
      {step === 4 && <RegisterSubmitPage step={3} />}
    </>
  );
}
