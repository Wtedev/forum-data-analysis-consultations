export type ConsultationFormState = {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  currentStage: string;
  university: string;
  majorInterest: string;
  consultationType: string;
  preferredConsultant: string;
  tools: string[];
  question: string;
  link: string;
  preferredContactMethod: string;
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
  preferredConsultant: "",
  tools: [],
  question: "",
  link: "",
  preferredContactMethod: "",
};
