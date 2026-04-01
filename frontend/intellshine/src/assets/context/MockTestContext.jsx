import { createContext, useState } from "react";

export const MockTestContext = createContext();

export const MockTestProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [testInfo, setTestInfo] = useState({});

  return (
    <MockTestContext.Provider
      value={{
        questions,
        setQuestions,   // ✅ MUST BE HERE
        answers,
        setAnswers,
        result,
        setResult,
        testInfo,
        setTestInfo     // ✅ MUST BE HERE
      }}
    >
      {children}
    </MockTestContext.Provider>
  );
};