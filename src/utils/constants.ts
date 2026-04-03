export const CATEGORIES: string[] = [
  "All",
  "General",
  "EWS",
  "OBC-NCL",
  "SC",
  "ST",
  "PwD",
];

export const INSTITUTES: string[] = [
  "All",
  "IISc Bangalore",
  "IIT Bombay",
  "IIT Delhi",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT Guwahati",
  "IIT Hyderabad",
  "IIT BHU",
  "IIT ISM Dhanbad",
  "IIT Indore",
  "IIT Gandhinagar",
  "IIT Ropar",
  "IIT Patna",
  "IIT Bhubaneswar",
  "IIT Mandi",
  "IIT Jodhpur",
  "IIT Tirupati",
  "IIT Palakkad",
  "IIT Bhilai",
  "IIT Goa",
  "IIT Dharwad",
  "IIT Jammu",
];

export const PROGRAM_TYPES: string[] = [
  "Mtech",
  "Mtech(RA/RAP/HVA)",
  "MS",
  "MS(RA/RAP)",
];

export const ROUNDS: string[] = [
  ...Array.from({ length: 10 }, (_, i) => `Round ${i + 1}`),
  "Additional Rounds",
];
