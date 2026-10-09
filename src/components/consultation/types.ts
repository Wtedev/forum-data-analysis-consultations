export type ConsultationFormState = {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  currentStage: string;
  university: string;
  majorInterest: string;
  consultationType: string;
  tools: string[];
  question: string;
  link: string;
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
  tools: [],
  question: "",
  link: "",
};
