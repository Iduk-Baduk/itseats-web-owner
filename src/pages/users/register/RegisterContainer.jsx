import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import RegisterStepOneUserInfo from "./RegisterStepOneUserInfo";
import RegisterStepTwoStoreInfo from "./RegisterStepTwoStoreInfo";
import RegisterStepThreeBizInfo from "./RegisterStepThreeBizInfo";
import RegisterSubmitPage from "./RegisterCompleted";
import { USER_INFO, STORE_INFO, BUSINESS_REGISTRATION } from "../../../constants/formFields";
import { useAuth } from "../../../contexts/AuthContext";
import AuthAPI from "../../../services/authAPI";
import toast from "react-hot-toast";

export default function RegisterContainer() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(Number.parseInt(searchParams.get("step")) || 1);
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

  async function handleOwnerSignup(userInfo) {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await AuthAPI.register(userInfo);
      if (response.success) {
        await login({ username: userInfo.username, password: userInfo.password });
        goNext();
      } else {
        toast.error(response.message || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      toast.error(error.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

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
            handleOwnerSignup(mapValuesToInfo(values, USER_INFO));
          }}
          isLoading={isLoading}
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
