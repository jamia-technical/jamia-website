"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import Image from "next/image";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  BookOpen,
  Award,
  Star,
  CheckCircle2,
  Clock,
  Save,
  Loader2,
  BadgeCheck,
  IndianRupee,
} from "lucide-react";
import {
  getLevelByStream,
  getStreamName,
} from "@/assets/data/programmes";
import toast from "react-hot-toast";
import { decodeId } from "@/functions/uid_encode";

interface ApplicationData {
  id?: number;
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
  interview_done: boolean;
  fee_done: boolean;
  created_at: string;
  exam_results?: ExamResults | null;
}

interface ExamResults {
  id?: number;
  admission_id?: number;
  islamic_knowledge: number | null;
  science_aptness: number | null;
  communication: number | null;
  general_awareness: number | null;
  achievements: number | null;
  leadership: number | null;
  interpersonal: number | null;
  written_test: number | null;
}

const INTERVIEW_FIELDS = [
  { key: "islamic_knowledge", label: "Knowledge in Islamic Studies", max: 20 },
  { key: "science_aptness", label: "Aptness for Science", max: 15 },
  { key: "communication", label: "Effective Communication", max: 15 },
  { key: "general_awareness", label: "General Awareness", max: 15 },
  { key: "achievements", label: "Personal Achievements & Co-curricular", max: 15 },
  { key: "leadership", label: "Leadership Quality", max: 10 },
  { key: "interpersonal", label: "Interpersonal Skills", max: 10 },
] as const;

const LEVELS: Record<string, string> = {
  "8": "Standard 8",
  "11": "+1 (Plus One)",
  Degree: "Degree",
  Rabbani: "Rabbani Finishing",
};

