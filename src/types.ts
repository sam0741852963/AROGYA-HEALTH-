export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'patient' | 'admin';
  createdAt: any;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  experience: number;
  chargesINR: number;
  availability: string[];
  hospital: string;
  image: string;
  bio: string;
  rating: number;
  education: string;
  locality: string;
  clinicName?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  reason?: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: any;
}

export interface Disease {
  id: string;
  name: string;
  description: string;
  symptoms: string;
  causes: string;
  treatments: string;
  image: string;
}

export interface AnalysisReport {
  id: string;
  userId: string;
  query: string;
  report: string;
  createdAt: any;
}

export const DEPARTMENTS = [
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Pediatrics",
  "Dermatology",
  "General Medicine",
  "Gynecology",
  "Oncology",
  "Ophthalmology"
];

export const HOSPITALS = [
  "City Care Hospital",
  "Aarogya Multi-speciality",
  "Heritage Medical Center",
  "Unity Health Clinic"
];
