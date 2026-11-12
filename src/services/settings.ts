import { apiRequest } from "./api";
import type { ApiData } from "./api";

export interface AssociationSettings {
  id: string;
  name: string;
  slogan: string;
  introduction: string;
  introductionVideoUrl?: string;
  mission: string;
  department: string;
  address: string;
  hours: string;
  phone: string;
  email: string;
  zaloUrl: string;
  assistantGreeting: string;
  assistantQuestions: string;
}

export async function getAssociationSettings(): Promise<AssociationSettings> {
  return (await apiRequest<ApiData<AssociationSettings>>("public/settings")).data;
}

export function parseAssistantQuestions(value: string) {
  return value.split(/\r?\n/).reduce<{ question: string; answer: string }[]>((questions, line) => {
    const separator = line.indexOf("|");
    const question = line.slice(0, separator).trim();
    const answer = line.slice(separator + 1).trim();
    if (separator > 0 && question && answer) questions.push({ question, answer });
    return questions;
  }, []);
}