export default function ApplicantShowcase() {
  const params = useParams();
  const router = useRouter();
  const id = decodeId(params?.id as string);

  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingInterview, setTogglingInterview] = useState(false);
  const [togglingFee, setTogglingFee] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>('admin');

  // Fetch user role
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user?.role) {
          setUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);


  const [marks, setMarks] = useState<Record<string, number | null>>({
    islamic_knowledge: null,
    science_aptness: null,
    communication: null,
    general_awareness: null,
    achievements: null,
    leadership: null,
    interpersonal: null,
    written_test: null,
  });

  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail?.collapsed || false);
    };
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`/api/getadmn/${id}`)
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            setData(result.data);
            if (result.data.exam_results) {
              const er = result.data.exam_results;
              setMarks({
                islamic_knowledge: er.islamic_knowledge,
                science_aptness: er.science_aptness,
                communication: er.communication,
                general_awareness: er.general_awareness,
                achievements: er.achievements,
                leadership: er.leadership,
                interpersonal: er.interpersonal,
                written_test: er.written_test,
              });
            }
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  const interviewTotal = INTERVIEW_FIELDS.reduce(
    (sum, f) => sum + (marks[f.key] || 0),
    0
  );
  const writtenTotal = marks.written_test || 0;
  const grandTotal = interviewTotal + writtenTotal;

  const handleMarkChange = (key: string, value: string, max: number) => {
    const num = value === "" ? null : Math.min(parseInt(value) || 0, max);
    setMarks((prev) => ({ ...prev, [key]: num }));
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/getadmn/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_results: marks,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        toast.success("Marks saved successfully!");
      } else {
        toast.error("Failed to save marks: " + result.error);
      }
    } catch {
      toast.error("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const toggleInterviewDone = async () => {
    if (!data) return;
    setTogglingInterview(true);
    try {
      const res = await fetch(`/api/getadmn/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interview_done: !data.interview_done }),
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        toast.success(
          result.data.interview_done
            ? "Interview marked as done"
            : "Interview status reverted"
        );
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setTogglingInterview(false);
    }
  };

  const toggleFeeDone = async () => {
    if (!data) return;
    setTogglingFee(true);
    try {
      const res = await fetch(`/api/getadmn/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee_done: !data.fee_done }),
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        toast.success(
          result.data.fee_done ? "Fee marked as paid" : "Fee status reverted"
        );
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setTogglingFee(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-gray-200 border-t-blue-600 animate-spin rounded-full mx-auto" />
            <p className="text-gray-500 mt-4">Loading applicant data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 max-w-md">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Applicant Not Found
            </h1>
            <p className="text-gray-500 mb-4">
              The requested application could not be found.
            </p>
            <button
              onClick={() => router.push("/admin/dashboard/enquiries")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Enquiries
            </button>
          </div>
        </div>
      </div>
    );
  }

  const applicationNo = `JN${String(data.id || "").padStart(4, "0")}`;
  const levelLabel = LEVELS[data.level] || data.level || "—";
  const streamLabel = getStreamName(data.stream) || data.stream || "—";

  const achievementsList = data.achievements
    ? data.achievements.split(" | ").map((a) => {
        const parts = a.split(" - ");
        return { title: parts[0]?.trim(), organizer: parts.slice(1).join(" - ")?.trim() };
      })
    : [];

  const skillsList = data.skills ? data.skills.split(" - ").map((s) => s.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main
        className={`transition-all duration-300 px-4 md:px-8 py-6 ${
          sidebarCollapsed ? "md:ml-0" : "md:ml-[280px]"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <button
              onClick={() => router.push("/admin/dashboard/enquiries")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Enquiries
            </button>

            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge
                done={data.interview_done}
                label="Interview"
                icon={<BadgeCheck size={14} />}
              />
              {userRole === "admin" && <StatusBadge
                done={data.fee_done}
                label="Fee"
                icon={<IndianRupee size={14} />}
              />}
            </div>
          </div>

          {/* Profile Header Card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            {/* <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 h-28 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] opacity-60" />
            </div> */}
            <div className="px-6 md:px-8 py-6 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Photo */}
                <div className="relative w-28 h-28 rounded-2xl border-4 border-white shadow-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {data.photo ? (
                    <Image
                      src={data.photo}
                      alt={data.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-emerald-50">
                      <User size={40} className="text-emerald-300" />
                    </div>
                  )}
                </div>

                {/* Name & Meta */}
                <div className="flex-1 pt-2">
                  <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-sm font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {applicationNo}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      <GraduationCap size={12} />
                      {levelLabel}
                    </span>
                    {data.stream && data.stream !== "Rabbani" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        {streamLabel}
                      </span>
                    )}
                    {data.created_at && (
                      <span className="text-xs text-gray-400">
                        Applied{" "}
                        {new Date(data.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <InfoCard icon={<User size={18} />} title="Personal Information">
              <InfoRow label="Father's Name" value={data.father_name} />
              <InfoRow
                label="Date of Birth"
                value={
                  data.dob
                    ? new Date(data.dob).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : null
                }
              />
              <InfoRow label="WhatsApp" value={data.whatsapp} icon={<Phone size={14} className="text-green-500" />} />
              <InfoRow label="Email" value={data.email} icon={<Mail size={14} className="text-blue-500" />} />
              <InfoRow label="Place" value={data.place} icon={<MapPin size={14} className="text-red-400" />} />
              <InfoRow label="District" value={data.district} />
              <InfoRow label="State" value={data.state} />
              <InfoRow label="Address" value={data.address} fullWidth />
            </InfoCard>

            {/* Academic Details */}
            <InfoCard icon={<BookOpen size={18} />} title="Academic Details">
              <InfoRow label="Academic Level" value={levelLabel} />
              <InfoRow label="Stream" value={streamLabel} />
              <InfoRow label="Islamic Education" value={data.islamic_education} />
              <InfoRow label="Islamic Details" value={data.islamic_details} />
              <InfoRow label="Previous School" value={data.school_name} />
              <InfoRow label="Last Exam Mark" value={data.last_exam_mark} />
            </InfoCard>
          </div>

          {/* Achievements & Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <InfoCard icon={<Award size={18} />} title="Achievements">
              {achievementsList.length > 0 ? (
                <div className="space-y-2">
                  {achievementsList.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-800">{a.title}</span>
                        {a.organizer && (
                          <span className="text-gray-500 text-sm"> — {a.organizer}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">No achievements listed</p>
              )}
            </InfoCard>

            <InfoCard icon={<Star size={18} />} title="Skills">
              {skillsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">No skills listed</p>
              )}
            </InfoCard>
          </div>

          {/* Interview Marks Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap size={20} className="text-emerald-600" />
                Interview Marks
                <span className="text-xs font-normal text-gray-400 ml-1">out of 100</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Evaluation Criteria</th>
                    <th className="px-6 py-3 text-center">Max</th>
                    <th className="px-6 py-3 text-center">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {INTERVIEW_FIELDS.map((field, i) => (
                    <tr key={field.key} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-700">
                        {field.label}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-7 bg-gray-100 rounded text-xs font-bold text-gray-500">
                          {field.max}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={field.max}
                          value={marks[field.key] ?? ""}
                          onChange={(e) =>
                            handleMarkChange(field.key, e.target.value, field.max)
                          }
                          className="w-20 mx-auto px-3 py-1.5 text-center border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-sm font-semibold"
                          placeholder="—"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-50/60 border-t-2 border-emerald-200">
                    <td className="px-6 py-3" />
                    <td className="px-6 py-3 text-sm font-bold text-emerald-800">
                      Interview Total
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-7 bg-emerald-100 rounded text-xs font-bold text-emerald-700">
                        100
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-20 h-8 bg-emerald-100 rounded-lg text-sm font-bold text-emerald-700">
                        {interviewTotal}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Written Test */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                Written Test
                <span className="text-xs font-normal text-gray-400 ml-1">out of 100</span>
              </h3>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-600">Score:</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={marks.written_test ?? ""}
                  onChange={(e) =>
                    handleMarkChange("written_test", e.target.value, 100)
                  }
                  className="w-24 px-4 py-2 text-center border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-semibold"
                  placeholder="—"
                />
                <span className="text-sm text-gray-400">/ 100</span>
              </div>
            </div>
          </div>

          {/* Grand Total & Save */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">
                Grand Total
              </p>
              <p className="text-4xl font-black text-white">
                {grandTotal}{" "}
                <span className="text-lg font-normal text-emerald-200">/ 200</span>
              </p>
            </div>
            <button
              onClick={handleSaveMarks}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Marks
                </>
              )}
            </button>
            <button

              onClick={toggleInterviewDone}
              disabled={togglingInterview}
              className="flex items-center gap-2 px-8 py-3 bg-yellow-200 text-red-600 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {togglingInterview ? (
                <Loader2 size={20} className="animate-spin" />
              ) : data.interview_done ? (
                <CheckCircle2 size={20} className="text-emerald-600" />
              ) : (
                <Clock size={20} className="text-gray-400" />
              )}
              {data.interview_done ? "Interview Completed ✓" : "Mark Done"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {/* <button
              onClick={toggleInterviewDone}
              disabled={togglingInterview}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all border-2 ${
                data.interview_done
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
              } disabled:opacity-60`}
            >
              {togglingInterview ? (
                <Loader2 size={20} className="animate-spin" />
              ) : data.interview_done ? (
                <CheckCircle2 size={20} className="text-emerald-600" />
              ) : (
                <Clock size={20} className="text-gray-400" />
              )}
              {data.interview_done ? "Interview Completed ✓" : "Mark Interview Done"}
            </button> */}

            {userRole === "admin" && <button
              onClick={toggleFeeDone}
              disabled={togglingFee}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all border-2 ${
                data.fee_done
                  ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              } disabled:opacity-60`}
            >
              {togglingFee ? (
                <Loader2 size={20} className="animate-spin" />
              ) : data.fee_done ? (
                <CheckCircle2 size={20} className="text-blue-600" />
              ) : (
                <IndianRupee size={20} className="text-gray-400" />
              )}
              {data.fee_done ? "Fee Paid ✓" : "Mark Fee Done"}
            </button>}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Reusable Sub-components ─────────────────────────────────── */

function StatusBadge({
  done,
  label,
  icon,
}: {
  done: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
        done
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-50 text-amber-600 border border-amber-200"
      }`}
    >
      {icon}
      {label}: {done ? "Done" : "Pending"}
    </span>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-2">
        <span className="text-emerald-600">{icon}</span>
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-4 space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  fullWidth,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`flex ${fullWidth ? "flex-col gap-1" : "items-center justify-between"}`}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-gray-800 flex items-center gap-1.5 ${fullWidth ? "" : "text-right"}`}>
        {icon}
        {value || <span className="text-gray-300 italic">—</span>}
      </span>
    </div>
  );
}