"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { indiaData } from "@/assets/data/states_data";
import { hsProgrammes, bsProgrammes, hssProgrammes, hasSecondStep } from "@/assets/data/programmes";
import { encodeId } from "@/functions/uid_encode";

interface FormData {
  name: string;
  place: string;
  district: string;
  state: string;
  stream: string;
  whatsapp: string;
  level: string;
}

interface FormErrors {
  name?: string | null;
  place?: string | null;
  district?: string | null;
  state?: string | null;
  stream?: string | null;
  whatsapp?: string | null;
  level?: string | null;
}

const ApplicationFormInner: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    place: "",
    district: "",
    state: "Kerala",
    stream: "",
    whatsapp: "",
    level: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const districts = useMemo(() => {
    const stateData = indiaData.find((s: any) => s.state === formData.state);
    return stateData ? stateData.districts : [];
  }, [formData.state]);

  const filteredStreams = useMemo(() => {
    switch (formData.level) {
      case "11":
        return hssProgrammes.map((p: any) => ({ id: p.streamId, name: p.course }));
      case "8":
        return hsProgrammes.map((p: any) => ({ id: p.streamId, name: p.name }));
      case "Degree":
        return bsProgrammes.map((p: any) => ({ id: p.streamId, name: p.course }));
      default:
        return [];
    }
  }, [formData.level]);

  useEffect(() => {
    const level = searchParams?.get("level");
    const stream = searchParams?.get("stream");
    if (level) {
      setFormData((prev) => ({
        ...prev,
        level,
        ...(stream ? { stream } : {}),
      }));
    }
    if (stream) {
      setFormData((prev) => ({ ...prev, stream }));
    }
  }, [searchParams]);

  const levels = [
    { value: "8", label: "Standard 8" },
    { value: "11", label: "+1 (Plus One)" },
    { value: "Degree", label: "Degree" },
    { value: "Rabbani", label: "Rabbani Finishing" },
  ];

  const validate = (): boolean => {
    let tempErrors: FormErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.whatsapp.trim()) {
      tempErrors.whatsapp = "WhatsApp number is required";
    } else if (!/^\d{9,12}$/.test(formData.whatsapp.replace(/\D/g, ""))) {
      tempErrors.whatsapp = "Please enter a valid 9-12 digit number";
    }
    if (!formData.place) tempErrors.place = "Please enter your place";
    if (!formData.district) tempErrors.district = "Please enter your district";
    if (!formData.state) tempErrors.state = "Please select your state";
    if (!formData.level) tempErrors.level = "Please select a level";
    if (!formData.stream && formData.level !== "Rabbani") tempErrors.stream = "Please select a stream";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "state") {
      setFormData({ ...formData, state: value, district: "" });
    } else if (name === "level") {
      setFormData({ ...formData, level: value, stream: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const GroupsLink: Record<string, string> = {
    "8": "https://chat.whatsapp.com/Klnngas45Eo7WvgHWnYNaQ?mode=hqrt3",
    "11": "https://chat.whatsapp.com/G3lmynofCpJ4IftJfqvn8T?mode=hqrt3",
    "Degree": "https://chat.whatsapp.com/E4McCeAxIkRDQNpWqsIptS",
    "Rabbani": "https://chat.whatsapp.com/FYPIm8g3qISHod4FBarYSp",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (validate()) {
      try {
        const response = await fetch("/api/getadmn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok && (hasSecondStep.includes(formData.stream))) {
          router.push(`/Programmes/ApplicationForm/${encodeId(data.data.id)}`);
        } else if (response.ok) {
          setSubmitted(true);
        } else {
          alert("Error: " + (data.error || "Something went wrong"));
        }
      } catch (err) {
        alert("Failed to submit application. Please try again.");
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  const ApplicationSteps = [
    {
      id: 1,
      title: "Fill Details",
      description: "Complete the online form with your correct details",
    },
    {
      id: 2,
      title: "Submit Application",
      description: "Submit the application form",
    },
    {
      id: 3,
      title: "Get Admission",
      description: "Get admission in our academic programmes",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="relative h-40 md:h-64 bg-green-900 pt-80 pb-10 lg:py-40">
        <Image src="/photos/20.jpg" alt="HS Programme Students" fill className="object-cover opacity-80" priority />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Get Admission</h1>
            <p className="text-xl text-white">Join our academic programmes</p>
          </div>
        </div>
      </div>
      <main className="grid max-w-6xl mx-auto grid-cols-1 gap-14 md:grid-cols-2 px-4 py-12 md:py-20">
        <div>
          <div className="max-w-4xl mx-auto mb-4 flex-1">
            <div className="grid gap-4">
              {ApplicationSteps.map((item:any,index:number)=>(
              <div key={index} className="bg-white p-6 gap-3 rounded-xl flex items-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14  bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold border-4 border-white shadow-sm">{item.id}</div>
                <div className="flex flex-1 flex-col items-start justify-center ">
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p></div>
              </div>
              ))}
            </div>
          </div>
          <div className="max-w-4xl mx-auto bg-yellow-50 border border-yellow-100 rounded-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Important Instructions
            </h3>
            <ul className="space-y-3 text-yellow-800/80">
              <li className="flex items-start"><span className="mr-2 mt-1 font-bold">•</span><span>Ensure all provided information is accurate.</span></li>
              <li className="flex items-start"><span className="mr-2 mt-1 font-bold">•</span><span>The WhatsApp number provided should be active.</span></li>
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          <div className="p-8">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h3>
                <p className="text-gray-600 mb-6">Thank you for your interest. please join our official WhatsApp group for updates.</p>
                <Link target="_blank" href={GroupsLink[formData.level]} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300">Join WhatsApp Group</Link>
                <p className="text-red-600 mt-6 text-sm">Don&apos;t leave without joining the group</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.name ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"} outline-none transition duration-200`} placeholder="Enter your full name" />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="place" className="block text-sm font-medium text-gray-700 mb-1">Place <span className="text-red-500">*</span></label>
                  <input id="place" name="place" value={formData.place} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.place ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"} outline-none transition duration-200`} placeholder="e.g., Cochin" />
                  {errors.place && <p className="mt-1 text-sm text-red-500">{errors.place}</p>}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                  <select id="state" name="state" value={formData.state} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.state ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"} outline-none transition duration-200 bg-white`}>
                    <option value="">Select State</option>
                    {indiaData.map((item: any) => (<option key={item.state} value={item.state}>{item.state}</option>))}
                  </select>
                  {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">District <span className="text-red-500">*</span></label>
                  <select id="district" name="district" value={formData.district} onChange={handleChange} disabled={!formData.state} className={`w-full px-4 py-3 rounded-lg border ${errors.district ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"} outline-none transition duration-200 bg-white ${!formData.state ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <option value="">Select District</option>
                    {districts.map((district: string) => (<option key={district} value={district}>{district}</option>))}
                  </select>
                  {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district}</p>}
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number <span className="text-red-500">*</span></label>
                  <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={`w-full px-4 py-3 rounded-lg border ${errors.whatsapp ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"} outline-none transition duration-200`} placeholder="e.g., 919876543210" />
                  <p className="mt-1 text-xs text-gray-500">We will use this number for communication.</p>
                  {errors.whatsapp && <p className="mt-1 text-sm text-red-500">{errors.whatsapp}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Level <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {levels.map((lvl) => (
                      <div key={lvl.value} className="relative">
                        <input type="radio" id={`level-${lvl.value}`} name="level" value={lvl.value} checked={formData.level === lvl.value} onChange={handleChange} className="peer sr-only" />
                        <label htmlFor={`level-${lvl.value}`} className="flex items-center justify-center p-3 text-sm font-medium text-gray-700 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-green-600 peer-checked:text-green-600 peer-checked:bg-green-50 transition-all border-gray-200">{lvl.label}</label>
                      </div>
                    ))}
                  </div>
                  {errors.level && <p className="mt-1 text-sm text-red-500">{errors.level}</p>}
                  {formData.level && formData.level !== "Rabbani" && (
                    <div className="mt-4">
                      <label htmlFor="stream" className="block text-sm font-medium text-gray-700 mb-1">Select Stream <span className="text-red-500">*</span></label>
                      <select id="stream" name="stream" value={formData.stream} onChange={handleChange} disabled={!formData.level || formData.level === "Rabbani"} className={`w-full text-gray-800 px-4 py-3 rounded-lg border ${errors.stream ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"} outline-none transition duration-200 bg-white ${!formData.level ? "opacity-50 cursor-not-allowed" : ""}`}>
                        <option value="">Select Stream</option>
                        {filteredStreams.map((s: any) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                      </select>
                      {errors.stream && <p className="mt-1 text-sm text-red-500">{errors.stream}</p>}
                    </div>
                  )}
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={isSubmitting} className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}>
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : "Submit Form"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ApplicationForm: React.FC = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ApplicationFormInner />
    </Suspense>
  );
};

export default ApplicationForm;

