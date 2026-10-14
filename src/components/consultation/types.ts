export type ConsultationFormState = {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  currentStage: string;
  projectOrTeamName: string;
  teamMemberCount: string;
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
  projectOrTeamName: "",
  teamMemberCount: "",
  consultationType: "",
  preferredConsultant: "",
  tools: [],
  question: "",
  link: "",
  preferredContactMethod: "",
};
