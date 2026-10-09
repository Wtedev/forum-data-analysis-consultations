export type ConsultationFormState = {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  currentStage: string;
  university: string;
  majorInterest: string;
  consultationType: string;
  question: string;
};

export const initialConsultationForm: ConsultationFormState = {
  fullName: "",
  phone: "",
  email: "",
  gender: "",
  currentStage: "",
  university: "",
  majorInterest: "",
  consultationType: "",
  question: "",
};
