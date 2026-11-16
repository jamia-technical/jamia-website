import React from "react";
import {
  FaFlask,
  FaLandmark,
  FaLanguage,
  FaBook,
  FaQuran,
} from "react-icons/fa";
import { FiBookOpen } from "react-icons/fi";
import { MdOutlineComputer } from "react-icons/md";
import { TbReportMoney } from "react-icons/tb";
import { Programme } from "../../types";
import { BiCalculator, BiMath } from "react-icons/bi";

const bsProgrammes: Programme[] = [
  {
    id: 1,
    streamId: "BSSIRK",
    course: "School of Islamic Revealed Knowledge",
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & Arts",
      "Complete Mukhthasar course in Islamic studies",
      "Complete degree in Arabic",
    ],
    icon: <FaBook className="text-3xl text-blue-600" />,
  },
  {
    id: 2,
    streamId: "BSSCI",
    course: " School of Social Science and Civilization",
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & in Social Science and Islamic Civilization",
      "Complete Mukhthasar course in Islamic studies",
      "Complete degree in History, Sociology, Politics",
    ],
    icon: <FaLandmark className="text-3xl text-purple-600" />,
  },
  {
    id: 3,
    streamId: "BSSQA",
    course: " School of Quranic Studies and Arts",
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & Quranic Studies and Arts",
      "Complete Mukhthasar course in Islamic studies",
      "Complete degree  Humanities / Arts (Subject to selection)",
    ],
    icon: <FaQuran className="text-3xl text-green-600" />,
  },
  {
    id: 4, 
    streamId: "BSSFM",
    course: " School of Finance and Management",
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & Islamic Finance and Management Studies",
      "Complete Mukhthasar course in Islamic studies",
      "Complete degree in Commerce, Business Administration(BBA)",
    ],
    icon: <TbReportMoney className="text-3xl text-yellow-600" />,
  },
  {
    id: 5,
    streamId: "BSSL",
    course: " School of Language and Literature",
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & Language and Literature",
      "Complete Mukhthasar course in Islamic studies",
      "Complete degree in English, Arabic, Urdu",
    ],
    icon: <FaLanguage className="text-3xl text-red-600" />,
  },
  {
    id: 6,
    streamId: "BSSPT",
    course: "School of Pure Science and Technology",
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & Pure Science and Technology",
      "Complete Mukhthasar course in Islamic studies",
      "Complete degree in Medicine, Engineering, Life Science, Technology",
    ],
    icon: <FaFlask className="text-3xl text-indigo-600" />,
  },
];

const hsProgrammes: Programme[] = [
  {
    id: 1,
    streamId: "HSST",
    name: "School of Science and Technology",
    icon: <FaFlask className="text-3xl" />,
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & pure science",
      "Complete Foundation course in Islamic studies",
      "Complete HS in Science",
    ],
    image: "/photos/27.jpg",
  },
  {
    id: 2,
    streamId: "HSIT",
    name: "School of Islamic Theology and Arabic Literature",
    icon: <FiBookOpen className="text-3xl" />,
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & Arabic Literature",
      "Complete Foundation course in Islamic studies",
      "Complete HS in Arts",
    ],
    image: "/photos/25.jpg",
  },
  {
    id: 3,
    streamId: "HSCCE",
    name: "School of Civil Service",
    icon: <FaLandmark className="text-3xl" />,
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & UN Civil Service, UPSC, PSC, SSC Foundation",
      "Complete Foundation course in Islamic studies",
      "Complete HS in Arts",
    ],
    image: "/photos/61.JPG",
  },
  {
    id: 4,
    streamId: "HSFM",
    name: "School of Finance and Management",
    icon: <TbReportMoney className="text-3xl" />,
    intake: 25,
    outcomes: [
      "Integrated studies between Islamic studies & CA, CMA , ACCA , CS , CAT Foundation Course",
      "Complete Foundation course in Islamic studies",
      "Complete HS in commerc",
    ],
    image: "/photos/62.JPG",
  },
];

const hssProgrammes: Programme[] = [
  {
    id: 1,
    streamId: "HSSL",
    course: "School of Life Science (Biology)",
    intake: 25,
    outcomes: [
      "Strong grounding in Biology–Math with Science Orbit support",
      "Integrated studies between Islam & biology",
      "Complete HSS + UG pathway with Bachelor in Islamic Science",
    ],
    icon: <FaFlask className="text-3xl text-blue-600" />,
  },
  {
    id: 2,
    streamId: "HSSCS",
    course: "School of Computer Science",
    intake: 25,
    outcomes: [
      "Build strong computational and analytical foundations",
      "Complete JEE/KEAM foundation aligned with engineering pathways",
      "Complete HSS + UG in B.Tech/B.Sc with integrated Islamic studies",
    ],
    icon: <MdOutlineComputer className="text-3xl text-green-600" />,
  },
  {
    id: 3,
    streamId: "HSSAH",
    course: "School of Arts and Humanities",
    intake: 25,
    outcomes: [
      "Foundation in humanities subjects with leadership and administrative skills",
      "Complete civil service foundation (UN, UPSC, PSC, SSC)",
      "Complete HSS + UG with optional Hifz Doura for Hifz students",
    ],
    icon: <FaBook className="text-3xl text-purple-600" />,
  },
  {
    id: 4,
    streamId: "HSSFM",
    course:
      "School of Finance and Management (Senior School Level)",
    intake: 25,
    outcomes: [
      "Strong foundation in commerce with Islamic finance and Business Arabic",
      "Complete foundation for CA/CMA/ACCA/CS/CAT",
      "Complete HSS + UG progression with integrated Islamic studies",
    ],
    icon: <TbReportMoney className="text-3xl text-yellow-600" />,
  },
  {
    id: 5,
    streamId: "HSSCM", 
    course: "School of Commerce (Maths)",
    intake: 25,
    outcomes: [
      "Specialized focus on financial analysis and mathematics",
      "Foundation for advanced quantitative commerce studies",
    ],
    icon: <BiMath className="text-3xl text-blue-600" />, 
  },
  {
    id: 6,
    streamId: "HSSHM",
    course: "School of Humanities (Maths)",
    intake: 25,
    outcomes: [
      "Specialized focus on digital humanities and mathematics",
      "Integration of mathematical analytical skills with arts and humanities",
    ],
    icon: <BiCalculator className="text-3xl text-teal-600" />,
  }
];

export const getLevelByStream = (streamId: string): string => {
  if (streamId === "Rabbani") return "Rabbani";
  if (hsProgrammes.some((p) => p.streamId === streamId)) return "8";
  if (hssProgrammes.some((p) => p.streamId === streamId)) return "11";
  if (bsProgrammes.some((p) => p.streamId === streamId)) return "Degree";
  return "";
};

export const getStreamName = (streamId: string) => {
  if (streamId === "Rabbani") return "Rabbani Finishing";
  const allProgrammes = [...hsProgrammes, ...bsProgrammes, ...hssProgrammes];
  const programme = allProgrammes.find((p) => p.streamId === streamId);
  return programme ? (programme as any).course || (programme as any).name : streamId;
};

export { hsProgrammes, bsProgrammes, hssProgrammes };



export const hasSecondStep = ["HSSL","HSST","BSSIRK","BSSCI","BSSQA","BSSFM","BSSL","BSSPT","HSSCM","HSSHM"]
