import { 
  Heart, 
  Bone, 
  Brain, 
  Baby, 
  User, 
  Stethoscope, 
  Microscope, 
  Eye, 
  Activity,
  Shield,
  Thermometer,
  Syringe
} from 'lucide-react';
import React from 'react';

export const SPECIALIZATION_ICONS: Record<string, React.ReactNode> = {
  "Cardiology": <Heart size={18} />,
  "Orthopedics": <Bone size={18} />,
  "Neurology": <Brain size={18} />,
  "Pediatrics": <Baby size={18} />,
  "Dermatology": <Activity size={18} />,
  "General Medicine": <Stethoscope size={18} />,
  "Gynecology": <Baby size={18} />,
  "Oncology": <Microscope size={18} />,
  "Ophthalmology": <Eye size={18} />,
  "Dentist": <Activity size={18} />,
  "Psychiatry": <Brain size={18} />,
  "ENT Specialist": <Activity size={18} />,
  "Urology": <Activity size={18} />,
  "Default": <Stethoscope size={18} />
};

export function getSpecializationIcon(specialization: string) {
  return SPECIALIZATION_ICONS[specialization] || SPECIALIZATION_ICONS["Default"];
}
