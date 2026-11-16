"use client";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  MdLock,
  MdPerson,
  MdCalendarToday,
  MdArrowForward,
} from "react-icons/md";
import DatePicker from "@/components/DatePicker";
import { Metadata } from "next";

const metadata : Metadata = {
  title: "JNET Result",
  description: "JNET Result",
}

function JnetResult() {
  const router = useRouter();
  const [admissionNo, setAdmissionNo] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!admissionNo.trim() || !dob) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^JN\d+$/i.test(admissionNo.trim())) {
      setError("Invalid admission number. It should be in the format JNXXXX (e.g. JN0111)");
      return;
    }

    // Validate and convert DD/MM/YYYY to YYYY-MM-DD
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const dobMatch = dob.match(datePattern);
    
    if (!dobMatch) {
      setError("Please enter a valid date of birth in DD/MM/YYYY format.");
      return;
    }

    const [, day, month, year] = dobMatch;
    const formattedDob = `${year}-${month}-${day}`;

    setLoading(true);

    try {
      const res = await fetch("/api/jnet-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admission_no: admissionNo.trim(), dob: formattedDob }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("result_check_id", data.data.id);
        toast.success("Record found! Redirecting...");
        router.push(`/jnet-result/${data.data.id}`);
      } else {
        setError(
          data.error ||
            "No matching record found. Please check your admission number and date of birth."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <Navbar />

      {/* Hero Header */}
      <div className="relative h-72 bg-gradient-to-br from-primary via-emerald-800 to-emerald-900 w-full overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-secondary rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full" />
        </div>
        {/* Geometric pattern */}
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
        <div className="relative h-full flex flex-col items-center justify-end pb-20">
          {/* <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-[2px] bg-secondary rounded-full" />
            <span className="text-secondary text-sm font-semibold tracking-widest uppercase">
              Entrance Exam
            </span>
            <div className="w-10 h-[2px] bg-secondary rounded-full" />
          </div> */}
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            JNET Result Portal
          </h1>
          {/* <p className="text-emerald-200/80 mt-3 text-center max-w-md px-4">
            Enter your credentials below to view your entrance exam results
          </p> */}
        </div>
      </div>

      {/* Login Form */}
      <div className="container mx-auto px-4 -mt-8 pb-20 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200">
            {/* Card header */}
            <div className="px-8 pt-8 pb-4 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MdLock className="text-3xl text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Access Your Result
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Verify your identity to view your exam scorecard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2">
              {/* Error message */}
              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Admission Number */}
              <div className="mb-5">
                <label
                  htmlFor="admission-no"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Admission Number
                </label>
                <div className="relative">
                  <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    id="admission-no"
                    type="text"
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    placeholder="e.g. JN0111"
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="mb-7">
                <label
                  htmlFor="dob"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Date of Birth
                </label>
                <DatePicker
                  id="dob"
                  value={dob}
                  onChange={setDob}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-emerald-700 hover:from-emerald-700 hover:to-primary text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>View Result</span>
                    <MdArrowForward className="text-lg" />
                  </>
                )}
              </button>

              {/* Help text */}
              <p className="text-center text-xs text-gray-400 mt-5">
                If you are facing issues, please contact the admission office.
              </p>
            </form>
          </div>

          {/* Bottom decoration */}
          <div className="flex items-center justify-center mt-8 gap-2 text-gray-400">
            {/* <div className="w-4 h-[1px] bg-gray-300" />
            <MdLock className="text-sm" /> */}
            <span className="text-xs">Jamia Madeenathunnoor</span>
            {/* <div className="w-4 h-[1px] bg-gray-300" /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JnetResult;