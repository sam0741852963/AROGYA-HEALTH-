import { Doctor, Disease } from './types';

export const SEED_DOCTORS: Partial<Doctor>[] = [
  {
    name: "Dr. Ashok Seth",
    specialization: "Chairman - Fortis Escorts Heart Institute",
    department: "Cardiology",
    experience: 38,
    chargesINR: 2500,
    availability: ["Mon", "Tue", "Wed", "Thu"],
    hospital: "Fortis Escorts",
    locality: "Okhla, New Delhi",
    education: "MBBS, MD, FRCP, MRCP",
    rating: 5.0,
    image: "https://picsum.photos/seed/ashok/400/400",
    bio: "Internationally acclaimed cardiologist, awarded Padma Bhushan for contributions to cardiac sciences."
  },
  {
    name: "Dr. Naresh Trehan",
    specialization: "Cardiovascular and Cardiothoracic Surgeon",
    department: "Cardiology",
    experience: 40,
    chargesINR: 3000,
    availability: ["Tue", "Thu", "Fri"],
    hospital: "Medanta - The Medicity",
    locality: "Guragon, Haryana",
    education: "MBBS, Diplomate (American Board)",
    rating: 4.9,
    image: "https://picsum.photos/seed/naresh/400/400",
    bio: "Founder of Medanta, specializes in complex robotic cardiac surgeries."
  },
  {
    name: "Dr. Prathap C. Reddy",
    specialization: "Senior Cardiologist",
    department: "Cardiology",
    experience: 45,
    chargesINR: 2000,
    availability: ["Mon", "Wed", "Fri"],
    hospital: "Apollo Hospitals",
    locality: "Greams Road, Chennai",
    education: "MBBS, FCCP, FACC",
    rating: 4.8,
    image: "https://picsum.photos/seed/prathap/400/400",
    bio: "Architect of modern health care in India and the founder-chairman of the Apollo Hospitals Group."
  },
  {
    name: "Dr. Devi Prasad Shetty",
    specialization: "Cardiac Surgeon",
    department: "Cardiology",
    experience: 35,
    chargesINR: 1500,
    availability: ["Wed", "Sat"],
    hospital: "Narayana Health City",
    locality: "Bommasandra, Bangalore",
    education: "MBBS, MS, FRCS",
    rating: 5.0,
    image: "https://picsum.photos/seed/devi/400/400",
    bio: "Renowned cardiac surgeon providing affordable high-quality heart care for all."
  }
];

export const SEED_DISEASES: Partial<Disease>[] = [
  {
    name: "Type 2 Diabetes",
    description: "A chronic condition that affects the way the body processes blood sugar (glucose).",
    symptoms: "Increased thirst, frequent urination, hunger, fatigue, and blurred vision.",
    causes: "Genetic factors and lifestyle choices such as being overweight and inactive.",
    treatments: "Diet, exercise, medication, and insulin therapy.",
    image: "https://picsum.photos/seed/diabetes/800/600"
  },
  {
    name: "Hypertension",
    description: "A condition in which the force of the blood against the artery walls is too high.",
    symptoms: "Often has no symptoms, but can cause headaches, shortness of breath, or nosebleeds.",
    causes: "Age, family history, obesity, and high salt intake.",
    treatments: "Lifestyle changes and blood pressure medication.",
    image: "https://picsum.photos/seed/heart/800/600"
  },
  {
    name: "Migraine",
    description: "A neurological condition that can cause multiple symptoms, most notably intense headaches.",
    symptoms: "Pulsing/throbbing pain, sensitivity to light/sound, and nausea.",
    causes: "Genetic and environmental factors; triggers include stress and certain foods.",
    treatments: "Pain-relieving and preventive medications.",
    image: "https://picsum.photos/seed/brain/800/600"
  },
  {
    name: "Asthma",
    description: "A condition in which a person's airways become inflamed, narrow, and swell.",
    symptoms: "Difficulty breathing, chest pain, cough, and wheezing.",
    causes: "Environmental triggers, allergies, and respiratory infections.",
    treatments: "Inhalers (bronchodilators) and steroids.",
    image: "https://picsum.photos/seed/lung/800/600"
  }
];
