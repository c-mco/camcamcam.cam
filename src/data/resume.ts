import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  citizenship: string;
  phone: string;
  email: string;
  website: string;
  summary: string;
}

export interface MetricHighlight {
  metric: string;
  label: string;
}

export interface Achievement {
  title: string;
  description: string;
  tags: string[];
}

export interface LeadershipRole {
  role: string;
  company: string;
  industry: string;
  period: string;
  location: string;
  achievements: Achievement[];
}

export interface PriorRole {
  role: string;
  company: string;
  location?: string;
  description: string;
}

export interface PriorExperience {
  period: string;
  roles: PriorRole[];
}

export interface IstqbCert {
  title: string;
  year: string;
  issuer: string;
}

export interface ProfessionalDevelopment {
  istqbCertifications: IstqbCert[];
  technicalSkills: string[];
}

export interface ResumeData {
  personal: PersonalInfo;
  highlights: MetricHighlight[];
  leadershipExperience: LeadershipRole[];
  previousExperience: PriorExperience;
  professionalDevelopment: ProfessionalDevelopment;
}

export function getResumeData(customPath?: string): ResumeData {
  const filePath = customPath || path.resolve(process.cwd(), 'src/data/resume.yaml');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = YAML.parse(fileContents) as ResumeData;
  return data;
}

export const resume = getResumeData();
