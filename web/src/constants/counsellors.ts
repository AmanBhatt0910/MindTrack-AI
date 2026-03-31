export interface Counsellor {
  id: string;
  name: string;
  specialty: string[];
  experience: string;
  language: string[];
  rating: number;
  reviews: number;
  available: boolean;
  nextSlot: string;
  fee: string;
  avatar: string;
  bio: string;
}

export const COUNSELLORS: Counsellor[] = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    specialty: ["Depression", "Anxiety", "Stress"],
    experience: "8 years",
    language: ["English", "Hindi"],
    rating: 4.9,
    reviews: 142,
    available: true,
    nextSlot: "Today, 3:00 PM",
    fee: "₹800",
    avatar: "PS",
    bio: "Specializing in cognitive behavioral therapy for depression and anxiety disorders.",
  },
  {
    id: "2",
    name: "Dr. Arjun Mehta",
    specialty: ["PTSD", "Trauma", "Bipolar"],
    experience: "12 years",
    language: ["English", "Hindi", "Gujarati"],
    rating: 4.8,
    reviews: 98,
    available: true,
    nextSlot: "Tomorrow, 10:00 AM",
    fee: "₹1000",
    avatar: "AM",
    bio: "Expert in trauma-focused therapy and EMDR for PTSD recovery.",
  },
  {
    id: "3",
    name: "Ms. Kavita Reddy",
    specialty: ["Relationships", "Self-esteem", "Anxiety"],
    experience: "5 years",
    language: ["English", "Telugu", "Hindi"],
    rating: 4.7,
    reviews: 67,
    available: false,
    nextSlot: "Wed, 2:00 PM",
    fee: "₹600",
    avatar: "KR",
    bio: "Helping individuals build healthier relationships and improve self-worth.",
  },
  {
    id: "4",
    name: "Dr. Rahul Singh",
    specialty: ["OCD", "Phobias", "Stress"],
    experience: "10 years",
    language: ["English", "Hindi"],
    rating: 4.9,
    reviews: 123,
    available: true,
    nextSlot: "Today, 5:30 PM",
    fee: "₹900",
    avatar: "RS",
    bio: "Specialist in exposure therapy for OCD and specific phobias.",
  },
  {
    id: "5",
    name: "Ms. Ananya Iyer",
    specialty: ["Adolescents", "Depression", "Academic Stress"],
    experience: "6 years",
    language: ["English", "Tamil", "Hindi"],
    rating: 4.8,
    reviews: 89,
    available: true,
    nextSlot: "Today, 4:00 PM",
    fee: "₹700",
    avatar: "AI",
    bio: "Dedicated to supporting young adults through academic and personal challenges.",
  },
  {
    id: "6",
    name: "Dr. Suresh Patel",
    specialty: ["Addiction", "Grief", "Life Transitions"],
    experience: "15 years",
    language: ["English", "Hindi", "Marathi"],
    rating: 4.9,
    reviews: 201,
    available: false,
    nextSlot: "Thu, 11:00 AM",
    fee: "₹1200",
    avatar: "SP",
    bio: "Extensive experience helping individuals through major life transitions and recovery.",
  },
];

export const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];
