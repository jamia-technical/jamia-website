"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { indiaData } from "@/assets/data/states_data";
import {
  hsProgrammes,
  bsProgrammes,
  hssProgrammes,
  getLevelByStream,
  getStreamName,
} from "@/assets/data/programmes";
import { decodeId } from "@/functions/uid_encode";
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCentIcon,
  BadgeCheck,
  Download,
  MessageCircle,
  MessageCircleX,
  Plus,
  Replace,
  TriangleAlert,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { pdf } from "@react-pdf/renderer";
import JNETHallTicketPDF from "./application-pdf";
import { sendAdmissionEmail } from "@/app/actions/emailActions";
import ImageCropCompress from "@/components/ImageCropCompress";


interface ApplicationData {
  id?: string;
  name: string;
  dob: string;
  email: string;
  father_name: string;
  whatsapp: string;
  stream: string;
  place: string;
  district: string;
  state: string;
  level: string;
  photo: string;
  imgid: string;
  islamic_education: string;
  islamic_details: string;
  school_name: string;
  last_exam_mark: string;
  address: string;
  achievements: string;
  skills: string;
}

const Step2Form: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const decodedId = typeof id === "string" ? decodeId(id) : null;
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null); // file pending crop
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [achievementsList, setAchievementsList] = useState([
    { title: "", organizer: "" },
  ]);
  const [skillsList, setSkillsList] = useState([{ title: "" }]);
  const [hallTicketDownloading, setHallTicketDownloading] = useState(false);
  const [formData, setFormData] = useState<ApplicationData>({
    name: "",
    dob: "",
    father_name: "",
    whatsapp: "",
    stream: "",
    place: "",
    district: "",
    state: "Kerala",
    level: "",
    photo: "",
    imgid: "",
    islamic_education: "",
    islamic_details: "",
    school_name: "",
    last_exam_mark: "",
    address: "",
    achievements: "",
    email: "",
    skills: "",
  });

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const districts = useMemo(() => {
    const stateData = indiaData.find((s: any) => s.state === formData.state);
    return stateData ? stateData.districts : [];
  }, [formData.state]);

  const filteredStreams = useMemo(() => {
    switch (formData.level) {
      case "11":
        return hssProgrammes.map((p: any) => ({
          id: p.streamId,
          name: p.course,
        }));
      case "8":
        return hsProgrammes.map((p: any) => ({ id: p.streamId, name: p.name }));
      case "Degree":
        return bsProgrammes.map((p: any) => ({
          id: p.streamId,
          name: p.course,
        }));
      default:
        return [];
    }
  }, [formData.level]);
  
  const levels = [
    { value: "8", label: "Standard 8" },
    { value: "11", label: "+1 (Plus One)" },
    { value: "Degree", label: "Degree" },
    { value: "Rabbani", label: "Rabbani Finishing" },
  ];

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (decodedId) {
      fetch(`/api/getadmn/${decodedId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setApplication(data.data);
            if (data.data.email) {
              setSubmitted(true);
            }
            setFormData({
              name: data.data.name || "",
              dob: data.data.dob || "",
              father_name: data.data.father_name || "",
              email: data.data.email || "",
              whatsapp: data.data.whatsapp || "",
              stream: data.data.stream || "",
              place: data.data.place || "",
              district: data.data.district || "",
              state: data.data.state || "Kerala",
              level:
                data.data.level ||
                getLevelByStream(data.data.stream || ""),
              photo: data.data.photo || "",
              imgid: data.data.imgid || "",
              islamic_education: data.data.islamic_education || "",
              islamic_details: data.data.islamic_details || "",
              school_name: data.data.school_name || "",
              last_exam_mark: data.data.last_exam_mark || "",
              address: data.data.address || "",
              achievements: data.data.achievements || "",
              skills: data.data.skills || "",
            });
            if (data.data.achievements) {
              const parsed = data.data.achievements
                .split(" | ")
                .map((a: string) => {
                  const parts = a.split(" - ");
                  return {
                    title: parts[0]?.trim() || "",
                    organizer: parts.slice(1).join(" - ")?.trim() || "",
                  };
                });
              setAchievementsList(
                parsed.length ? parsed : [{ title: "", organizer: "" }],
              );
            } else {
              setAchievementsList([{ title: "", organizer: "" }]);
            }
            if (data.data.skills) {
              const parsed = data.data.skills.split(" | ").map((a: string) => {
                const parts = a.split(" - ");
                return {
                  title: parts[0]?.trim() || "",
                  organizer: parts.slice(1).join(" - ")?.trim() || "",
                };
              });
              setSkillsList(parsed.length ? parsed : [{ title: "" }]);
            } else {
              setSkillsList([{ title: "" }]);
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [decodedId]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Open crop+compress modal for any image (no size limit on input)
    setCropFile(file);
    // Reset the input so the same file can be re-selected
    e.target.value = "";
  };

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    // Revoke old preview URL to avoid memory leaks
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setSelectedFile(croppedFile);
    setPhotoPreview(previewUrl);
    setCropFile(null);
    // Mark photo as selected so validation passes
    setFormData((prev) => ({ ...prev, photo: "pending" }));
    if (errors.photo) setErrors((prev) => ({ ...prev, photo: null }));
    toast.success(
      `Photo cropped & compressed (${(croppedFile.size / 1024).toFixed(0)} KB)`
    );
  };

  const handleCropCancel = () => {
    setCropFile(null);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "state") {
      setFormData({ ...formData, state: value, district: "" });
    } else if (name === "level") {
      setFormData({ ...formData, level: value, stream: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    let tempErrors: Record<string, string> = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.whatsapp.trim()) {
      tempErrors.whatsapp = "WhatsApp number is required";
    } else if (!/^\d{9,12}$/.test(formData.whatsapp.replace(/\D/g, ""))) {
      tempErrors.whatsapp = "Please enter a valid 9-12 digit number";
    }
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      tempErrors.email = "Please enter a valid email";
    }

    if (!formData.dob) tempErrors.dob = "Date of birth is required";
    if (!formData.father_name) tempErrors.father_name = "Father's name is required";
    if (!formData.place) tempErrors.place = "Please enter your place";
    if (!formData.district) tempErrors.district = "Please enter your district";
    if (!formData.state) tempErrors.state = "Please select your state";
    if (!formData.level) tempErrors.level = "Please select a level";
    if (!formData.stream && formData.level !== "Rabbani")
      tempErrors.stream = "Please select a stream";
    if (!formData.photo && !selectedFile){
      tempErrors.photo = "Please upload a photo";
    }
    if (!formData.islamic_education)
      tempErrors.islamic_education = "Please select Islamic education";
    if (!formData.school_name)
      tempErrors.school_name = "School name is required";
    if (!formData.last_exam_mark)
      tempErrors.last_exam_mark = "Marks are required";
    if (!formData.address) tempErrors.address = "Address is required";

    const hasAchievement = achievementsList.some((r) => r.title.trim());
    if (!hasAchievement) {
      tempErrors.achievements = "Please add at least one achievement";
      toast.error("Please add at least one major achievement.");
    }

    const hasSkill = skillsList.some((r) => r.title.trim());
    if (!hasSkill) {
      tempErrors.skills = "Please add at least one skill";
      toast.error("Please add at least one skill.");
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const applicationNo = `JN${String(decodedId || "").padStart(4, "0")}`;
  console.log(formData);
  
  const handleHallTicket = async () => {
    try {
    setHallTicketDownloading(true);

    // 1. Define the PDF generation promise
    const generatePdfBlob = async () => {
      let photoData = null;
      if (typeof window !== "undefined" && formData.photo && formData.photo.startsWith("http")) {
        try {
          const proxyUrl = formData.photo.includes("cloudinary.com") ? formData.photo.replace("/upload/", "/upload/f_jpg/") : formData.photo;
          const r = await fetch(proxyUrl);
          const photoBlob = await r.blob();
          photoData = await new Promise((resolve) => {
             const reader = new FileReader();
             reader.onloadend = () => resolve(reader.result);
             reader.readAsDataURL(photoBlob);
          });
        } catch(e) {
          console.warn("Failed to pre-fetch base64 image", e);
        }
      }

      const blob = await pdf(
        <JNETHallTicketPDF data={{ ...formData, applicationNumber: applicationNo, photoBase64: photoData }} />
      ).toBlob();
      return blob;
    };

    // 2. Wrap the promise in a toast and await the result (the blob)
    const blob = await toast.promise(
      generatePdfBlob(),
      {
        loading: "Generating Hall Ticket...",
        success: "Hall Ticket Generated Successfully!",
        error: "Failed to Generate Hall Ticket!",
      }
    );

    // 3. Create the download link from the blob we just generated
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `JNET-Hall-Ticket-${applicationNo}.pdf`;
    
    // 4. Trigger download
    document.body.appendChild(link);
    link.click();
    
    // 5. Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error("Failed to generate PDF:", error);
  } finally {
    setHallTicketDownloading(false);
  }
};

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      let finalData = { ...formData };

      const formattedAchievements = achievementsList
        .filter((r) => r.title.trim() || r.organizer.trim())
        .map((r) => `${r.title.trim()} - ${r.organizer.trim()}`)
        .join(" | ");
      finalData.achievements = formattedAchievements;

      const formattedSkills = skillsList
        .filter((r) => r.title.trim())
        .map((r) => `${r.title.trim()}`)
        .join(" - ");
      finalData.skills = formattedSkills;

      // Upload image only at submit time if user selected a new file
      if (selectedFile) {
        const body = new FormData();
        body.append("image", selectedFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body });
        const uploadData = await uploadRes.json();
        if (uploadData.image) {
          finalData.photo = uploadData.image;
          finalData.imgid = uploadData.imgid;
        } else {
          alert("Image upload failed: " + uploadData.error);
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch(`/api/getadmn/${decodedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      const data = await res.json();
      if (data.success) {
        setFormData(finalData);
        setSubmitted(true);

        // Send confirmation email if email is provided and it's the first time
        // adding an email to this record, or if we want to ensure it's sent.
        if (finalData.email) {
          const emailTask = async () => {
            console.log("Starting email task for:", finalData.email);
            try {
              // 1. Pre-fetch image for PDF
              let photoData = null;
              if (finalData.photo && finalData.photo.startsWith("http")) {
                console.log("Pre-fetching photo for email PDF...");
                const proxyUrl = finalData.photo.includes("cloudinary.com") 
                  ? finalData.photo.replace("/upload/", "/upload/f_jpg/") 
                  : finalData.photo;
                const r = await fetch(proxyUrl);
                const photoBlob = await r.blob();
                photoData = await blobToBase64(photoBlob).then(b => `data:${photoBlob.type};base64,${b}`);
              }

              // 2. Generate PDF and Send Email - wrapped in a toast for feedback
              await toast.promise(
                (async () => {
                  console.log("Generating PDF for email...");
                  const pdfBlob = await pdf(
                    <JNETHallTicketPDF data={{ ...finalData, applicationNumber: applicationNo, photoBase64: photoData }} />
                  ).toBlob();

                  console.log("Converting PDF to base64...");
                  const base64 = await blobToBase64(pdfBlob);

                  console.log("Calling sendAdmissionEmail action...");
                  const result = await sendAdmissionEmail(finalData.email, finalData.name, applicationNo, base64, getStreamName(finalData.stream));
                  
                  if (!result.success) {
                    throw new Error(result.error || "Failed to send email");
                  }
                  return result;
                })(),
                {
                  loading: "Sending confirmation email...",
                  success: "Confirmation email sent with Hall Ticket!",
                  error: (err) => `Email failed: ${err.message}`,
                }
              );
              
              console.log("Admission email task completed successfully");
            } catch (err) {
              console.error("Critical failure in email task:", err);
            }
          };
          
          // Fire and forget so we don't block the UI, but now with toasts for feedback
          emailTask();
        }
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="h-16 w-16 border-4 border-gray-100 border-t-green-700 animate-spin rounded-full"></div>
        <p className="text-gray-600 my-3">Loading...</p>
      </div>
    );
  if (!application)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 px-10 max-w-md w-full text-center border border-gray-200">
          <div className="text-red-500 flex items-center justify-center mx-auto my-6">
            <MessageCircleX size={80} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Application Not Found
          </h1>
          <a
            href={"/Programmes/ApplicationForm"}
            className="inline-block w-full mt-4 px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transform transition hover:-translate-y-[1px] duration-300 shadow-md"
          >
            Back to Form
          </a>
        </div>
      </div>
    );

  const GroupsLink: Record<string, string> = {
    "8": "https://chat.whatsapp.com/Klnngas45Eo7WvgHWnYNaQ?mode=hqrt3",
    "11": "https://chat.whatsapp.com/G3lmynofCpJ4IftJfqvn8T?mode=hqrt3",
    Degree: "https://chat.whatsapp.com/E4McCeAxIkRDQNpWqsIptS",
    Rabbani: "https://chat.whatsapp.com/FYPIm8g3qISHod4FBarYSp",
  };

  if (submitted) {
    return (
      <div className=" flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow min-h-screen flex items-center justify-center p-10">
          <div className="bg-white rounded-2xl p-8 px-10 max-w-md w-full text-center border border-gray-200">
            <div className="text-green-600 flex items-center justify-center mx-auto my-6">
              <BadgeCheck size={80} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Application Completed!
            </h1>
            <p className="text-gray-600 my-3">
              Hello <b>{application.name},</b> your application details have
              been successfully updated. Please join the official WhatsApp group
              for further instructions and entrance exam details.
            </p>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={GroupsLink[application.level] || "#"}
              className="inline-block w-full px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transform transition hover:-translate-y-[2px] shadow-md"
            >
              Join WhatsApp Group
            </a>
            {(getLevelByStream(application.stream) === "8" || getLevelByStream(application.stream) === "11") && (
              <button
                onClick={handleHallTicket}
                className="flex items-center justify-center gap-2 my-3 w-full px-8 py-3 text-gray-700 font-bold rounded-xl border border-gray-400 transform transition"
              >
                <ArrowDownToLine size={18} /> Hall Ticket
              </button>
            )}
            <p className=" flex items-center justify-center gap-2 text-red-500 border text-sm border-red-200 bg-red-50 rounded-md py-2">
              <TriangleAlert size={15} /> Dont leave without joining the group!
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-sm font-medium text-green-700 hover:text-green-800 underline"
            >
              Edit Application Details
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      {/* Image Crop & Compress Modal */}
      {cropFile && (
        <ImageCropCompress
          file={cropFile}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
          maxSizeBytes={1024 * 1024}
        />
      )}
      <Navbar />
      <div className="bg-green-900 text-white py-12 pt-32 px-4 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-800 rounded-full -mr-20 -mt-20 opacity-50 blur-3xl"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-green-100 text-green-900 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
              Step 2
            </span>
            <div className="h-1 flex-grow bg-green-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-400/20 w-full"></div>
            </div>
          </div>
          <p className="text-4xl font-semibold mb-2 leading-tight">
            Welcome,{" "}
            <span className="underline decoration-2 underline-offset-4">
              {application.name}
            </span>
          </p>
          <h1 className="text-xl text-green-100 flex items-center gap-2">
            Complete your Application Details
          </h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto w-full px-4 mt-10 pb-20">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            {/* Basic Information */}
            <section className="space-y-6">
              <SectionHeader number={1} title="Personal Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300"} focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    Father&apos;s Name
                  </label>
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.father_name ? "border-red-500" : "border-gray-300"} focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none`}
                    placeholder="Enter father's name"
                  />
                  {errors.father_name && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.father_name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.dob ? "border-red-500" : "border-gray-300"} focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none`}
                  />
                  {errors.dob && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.dob}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.whatsapp ? "border-red-500" : "border-gray-300"} focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none`}
                    placeholder="eg :919876543210"
                  />
                  {errors.whatsapp && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.whatsapp}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    Email Id
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none`}
                    placeholder="eg : demo@google.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.state ? "border-red-500" : "border-gray-300"} focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none bg-white`}
                  >
                    <option value="">Select State</option>
                    {indiaData.map((item: any) => (
                      <option key={item.state} value={item.state}>
                        {item.state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.state}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    District
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.state}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.district ? "border-red-500" : "border-gray-300"} focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none bg-white ${!formData.state ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <option value="">Select District</option>
                    {districts.map((d: string) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.district}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    Place
                  </label>
                  <input
                    type="text"
                    name="place"
                    value={formData.place}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.place ? "border-red-500" : "border-gray-300"} focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none`}
                    placeholder="Your Locality"
                  />
                  {errors.place && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.place}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide leading-relaxed">
                  Permanent Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none resize-none"
                  placeholder="House Name/No - Place - PO - District - State - Country - Pincode"
                />
                <p className="text-xs text-gray-400">
                  Format: House Name/No &gt; Place &gt; PO &gt; District &gt;
                  State &gt; Country &gt; Pincode
                </p>
                {errors.address && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.address}
                  </p>
                )}
              </div>
              {/* Level & Stream (Read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                      Academic Level
                    </label>
                    <input
                      type="text"
                      disabled
                      value={
                        levels.find((l) => l.value === formData.level)?.label ||
                        formData.level ||
                        "Not selected"
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed outline-none"
                    />
                  </div>
                  {formData.level && formData.level !== "Rabbani" && (
                    <div className="space-y-2">
                      <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                        Stream
                      </label>
                      <input
                        type="text"
                        disabled
                        value={
                          filteredStreams.find(
                            (s: any) => s.id === formData.stream,
                          )?.name ||
                          formData.stream ||
                          "Not selected"
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed outline-none"
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                    Photo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  {photoPreview ? (
                    <div className="relative w-40 h-48 bg-white rounded-xl shadow-inner border border-gray-200 overflow-hidden group">
                      <Image
                        src={photoPreview}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-500 text-white p-1.5 px-4 rounded-xl text-sm"
                      >
                        Replace
                      </button>
                    </div>
                  ) : formData.photo && formData.photo !== "pending" ? (
                    <div
                      className="relative w-40 h-48 bg-white rounded-xl shadow-inner border border-gray-200 overflow-hidden group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image
                        src={formData.photo}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Replace
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-center relative h-full gap-2 p-6 items-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-500 hover:bg-green-50 duration-300 transition-colors">
                      <label className="absolute top-0 bottom-0 cursor-pointer right-0 left-0 opacity-0 ">
                        {/* {(photoPreview || (formData.photo && formData.photo !== "pending")) ? "Change Photo" : "Upload Passport Photo"} */}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mb-2 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs uppercase font-bold tracking-widest">
                        No Photo Selected
                      </span>
                      <p className="text-sm text-gray-500 italic text-center">
                        Please upload a clear passport size photograph. JPG or
                        PNG format only.
                      </p>
                      {errors.photo && (
                        <p className="text-xs text-red-500 font-medium">
                          {errors.photo}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Photo Upload */}
            {/* <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 text-sm bg-green-700 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h2 className="text-xl font-bold text-gray-900">Passport Size Photo</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-green-300 transition-colors">
                <div className="relative w-40 h-48 bg-white rounded-xl shadow-inner border border-gray-200 overflow-hidden group">
                  {photoPreview ? (
                    <Image src={photoPreview} alt="Preview" fill className="object-cover" unoptimized />
                  ) : formData.photo && formData.photo !== "pending" ? (
                    <Image src={formData.photo} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs uppercase font-bold tracking-widest">No Photo Selected</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <p className="text-sm text-gray-500 italic">Please upload a clear passport size photograph. JPG or PNG format only.</p>
                  {errors.photo && <p className="text-xs text-red-500 font-medium">{errors.photo}</p>}
                  <label className="inline-block px-10 py-4 bg-white border-2 border-green-600 text-green-700 font-bold rounded-xl cursor-pointer hover:bg-green-50 transition-all shadow-sm">
                    {(photoPreview || (formData.photo && formData.photo !== "pending")) ? "Change Photo" : "Upload Passport Photo"}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                  </label>
                  {selectedFile && <p className="text-xs text-green-600 font-medium">✓ {selectedFile.name} selected — will upload on submit</p>}
                </div>
              </div>
            </section> */}

            {/* Islamic Education */}
            <section className="space-y-6">
              <SectionHeader number={2} title="Education Details" />
              <div className="space-y-3">
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                  Do you have any Islamic Education?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {["Madrasa", "Dawa/Dars", "Hifz", "None"].map((option) => (
                    <label
                      key={option}
                      className={`p-3 border rounded-lg cursor-pointer text-center transition-all ${formData.islamic_education === option ? "border-green-600 bg-green-50 text-green-900 shadow-md ring-1 ring-green-600" : "border-gray-200 hover:border-green-200 text-gray-600"}`}
                    >
                      <input
                        type="radio"
                        name="islamic_education"
                        value={option}
                        className="hidden"
                        checked={formData.islamic_education === option}
                        onChange={handleChange}
                      />
                      <span className="font-bold">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              {formData.islamic_education &&
                formData.islamic_education !== "None" && (
                  <div className="space-y-3">
                    <label className="block text-gray-700 text-[13px] font-bold uppercase tracking-wide">
                      {formData.islamic_education === "Madrasa" &&
                        "Last Study Level & Mark Percentage in Madrasa"}
                      {formData.islamic_education === "Dawa/Dars" &&
                        "Kithabs Completed"}
                      {formData.islamic_education === "Hifz" &&
                        "Number of Juzh Completed"}
                    </label>
                    <input
                      type="text"
                      name="islamic_details"
                      value={formData.islamic_details}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all shadow-sm"
                      placeholder="Enter details here..."
                    />
                    {formData.islamic_education === "Madrasa" && (
                      <p className="text-xs text-gray-500 italic">
                        eg : 10th - 90%
                      </p>
                    )}
                    {formData.islamic_education === "Dawa/Dars" && (
                      <p className="text-xs text-gray-500 italic">
                        A chronological list of Kithabs completed during your
                        Dars/Dawa studies. eg : Ajnas , TAQVEEM-UL-LISAN ,
                        Fathul-Mueen
                      </p>
                    )}
                    {formData.islamic_education === "Hifz" && (
                      <p className="text-xs text-gray-500 italic">
                        eg : 30 Juzh / 10 Juzh / 20 Juzh
                      </p>
                    )}
                  </div>
                )}
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                  Name of the School / Institution last studied
                </label>
                <input
                  type="text"
                  name="school_name"
                  value={formData.school_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                  placeholder="Full School Name"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                  Last Published Exam and Mark/Percentage
                </label>
                <input
                  type="text"
                  name="last_exam_mark"
                  value={formData.last_exam_mark}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                  placeholder="e.g., 90% or 450/600"
                />
                <p className="text-xs text-gray-500 italic">
                  eg : SSLC Model Exam - 90%/450
                </p>
              </div>
            </section>

            {/* Achievements */}
            <section className="space-y-6">
              <SectionHeader number={3} title="Performance" />
              <div>
                <p className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                  Your Scholarships, Awards, Sports achievements, etc.
                </p>
                {errors.achievements && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.achievements}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                {achievementsList.map((row, idx, arr) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-3 text-xs font-bold text-gray-400 w-5 shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={row.title}
                        placeholder="Achievement title"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm"
                        onChange={(e) => {
                          e.target.value.includes("-") ||
                          e.target.value.includes("|")
                            ? toast.error("`-` and `|` symbols not allowed")
                            : null;
                          const updated = [...achievementsList];
                          updated[idx] = {
                            ...updated[idx],
                            title: e.target.value.replace(/[-|]/g, ""),
                          };
                          setAchievementsList(updated);
                        }}
                      />
                      <input
                        type="text"
                        value={row.organizer}
                        placeholder="Organizer / Institution"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm"
                        onChange={(e) => {
                          const updated = [...achievementsList];
                          updated[idx] = {
                            ...updated[idx],
                            organizer: e.target.value.replace(/[-|]/g, ""),
                          };
                          setAchievementsList(updated);
                        }}
                      />
                    </div>
                    {arr.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = achievementsList.filter(
                            (_, i) => i !== idx,
                          );
                          setAchievementsList(updated);
                        }}
                        className="p-2.5 rounded-lg text-red-600 bg-red-100 hover:text-red-600 transition-colors shrink-0"
                        title="Remove"
                      >
                        <X />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex border-t !mt-8 border-green-200 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setAchievementsList([
                      ...achievementsList,
                      { title: "", organizer: "" },
                    ]);
                  }}
                  className="inline-flex mx-auto bg-green-100 -translate-y-4 rounded-full p-1.5 px-4 items-center gap-1 text-sm font-medium text-green-700 duration-300 hover:text-green-900 hover:bg-green-200"
                >
                  <Plus size={15} />
                  Add Achievement
                </button>
              </div>
              <div>
                <p className="block text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                  Your Skills
                </p>
                {errors.skills && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.skills}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {skillsList.map((row, idx, arr) => (
                    <div key={idx} className="flex w-full items-center gap-2">
                      <span className="h-11 w-11 flex items-center rounded-lg justify-center bg-gray-100 text-gray-500">
                        {idx + 1}.
                      </span>

                      <input
                        type="text"
                        value={row.title}
                        placeholder={`Skill ${idx + 1}`}
                        className="w-full flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-sm"
                        onChange={(e) => {
                          e.target.value.includes("-")
                            ? toast.error("`-` symbol not allowed")
                            : null;
                          const updated = [...skillsList];
                          updated[idx] = {
                            ...updated[idx],
                            title: e.target.value.replace(/[-]/g, ""),
                          };
                          setSkillsList(updated);
                        }}
                      />
                      {arr.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = skillsList.filter(
                              (_, i) => i !== idx,
                            );
                            setSkillsList(updated);
                          }}
                          className="p-2.5 rounded-lg text-red-600 bg-red-100 hover:text-red-600 transition-colors shrink-0"
                          title="Remove"
                        >
                          <X />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex border-t !mt-8 border-green-200 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSkillsList([...skillsList, { title: "" }]);
                  }}
                  className="inline-flex mx-auto bg-green-100 -translate-y-4 rounded-full p-1.5 px-4 items-center gap-1 text-sm font-medium text-green-700 duration-300 hover:text-green-900 hover:bg-green-200"
                >
                  <Plus size={15} />
                  Add Skill
                </button>
              </div>
            </section>

            {/* Submit */}
            <div className="">
              <button
                type="submit"
                disabled={submitting}
                className={`group relative w-full py-4 px-6 border-transparent rounded-lg text-white bg-green-700 hover:bg-green-800 font-semibold focus:outline-none focus:ring-offset-2 transition-all transform active:scale-[0.99] ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Final Details...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    Complete Application
                    <ArrowRight />
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Step2Form;

const SectionHeader = ({
  number,
  title,
}: {
  number: number;
  title: string;
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 text-xs bg-green-700 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  );
};
