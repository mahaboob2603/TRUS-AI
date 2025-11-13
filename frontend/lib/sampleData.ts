export type LoanFeatureFormState = Record<string, string>;

export const DEFAULT_LOAN_FEATURES: LoanFeatureFormState = {
  Gender: "Female",
  Married: "No",
  Dependents: "0",
  Education: "Graduate",
  Self_Employed: "No",
  ApplicantIncome: "4800",
  CoapplicantIncome: "1400",
  LoanAmount: "128",
  Loan_Amount_Term: "360",
  Credit_History: "1",
  Property_Area: "Urban"
};

export const SAMPLE_APPLICATIONS: Array<{
  label: string;
  customerId: string;
  features: LoanFeatureFormState;
}> = [
  {
    label: "High credit, moderate amount (likely approved)",
    customerId: "CUST-001",
    features: {
      Gender: "Female",
      Married: "Yes",
      Dependents: "1",
      Education: "Graduate",
      Self_Employed: "No",
      ApplicantIncome: "6200",
      CoapplicantIncome: "1800",
      LoanAmount: "150",
      Loan_Amount_Term: "360",
      Credit_History: "1",
      Property_Area: "Semiurban"
    }
  },
  {
    label: "Thin credit, high leverage (likely denied)",
    customerId: "CUST-002",
    features: {
      Gender: "Male",
      Married: "No",
      Dependents: "0",
      Education: "Not Graduate",
      Self_Employed: "Yes",
      ApplicantIncome: "3200",
      CoapplicantIncome: "0",
      LoanAmount: "210",
      Loan_Amount_Term: "360",
      Credit_History: "0",
      Property_Area: "Rural"
    }
  },
  {
    label: "Manual review scenario",
    customerId: "CUST-003",
    features: {
      Gender: "Female",
      Married: "Yes",
      Dependents: "3+",
      Education: "Graduate",
      Self_Employed: "No",
      ApplicantIncome: "4500",
      CoapplicantIncome: "2000",
      LoanAmount: "180",
      Loan_Amount_Term: "300",
      Credit_History: "1",
      Property_Area: "Urban"
    }
  }
];

