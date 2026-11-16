"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import AdminNav from "@/components/AdminNav";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Link as LinkIcon,
  Eye,
  IndianRupee,
} from "lucide-react";
import NextLink from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  hsProgrammes,
  bsProgrammes,
  hssProgrammes,
  getLevelByStream,
  getStreamName,
  hasSecondStep,
} from "@/assets/data/programmes";
import { encodeId } from "@/functions/uid_encode";
import toast from "react-hot-toast";

interface Admission {
  id: string | number;
  name: string;
  whatsapp: string;
  stream: string;
  address: string;
  created_at: string;
}

const EnquiriesContent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [streamFilter, setStreamFilter] = useState(searchParams.get("stream") || "All");
  const [subStreamFilter, setSubStreamFilter] = useState(searchParams.get("substream") || "All");
  const [yearFilter, setYearFilter] = useState(searchParams.get("year") || "All");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string>('admin');

  // Pagination
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const itemsPerPage = 10;

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (streamFilter !== "All") params.set("stream", streamFilter);
    if (subStreamFilter !== "All") params.set("substream", subStreamFilter);
    if (yearFilter !== "All") params.set("year", yearFilter);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newQuery = params.toString() ? `?${params.toString()}` : "";
    const currentQuery = window.location.search;
    
    if (currentQuery !== newQuery) {
        router.replace(`${pathname}${newQuery}`, { scroll: false });
    }
  }, [searchQuery, streamFilter, subStreamFilter, yearFilter, currentPage, pathname, router]);

  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail?.collapsed || false);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () =>
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

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

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/getadmn");
      const data = await res.json();

      if (data.success) {
        const fetchedAdmissions: Admission[] = data.data || [];
        setAdmissions(fetchedAdmissions);

        // Extract unique years
        const years = [
          ...new Set(
            fetchedAdmissions.map((item) =>
              new Date(item.created_at).getFullYear().toString(),
            ),
          ),
        ]
          .sort()
          .reverse();
        setAvailableYears(["All", ...years]);
      }
    } catch (error) {
      console.error("Failed to fetch admissions", error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = useCallback(() => {
    let result = admissions;

    // Filter by Stream/Level
    if (streamFilter !== "All") {
      result = result.filter((item) => {
        if (streamFilter === "Rabbani") return item.stream === "Rabbani";

        let belongsToLevel = false;
          belongsToLevel = getLevelByStream(item.stream) === streamFilter;

        if (!belongsToLevel) return false;

        // If level matches, also check sub-stream if selected
        if (subStreamFilter !== "All") {
          return item.stream === subStreamFilter;
        }

        return true;
      });
    }

    // Filter by Year
    if (yearFilter !== "All") {
      result = result.filter(
        (item) =>
          new Date(item.created_at).getFullYear().toString() === yearFilter,
      );
    }

    // Filter by Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const paddedId = String(item.id || "").padStart(4, "0");
        const jnId = `jn${paddedId}`;

        return (
          item.name.toLowerCase().includes(lowerQuery) ||
          item.whatsapp.includes(lowerQuery) ||
          paddedId.includes(lowerQuery) ||
          jnId.includes(lowerQuery) ||
          String(item.id).includes(lowerQuery)
        );
      });
    }

    setFilteredAdmissions(result);
    // Don't reset to first page here automatically unless it's a new change, but we let handlePageChange manage it or 
    // actually, if result changes size and current page is invalid, just set current page safely at the calculation part.
    // setCurrentPage(1); 
  }, [admissions, streamFilter, subStreamFilter, yearFilter, searchQuery]);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  useEffect(() => {
    filterData();
  }, [filterData]);

  // Reset subStreamFilter when level changes
  useEffect(() => {
    setSubStreamFilter("All");
  }, [streamFilter]);

  const availableSubStreams = useMemo(() => {
    switch (streamFilter) {
      case "8":
        return hsProgrammes;
      case "11":
        return hssProgrammes;
      case "Degree":
        return bsProgrammes;
      default:
        return [];
    }
  }, [streamFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAdmissions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmissions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) items.push(i);
        items.push("...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        items.push(1, "...");
        for (let i = totalPages - 4; i <= totalPages; i++) items.push(i);
      } else {
        items.push(1, "...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) items.push(i);
        items.push("...", totalPages);
      }
    }
    return items;
  };

  const handleWhatsAppClick = (whatsapp: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Are you sure you want to delete this enquiry?")) {
      setLoading(true);
      fetch("/api/getadmn", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })
        .then(() => {
          fetchAdmissions();
        })
        .catch((error) => {
          console.error("Failed to delete admission", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  


  const levels = [
    { value: "All", label: "All Levels" },
    { value: "8", label: "Standard 8" },
    { value: "11", label: "+1 (Plus One)" },
    { value: "Degree", label: "Degree" },
    { value: "Rabbani", label: "Rabbani Finishing" },
  ];

  const handleCopyLink = (id: string | number) => {
    navigator.clipboard.writeText(`${window.location.origin}/Programmes/ApplicationForm/${encodeId(id)}`);
    toast.success("Link copied to clipboard");
  }

  const [paymentConfirmId, setPaymentConfirmId] = useState<string | number | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [noPanelsModal, setNoPanelsModal] = useState<{ show: boolean; id: string | number | null }>({ show: false, id: null });

  const handleRecordPayment = (id: string | number) => {
    setPaymentConfirmId(id);
  };

  const confirmPayment = async () => {
    if (!paymentConfirmId) return;
    setPaymentProcessing(true);
    try {
      const res = await fetch(`/api/getadmn/${paymentConfirmId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee_done: true }),
      });
      const data = await res.json();
      if (data.success && data.noPanels) {
        // No panels exist for this stream — ask admin
        setNoPanelsModal({ show: true, id: paymentConfirmId });
        setPaymentConfirmId(null);
        setPaymentProcessing(false);
        return;
      }
      if (data.success) {
        toast.success(
          data.panelName
            ? `Payment recorded — assigned to ${data.panelName}`
            : "Payment recorded successfully"
        );
        fetchAdmissions();
      } else {
        toast.error("Failed to record payment: " + data.error);
      }
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setPaymentProcessing(false);
      setPaymentConfirmId(null);
    }
  };

  const skipAndRecordPayment = async () => {
    if (!noPanelsModal.id) return;
    setPaymentProcessing(true);
    try {
      const res = await fetch(`/api/getadmn/${noPanelsModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fee_done: true, skipPanelAssign: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Payment recorded (panel assignment skipped)");
        fetchAdmissions();
      } else {
        toast.error("Failed to record payment: " + data.error);
      }
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setPaymentProcessing(false);
      setNoPanelsModal({ show: false, id: null });
    }
  };
  console.log(currentItems);
  

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      {/* Payment Confirmation Modal */}
      {paymentConfirmId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in fade-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IndianRupee className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirm Payment
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to mark this applicant&apos;s fee as <span className="font-semibold text-emerald-600">paid</span>? This action can be reverted from the applicant details page.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentConfirmId(null)}
                  disabled={paymentProcessing}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={paymentProcessing}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {paymentProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Record Payment"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Panels Found Modal */}
      {noPanelsModal.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in fade-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Panels Found
              </h3>
              <p className="text-gray-500 mb-6">
                There are no interview panels configured for this applicant&apos;s stream. You can skip panel assignment and just record the payment, or create panels first.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={skipAndRecordPayment}
                  disabled={paymentProcessing}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {paymentProcessing ? "Processing..." : "Skip & Record Payment"}
                </button>
                <NextLink
                  href="/admin/dashboard/panels"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200 text-center"
                >
                  Go to Panels Page
                </NextLink>
                <button
                  onClick={() => setNoPanelsModal({ show: false, id: null })}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <main
        className={`transition-all duration-300 px-4 md:px-8 py-8 ${
          sidebarCollapsed ? "md:ml-0" : "md:ml-[280px]"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Admission Enquiries
              </h1>
              <p className="text-gray-500 mt-1">
                Manage and track student applications
              </p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between">
            {/* Stream Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setStreamFilter(level.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    streamFilter === level.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>

            {/* Year & Stream Selectors */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {availableSubStreams.length > 0 && (
                <select
                  value={subStreamFilter}
                  onChange={(e) => setSubStreamFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700 w-full sm:w-56"
                >
                  <option value="All">All Streams</option>
                  {availableSubStreams.map((s: any) => (
                    <option key={s.streamId} value={s.streamId}>
                      {(s as any).course || (s as any).name}
                    </option>
                  ))}
                </select>
              )}

               {/* <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700 w-full sm:w-auto"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year === "All" ? "All Years" : year}
                  </option>
                ))}
              </select> */}
            </div>
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or whatsapp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : filteredAdmissions.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No admission enquiries found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Applicant Name</th>
                      <th className="px-6 py-4">App.ID</th>
                      <th className="px-6 py-4">Stream</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 hover:bg-opacity-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-semibold text-sm">
                          JN{String(item.id || "").padStart(4, "0")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              getLevelByStream(item.stream) === "8"
                                ? "bg-purple-100 text-purple-800"
                                : getLevelByStream(item.stream) === "11"
                                  ? "bg-blue-100 text-blue-800"
                                  : getLevelByStream(item.stream) === "Degree"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {getStreamName(item.stream)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(item.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4 text-center flex gap-2">
                          
                          
                          {userRole !== 'panel_admin' && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          {userRole !== 'panel_admin' && (
                            <button
                              onClick={() => handleWhatsAppClick(item.whatsapp)}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <FaWhatsapp size={18} />
                            </button>
                          )}
                          <NextLink
                            href={`/admin/dashboard/enquiries/${encodeId(item.id)}`}
                            className="p-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </NextLink>
                          {userRole !== 'panel_admin' && item.address !== null && (
                            <button
                              onClick={() => handleRecordPayment(item.id)}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                              title="Record Payment"
                            >
                              <IndianRupee size={18} />
                            </button>
                          )}
                          {userRole !== 'panel_admin' && hasSecondStep.includes(item.stream) && <button
                            onClick={() => handleCopyLink(item.id)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="Copy Application Link"
                          >
                            <LinkIcon size={18} />
                          </button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && filteredAdmissions.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredAdmissions.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredAdmissions.length}
                  </span>{" "}
                  results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {getPaginationItems().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === "number" && handlePageChange(page)}
                      disabled={typeof page !== "number"}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : typeof page === "number"
                          ? "border border-gray-300 hover:bg-gray-50 text-gray-700"
                          : "text-gray-500 cursor-default px-1"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default function Enquiries() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-gray-200 border-t-emerald-600 animate-spin rounded-full mx-auto" />
      </div>
    }>
      <EnquiriesContent />
    </Suspense>
  );
}
