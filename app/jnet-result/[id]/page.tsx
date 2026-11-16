"use client";
import Navbar from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { JnetResult } from "@/types/jnetResult";
import {
  MdPerson,
  MdPhone,
  MdCalendarToday,
  MdSchool,
  MdLocationOn,
  MdCheckCircle,
  MdCancel,
  MdArrowBack,
  MdEmojiEvents,
  MdNote,
  MdAssignment,
  MdPeople,
  MdHourglassEmpty,
  MdCardMembership,
} from "react-icons/md";
import Link from "next/link";
import { CgSearchLoading } from "react-icons/cg";
import { FaCheckToSlot } from "react-icons/fa6";



export default function JnetResultDetail() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<JnetResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Validate localStorage access token
    const storedId = localStorage.getItem("result_check_id");
    if (!storedId || storedId.toLowerCase() !== String(params.id).toLowerCase()) {
      router.replace("/jnet-result");
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/jnet-result/${params.id}`);
        const data = await res.json();

        if (data.success) {
          setResult(data.data);
        } else {
          setError("Result not found");
        }
      } catch {
        setError("Failed to load result");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchResult();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="h-80 bg-gradient-to-br from-primary via-emerald-800 to-emerald-900" />
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <div className=" rounded-2xl p-12 flex flex-col items-center justify-center">
              <div className="h-20 w-20 border-4 border-t-primary rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-5">Loading your result...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="h-60 bg-gradient-to-br from-primary via-emerald-800 to-emerald-900" />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MdCancel className="text-3xl text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Result Not Found
              </h2>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={() => router.push("/jnet-result")}
                className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusLower = result.Status
  const isSelected = statusLower === "Selected";
  const isWaitingList = statusLower === "Waiting List";
  const isScreeningList = statusLower === "Screening List";
  const isSuggested = statusLower === "Suggested";

  // Writing test sections
  const writingSections = [
    { label: "Section A", value: result.writing_test.Section_A, max: 10 },
    { label: "Section B", value: result.writing_test.Section_B, max: 20 },
    { label: "Section C", value: result.writing_test.Section_C, max: 20 },
    { label: "Section D", value: result.writing_test.Section_D, max: 10 },
    { label: "Section E", value: result.writing_test.Section_E, max: 20 },
    { label: "Section F", value: result.writing_test.Section_F, max: 20 },
  ];

  // Interview sections
  const interviewSections = [
    {
      label: "Islamic Knowledge",
      value: result.interview.islamic_knowledge,
      max: 20,
    },
    {
      label: "Aptness for Science",
      value: result.interview.science_aptness,
      max: 15,
    },
    {
      label: "Effective Communication",
      value: result.interview.communication,
      max: 15,
    },
    {
      label: "General Awareness",
      value: result.interview.general_awareness,
      max: 15,
    },
    { 
      label: "Personal Achievements & Co-curricular", 
      value: result.interview.achievements, 
      max: 15 
    },
    { label: "Leadership Quality", value: result.interview.leadership, max: 10 },
    {
      label: "Interpersonal Skills",
      value: result.interview.interpersonal,
      max: 10,
    },
  ];

  const getPercentage = (value: number, max: number) =>
    Math.round((value / max) * 100);

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 60) return "bg-primary";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-400";
  };

const personalDetails = [
  {
    icons: <MdPerson className="text-lg text-gray-500" />,
    label :"Stream",
    value : result.stream=="HSST" ? "School of Science and Technology" : "School of life Science (Biology)"
  },
  {
    icons: <MdCardMembership className="text-lg text-gray-500" />,
    label :"Application Number",
    value : result.Application_no
  },
  {
    icons: <MdCalendarToday className="text-lg text-gray-500" />,
    label :"Date of Birth",
    value : result.dob
  },
  {
    icons: <MdPhone className="text-lg text-gray-500" />,
    label :"Phone Number",
    value : result.Phone_number
  },
]

console.log(isSelected);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <Navbar />

      {/* Hero Header */}
      <div className="relative h-72 bg-gradient-to-br from-primary via-emerald-800 to-emerald-900 w-full overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-secondary rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative h-full flex flex-col items-center justify-end pb-10">
          {/* <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-[2px] bg-secondary rounded-full" />
            <span className="text-secondary text-sm font-semibold tracking-widest uppercase">
              Result Card
            </span>
            <div className="w-10 h-[2px] bg-secondary rounded-full" />
          </div> */}
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {result.name}
          </h1>
          <p className="text-emerald-200/80 mt-1 text-xl">
            Application No:{" "}
            <span className="font-semibold text-white">
              {result.Application_no}
            </span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 p-16 relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back button */}
          {/* <button
            onClick={() => router.push("/jnet-result")}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm font-medium group"
          >
            <MdArrowBack className="group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </button> */}
{/* Personal Details */}
          <div className="bg-white rounded-2xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <MdPerson className="text-lg text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Personal Details
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {personalDetails.map((item, index) => (
                  <div key={index} className="space-y-1 flex items-center gap-3">
                  <div className="w-9 h-9 border border-gray-200 rounded-lg flex items-center  justify-center">{item.icons}</div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <p className="text-gray-900 font-medium">
                      {item.value}
                    </p>
                  </div>
                </div>
                ))}
                {/* <div className="space-y-1 flex items-center gap-3"><div className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center">
                <MdPerson className="text-lg text-primary" />
              </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Full Name
                  </span>
                  <p className="text-gray-900 font-semibold text-lg">
                    {result.name}
                  </p>
                </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Application No
                  </span>
                  <p className="text-gray-900 font-semibold text-lg">
                    {result.Application_no}
                  </p>
                </div>
                <div className="space-y-1 flex items-center gap-3">
                  <div className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center"><MdPhone className="text-lg text-primary" /></div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Phone Number
                    </span>
                    <p className="text-gray-900 font-medium">
                      {result.Phone_number}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 flex items-center gap-3">
                  <div className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center"><MdCalendarToday className="text-lg text-primary" /></div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date of Birth
                    </span>
                    <p className="text-gray-900 font-medium">
                      {new Date(result.dob).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>


          {/* Status Banner */}
          <div
            className={`rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4 ${
              isSelected
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200/50"
                : isWaitingList
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-amber-200/50"
                  : isScreeningList
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-200/50"
                    : isSuggested
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200/50"
                      : "bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200/50"
            }`}
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              {isSelected ? (
                <MdCheckCircle className="text-3xl text-white" />
              ) : isWaitingList ? (
                <MdHourglassEmpty className="text-3xl text-white" />
              ) : isScreeningList ? (
                <CgSearchLoading className="text-3xl text-white" />
              ) : isSuggested ? (
                <FaCheckToSlot className="text-3xl text-white" />
              ) : (
                <MdCancel className="text-3xl text-white" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white capitalize">
                {result.Status}
              </h2>
              {isSelected && (
                <p className="text-white/80">
                  Assigned Campus:{" "}
                  <span className="font-semibold text-white">
                    {result.campus}
                  </span>
                </p>
              )}
            </div>
            {/* <div className="sm:ml-auto flex flex-col items-center bg-white/20 rounded-xl px-6 py-3">
              <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
                Grand Total
              </span>
              <span className="text-3xl font-bold text-white">
                {result.Grand_total}
              </span>
              <span className="text-white/60 text-xs">out of 200</span>
            </div> */}
          </div>

          {/* Additional Note */}
          {isSelected ? (
            <div className="bg-green-50 rounded-xl border border-green-400 overflow-hidden p-6">
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-bold text-primary">Congratulations on your selection!</span>
                    <br />
Please secure your seat by completing the admission process on/before Saturday 25th april 2026. 
To do this, simply visit us at the Jamia Madeenathunnoor Academic Office in Poonoor.
                  </p>
            </div>
          ) : isWaitingList ? (
            <div className="bg-amber-50 rounded-xl border border-amber-400 overflow-hidden p-6">
                  <p className="text-gray-700 leading-relaxed">
                    <span className="font-bold text-amber-600">You are currently on the waitlist.</span>
                    <br />Thank you for your patience. We will update your final admission status in 2 to 3 days as seats become available. Please check back here soon!
                  </p>
            </div>
          ) : isSuggested && result.stream === "HSST" ? (
            <div className="bg-blue-50 rounded-xl border border-blue-400 overflow-hidden p-6">
                    <p className="font-bold text-lg text-blue-600">You have been recommended!</p>
                  <p className="text-gray-700">
                    You successfully qualified in our selection! Since you preferred <span className="font-semibold">Darul Hidaya</span>, we have forwarded your profile to their management. 
                    <br />Please remember that you still need to apply and attend the <span className="font-semibold">JSAT exam on May 2nd.</span></p>
            </div>
          ) : isSuggested && result.stream === "HSSL" ? (
            <div className="bg-blue-50 rounded-xl border border-blue-400 overflow-hidden p-6">
                    <p className="font-bold text-lg text-blue-600">You have qualified the JNET Exam!</p>
                  <p className="text-gray-700">
                    Since you indicated a preference for the Humanities stream, your next step is to apply to Jamia Madeenathunnoor specialized Humanities campuses.
Please register through the Jamiathul Hind Single Window system and make sure to attend the JSAT exam on May 2nd, 2026. Click <Link href="https://admission.jamiathulhind.com/plus1/register" className="text-blue-700" target="_blank" rel="noopener noreferrer">https://admission.jamiathulhind.com/plus1/register</Link> to register.</p>
            </div>
          ) :isScreeningList ? (
            <div className="bg-orange-50 rounded-xl border border-orange-400 overflow-hidden p-6">
                    <p className="font-bold text-lg text-orange-600">You are on the screening list.</p>
                  <p className="text-gray-700">
                   Your profile requires one short additional step before a final decision can be made. 
                   <br />We will be arranging an online screening for you very soon. Please stay tuned for the details!</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-400 overflow-hidden p-6">
                    <p className="font-bold text-lg text-gray-600">Thank you for attending the JNET exam.</p>
                  <p className="text-gray-700">
                    While you were not selected for this specific campus, we would love to see you continue your educational journey with us! We strongly encourage you to explore other Jamia Madeenathunnoor campuses by applying through the Jamiathul Hind Single Window System.
                    <br /><span className="font-semibold">Apply here:</span> <a href="https://admission.jamiathulhind.com/8th/register" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">admission.jamiathulhind.com/8th/register</a>
                  </p>
            </div>
          )
          }

          

          {/* Grand Total Summary */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-l-xl p-5">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Written test
                  </span>
                  <p className="text-3xl font-bold text-gray-700 mt-1">
                    {result.writing_test.total}
                  </p>
                  <span className="text-xs text-gray-400">out of 100</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-5">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview
                  </span>
                  <p className="text-2xl font-bold text-gray-700 mt-1">
                    {result.interview.total}
                  </p>
                  <span className="text-xs text-gray-400">out of 100</span>
                </div>
                <div
                  className={`rounded-xl p-5 ${isSelected ? "bg-emerald-50" : "bg-amber-50"}`}
                >
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${isSelected ? "text-emerald-500" : "text-amber-500"}`}
                  >
                    Grand Total
                  </span>
                  <p
                    className={`text-2xl font-bold mt-1 ${isSelected ? "text-emerald-700" : "text-amber-700"}`}
                  >
                    {result.Grand_total}
                  </p>
                  <span
                    className={`text-xs ${isSelected ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    out of 200
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Campus & Status */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <MdEmojiEvents className="text-lg text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900">Selection Status</h3>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold capitalize ${
                  isSelected
                    ? "bg-emerald-50 text-emerald-700"
                    : isWaitingList
                      ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                }`}
              >
                {isSelected ? (
                  <MdCheckCircle className="text-lg" />
                ) : isWaitingList ? (
                  <MdHourglassEmpty className="text-lg" />
                ) : (
                  <MdCancel className="text-lg" />
                )}
                {result.Status}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <MdLocationOn className="text-lg text-secondary" />
                </div>
                <h3 className="font-bold text-gray-900">Assigned Campus</h3>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {result.campus || "—"}
              </p>
            </div>
          </div> */}

          

          {/* Marks Breakdown - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Writing Test */}
            <div className="bg-white rounded-2xl   border border-gray-200 overflow-hidden">
              <div className="py-3 px-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <MdAssignment className="text-lg text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Written test
                  </h3>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold">
                  {result.writing_test.total}/100
                </div>
              </div>
              <div className="p-6 space-y-4">
                {writingSections.map((section) => {
                  const pct = getPercentage(section.value, section.max);
                  return (
                    <div key={section.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-700">
                          {section.label}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {section.value}
                          <span className="text-gray-400 font-normal">
                            /{section.max}
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Total row */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-blue-600">
                    {result.writing_test.total}
                    <span className="text-gray-400 text-sm font-normal">
                      /100
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Interview */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                    <MdPeople className="text-lg text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Interview</h3>
                </div>
                <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-bold">
                  {result.interview.total}/100
                </div>
              </div>
              <div className="p-6 space-y-4">
                {interviewSections.map((section) => {
                  const pct = getPercentage(section.value, section.max);
                  return (
                    <div key={section.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-medium text-gray-700">
                          {section.label}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {section.value}
                          <span className="text-gray-400 font-normal">
                            /{section.max}
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Total row */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-purple-600">
                    {result.interview.total}
                    <span className="text-gray-400 text-sm font-normal">
                      /100
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-400">
              This is an official result published by <span className="font-semibold text-gray-700">Jamia Madeenathunnoor</span>.
              <br />For any discrepancies, please contact the admission office.
              <Link href="tel:+918111860043" className="text-blue-600 hover:underline">+91 81118 60043 </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
