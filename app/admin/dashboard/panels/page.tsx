"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import AdminNav from "@/components/AdminNav";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Users,
  Eye,
  X,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  hsProgrammes,
  bsProgrammes,
  hssProgrammes,
  getLevelByStream,
  getStreamName,
} from "@/assets/data/programmes";
import { encodeId } from "@/functions/uid_encode";
import toast from "react-hot-toast";

interface Admission {
  id: number;
  name: string;
  whatsapp: string;
  stream: string;
  created_at: string;
  fee_done?: boolean;
}

interface PanelAssignment {
  id: number;
  panel_id: number;
  admission_id: number;
  assigned_at: string;
  admission: Admission;
}

interface Panel {
  id: number;
  name: string;
  level: string;
  stream: string | null;
  created_at: string;
  assignments: PanelAssignment[];
}

const PanelsContent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [streamFilter, setStreamFilter] = useState(searchParams.get("stream") || "All");
  const [subStreamFilter, setSubStreamFilter] = useState(searchParams.get("substream") || "All");
  const [selectedPanelId, setSelectedPanelId] = useState<number | "all">("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Add panel modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPanelName, setNewPanelName] = useState("");
  const [modalLevel, setModalLevel] = useState("");
  const [modalStream, setModalStream] = useState("");
  const [addingPanel, setAddingPanel] = useState(false);

  // Compute available streams for the modal based on modalLevel
  const modalAvailableStreams = useMemo(() => {
    switch (modalLevel) {
      case "8": return hsProgrammes;
      case "11": return hssProgrammes;
      case "Degree": return bsProgrammes;
      default: return [];
    }
  }, [modalLevel]);

  const openAddModal = () => {
    setModalLevel(streamFilter !== "All" ? streamFilter : "");
    setModalStream(subStreamFilter !== "All" ? subStreamFilter : "");
    setNewPanelName("");
    setShowAddModal(true);
  };

  // Delete confirm
  const [deletePanelId, setDeletePanelId] = useState<number | null>(null);
  const [deletingPanel, setDeletingPanel] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const itemsPerPage = 10;

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (streamFilter !== "All") params.set("stream", streamFilter);
    if (subStreamFilter !== "All") params.set("substream", subStreamFilter);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newQuery = params.toString() ? `?${params.toString()}` : "";
    const currentQuery = window.location.search;

    if (currentQuery !== newQuery) {
      router.replace(`${pathname}${newQuery}`, { scroll: false });
    }
  }, [searchQuery, streamFilter, subStreamFilter, currentPage, pathname, router]);

  useEffect(() => {
    const handleSidebarToggle = (event: any) => {
      setSidebarCollapsed(event.detail?.collapsed || false);
    };
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  const fetchPanels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/panels");
      const data = await res.json();
      if (data.success) {
        setPanels(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch panels", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanels();
  }, []);

  // Reset subStreamFilter when level changes
  useEffect(() => {
    setSubStreamFilter("All");
    setSelectedPanelId("all");
  }, [streamFilter]);

  useEffect(() => {
    setSelectedPanelId("all");
  }, [subStreamFilter]);

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

  // Filter panels based on level + stream
  const filteredPanels = useMemo(() => {
    let result = panels;

    if (streamFilter !== "All") {
      if (streamFilter === "Rabbani") {
        result = result.filter((p) => p.level === "Rabbani");
      } else {
        result = result.filter((p) => p.level === streamFilter);
        if (subStreamFilter !== "All") {
          result = result.filter((p) => p.stream === subStreamFilter);
        }
      }
    }

    return result;
  }, [panels, streamFilter, subStreamFilter]);

  // Get all applicants from filtered panels, optionally further filtered by selected panel tab
  const filteredApplicants = useMemo(() => {
    let sourcePanels = filteredPanels;
    if (selectedPanelId !== "all") {
      sourcePanels = sourcePanels.filter((p) => p.id === selectedPanelId);
    }

    let applicants = sourcePanels.flatMap((panel) =>
      panel.assignments.map((a) => ({
        ...a.admission,
        panelName: panel.name,
        panelId: panel.id,
        assignedAt: a.assigned_at,
      }))
    );

    // Search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      applicants = applicants.filter((item) => {
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

    return applicants;
  }, [filteredPanels, selectedPanelId, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredApplicants.slice(indexOfFirstItem, indexOfLastItem);

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

  // — Add Panel —
  const handleAddPanel = async () => {
    if (!newPanelName.trim()) {
      toast.error("Panel name is required");
      return;
    }

    if (!modalLevel) {
      toast.error("Please select a level");
      return;
    }

    // For non-Rabbani levels, a stream must be selected
    if (modalLevel !== "Rabbani" && !modalStream) {
      toast.error("Please select a stream");
      return;
    }

    const level = modalLevel;
    const stream: string | null = modalLevel === "Rabbani" ? null : modalStream || null;

    setAddingPanel(true);
    try {
      const res = await fetch("/api/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPanelName.trim(), level, stream }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Panel created successfully");
        setNewPanelName("");
        setShowAddModal(false);
        fetchPanels();
      } else {
        toast.error("Failed to create panel: " + data.error);
      }
    } catch {
      toast.error("Failed to create panel");
    } finally {
      setAddingPanel(false);
    }
  };

  // — Delete Panel —
  const confirmDeletePanel = async () => {
    if (!deletePanelId) return;
    setDeletingPanel(true);
    try {
      const res = await fetch(`/api/panels/${deletePanelId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Panel deleted");
        setDeletePanelId(null);
        if (selectedPanelId === deletePanelId) setSelectedPanelId("all");
        fetchPanels();
      } else {
        toast.error("Failed to delete panel: " + data.error);
      }
    } catch {
      toast.error("Failed to delete panel");
    } finally {
      setDeletingPanel(false);
    }
  };

  const levels = [
    { value: "All", label: "All Levels" },
    { value: "8", label: "Standard 8" },
    { value: "11", label: "+1 (Plus One)" },
    { value: "Degree", label: "Degree" },
    { value: "Rabbani", label: "Rabbani Finishing" },
  ];

  const getSelectedPanelAssignmentCount = (panelId: number) => {
    const panel = filteredPanels.find((p) => p.id === panelId);
    return panel?.assignments.length || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      {/* Add Panel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in fade-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Create Panel</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Panel Name
                  </label>
                  <input
                    type="text"
                    value={newPanelName}
                    onChange={(e) => setNewPanelName(e.target.value)}
                    placeholder="e.g. Panel A"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyDown={(e) => e.key === "Enter" && handleAddPanel()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={modalLevel}
                    onChange={(e) => { setModalLevel(e.target.value); setModalStream(""); }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700"
                  >
                    <option value="">Select Level</option>
                    {levels.filter((l) => l.value !== "All").map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                {modalLevel && modalLevel !== "Rabbani" && modalAvailableStreams.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stream
                    </label>
                    <select
                      value={modalStream}
                      onChange={(e) => setModalStream(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700"
                    >
                      <option value="">Select Stream</option>
                      {modalAvailableStreams.map((s: any) => (
                        <option key={s.streamId} value={s.streamId}>
                          {(s as any).course || (s as any).name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={addingPanel}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPanel}
                    disabled={addingPanel}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {addingPanel ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create Panel"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Panel Confirmation Modal */}
      {deletePanelId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in fade-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Panel</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this panel? All applicant assignments in this panel will be removed. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletePanelId(null)}
                  disabled={deletingPanel}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePanel}
                  disabled={deletingPanel}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {deletingPanel ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete"
                  )}
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
                Interview Panels
              </h1>
              <p className="text-gray-500 mt-1">
                Manage panels and view assigned applicants
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200"
            >
              <Plus size={18} />
              Add Panel
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between">
            {/* Level Filter */}
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

            {/* Stream Selector */}
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

          {/* Panel Tabs */}
          {filteredPanels.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-3">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => { setSelectedPanelId("all"); setCurrentPage(1); }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedPanelId === "all"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Users size={15} />
                  All Panels
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedPanelId === "all"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {filteredPanels.reduce((sum, p) => sum + p.assignments.length, 0)}
                  </span>
                </button>
                {filteredPanels.map((panel) => (
                  <div key={panel.id} className="relative group flex items-center">
                    <button
                      onClick={() => { setSelectedPanelId(panel.id); setCurrentPage(1); }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                        selectedPanelId === panel.id
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {panel.name}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        selectedPanelId === panel.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {panel.assignments.length}
                      </span>
                    </button>
                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletePanelId(panel.id); }}
                      className="ml-1 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Panel"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for no panels */}
          {!loading && filteredPanels.length === 0 && streamFilter !== "All" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-6">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No panels yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first panel for{" "}
                <span className="font-medium">
                  {levels.find((l) => l.value === streamFilter)?.label}
                  {subStreamFilter !== "All" && ` — ${getStreamName(subStreamFilter)}`}
                </span>
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-200"
              >
                <Plus size={18} />
                Create Panel
              </button>
            </div>
          )}

          {/* Prompt to select a level */}
          {!loading && streamFilter === "All" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a level</h3>
              <p className="text-gray-500">
                Choose a level and stream from the filters above to view and manage panels.
              </p>
            </div>
          )}

          {/* Table */}
          {streamFilter !== "All" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="h-10 w-10 border-4 border-gray-200 border-t-blue-600 animate-spin rounded-full mx-auto mb-3" />
                  Loading panels...
                </div>
              ) : filteredApplicants.length === 0 && filteredPanels.length > 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No applicants assigned to{" "}
                  {selectedPanelId === "all" ? "any panel" : "this panel"} yet.
                </div>
              ) : filteredApplicants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                        <th className="px-6 py-4">#</th>
                        <th className="px-6 py-4">Applicant Name</th>
                        <th className="px-6 py-4">App.ID</th>
                        <th className="px-6 py-4">Stream</th>
                        <th className="px-6 py-4">Panel</th>
                        <th className="px-6 py-4">Assigned Date</th>
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
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              {item.panelName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">
                            {new Date(item.assignedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <NextLink
                              href={`/admin/dashboard/enquiries/${encodeId(item.id)}`}
                              className="p-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors inline-flex"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </NextLink>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/* Pagination Controls */}
              {!loading && filteredApplicants.length > itemsPerPage && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredApplicants.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">{filteredApplicants.length}</span>{" "}
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
          )}
        </div>
      </main>
    </div>
  );
};

export default function PanelsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-gray-200 border-t-blue-600 animate-spin rounded-full mx-auto" />
        </div>
      }
    >
      <PanelsContent />
    </Suspense>
  );
}