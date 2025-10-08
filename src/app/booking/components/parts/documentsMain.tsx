"use client";

import React, { useMemo, useState } from "react";
import {
  Upload,
  Plus,
  Eye,
  Download,
  Send,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowDown,
  X,
  Trash2,
} from "lucide-react";
import {
  useGetMyDocumentsQuery,
  type DocumentItem,
  useAssignToSpeakerMutation,
  useAssignToOrganizerMutation,
  useGetEligibleOrganizersQuery,
  useSendToSpeakerMutation,
  useSendToOrganizerMutation,
  useUploadDocumentMutation,
  useLazyDownloadDocumentQuery,
  useDeleteDocumentMutation,
} from "@/store/api/documentsApi";
import { useGetOrganizerBookingsQuery } from "@/store/slices/organizerBookingsSlice";
import { useUserRole } from "@/utils/roleUtils";

interface Document {
  id: string;
  name: string;
  size: string;
  created: string;
  event: string;
  amount: string;
  recipient: string;
  status: "uploaded" | "assigned" | "sent" | "pending_review" | "approved" | "signed" | "declined" | "cancelled" | "pending";
  signedDate?: string;
  originalDoc?: DocumentItem; // Store original document for icon rendering
}



type TabType = "outgoing" | "incoming";

export default function DocumentsMain() {
  const [activeTab, setActiveTab] = useState<TabType>("outgoing");
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("All Tags");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentName: "",
    documentType: "",
    file: null as File | null,
  });

  // Fetch current user's documents (incoming and outgoing)
  const {
    data: myDocsResponse,
    isLoading,
    isError,
  } = useGetMyDocumentsQuery({ page: 1, limit: 50 });
  const userRole = useUserRole();
  const isOrganizer = userRole === "organizer";
  const isSpeaker = userRole === "speaker";
  const { data: organizerBookings } = useGetOrganizerBookingsQuery(undefined, {
    skip: !isOrganizer,
  });
  const { data: eligibleOrganizersResponse } = useGetEligibleOrganizersQuery(
    undefined,
    { skip: !isSpeaker }
  );
  const [assignToSpeaker, { isLoading: isAssigningSpeaker }] =
    useAssignToSpeakerMutation();
  const [assignToOrganizer, { isLoading: isAssigningOrganizer }] =
    useAssignToOrganizerMutation();
  const [sendToSpeaker, { isLoading: isSendingToSpeaker }] =
    useSendToSpeakerMutation();
  const [sendToOrganizer, { isLoading: isSendingToOrganizer }] =
    useSendToOrganizerMutation();
  const [uploadDocument, { isLoading: isUploadingDocument }] =
    useUploadDocumentMutation();
  const [triggerDownload] = useLazyDownloadDocumentQuery();
  const [deleteDocument, { isLoading: isDeletingDocument }] =
    useDeleteDocumentMutation();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetDocId, setAssignTargetDocId] = useState<string | null>(
    null
  );
  const [showSpeakerDropdown, setShowSpeakerDropdown] = useState(false);
  const [showOrganizerDropdown, setShowOrganizerDropdown] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<any>(null);
  const [selectedOrganizer, setSelectedOrganizer] = useState<any>(null);

  const formatName = (doc: DocumentItem) =>
    doc.file?.originalName || doc.documentName || "Untitled";
  const formatSize = (doc: DocumentItem) =>
    doc.fileSizeFormatted ||
    (doc.file?.size ? `${Math.round(doc.file.size / 1024)} KB` : "-");
  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString() : "-";
  const getFullName = (
    u:
      | DocumentItem["organizer"]
      | DocumentItem["speaker"]
      | DocumentItem["sender"]
      | DocumentItem["receiver"]
  ) => {
    if (!u || typeof u === "string") return "-";
    const first = u.firstName || "";
    const last = u.lastName || "";
    const full = `${first} ${last}`.trim();
    return full || u.email || "-";
  };

  const getDocumentIcon = (doc: DocumentItem) => {
    const mimeType = doc.file?.mimeType;
    if (mimeType === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-600" />;
    } else if (
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    } else {
      return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  const outgoingDocuments: Document[] = useMemo(() => {
    const list = myDocsResponse?.data?.outgoing || [];
    return list.map((d) => ({
      id: d._id,
      name: formatName(d),
      size: formatSize(d),
      created: formatDate(d.createdAt),
      event: d.documentType || "-",
      amount: "-",
      recipient: getFullName(d.receiver || d.speaker || d.organizer),
      status: (d.status as Document["status"]) || "pending_review",
      signedDate: d.approvedAt ? formatDate(d.approvedAt) : undefined,
      originalDoc: d, // Store original document for icon rendering
    }));
  }, [myDocsResponse]);

  const incomingDocuments: Document[] = useMemo(() => {
    const list = myDocsResponse?.data?.incoming || [];
    return list.map((d) => ({
      id: d._id,
      name: formatName(d),
      size: formatSize(d),
      created: formatDate(d.createdAt),
      event: d.documentType || "-",
      amount: "-",
      recipient: getFullName(d.sender || d.organizer || d.speaker),
      status: (d.status as Document["status"]) || "pending_review",
      signedDate: d.approvedAt ? formatDate(d.approvedAt) : undefined,
      originalDoc: d, // Store original document for icon rendering
    }));
  }, [myDocsResponse]);

  const isIncoming = activeTab === "incoming";
  const isOutgoing = activeTab === "outgoing";

  const handleUploadDocument = () => {
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadForm({
      documentName: "",
      documentType: "",
      file: null,
    });
  };

  const handleFormSubmit = async () => {
    if (
      !(uploadForm.documentName && uploadForm.documentType && uploadForm.file)
    )
      return;

    console.log("Upload attempt:", {
      documentName: uploadForm.documentName,
      documentType: uploadForm.documentType,
      file: uploadForm.file,
      fileName: uploadForm.file?.name,
      fileSize: uploadForm.file?.size,
      fileType: uploadForm.file?.type,
    });

    try {
      const res = await uploadDocument({
        documentName: uploadForm.documentName,
        documentType: uploadForm.documentType as any,
        file: uploadForm.file,
      }).unwrap();

      // Switch to outgoing after successful upload; assignment is user-initiated
      setActiveTab("outgoing");
      setShowUploadModal(false);

      // Reset form
      setUploadForm({
        documentName: "",
        documentType: "",
        file: null,
      });
    } catch (e: any) {
      console.error("Upload failed", e);
      // Show more detailed error information
      if (e?.data?.message) {
        alert(`Upload failed: ${e.data.message}`);
      } else if (e?.message) {
        alert(`Upload failed: ${e.message}`);
      } else {
        alert("Upload failed. Please try again.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm((prev) => ({
        ...prev,
        file: e.target.files![0],
      }));
    }
  };

  const handleGenerateMOU = () => {
    console.log("Generate MOU");
  };

  const handleView = async (documentId: string) => {
    try {
      const res = await triggerDownload(documentId).unwrap();
      const url = (res as any)?.data?.downloadUrl;
      if (url) {
        window.open(url, "_blank", "noopener");
      }
    } catch (e) {
      console.error("View/download failed", e);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument({ documentId }).unwrap();
      } catch (e) {
        console.error("Delete failed", e);
      }
    }
  };

  const openAssignModal = (docId: string) => {
    setAssignTargetDocId(docId);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssignTargetDocId(null);
    setShowSpeakerDropdown(false);
    setShowOrganizerDropdown(false);
    setSelectedSpeaker(null);
    setSelectedOrganizer(null);
  };

  const handleAssign = async (targetId: string, relatedBookingId?: string) => {
    if (!assignTargetDocId) return;
    try {
      if (isOrganizer) {
        await assignToSpeaker({
          documentId: assignTargetDocId,
          speakerId: targetId,
          relatedBookingId,
        }).unwrap();
      } else if (isSpeaker) {
        await assignToOrganizer({
          documentId: assignTargetDocId,
          organizerId: targetId,
          relatedBookingId,
        }).unwrap();
      }
      closeAssignModal();
    } catch (e) {
      console.error("Assignment failed", e);
    }
  };

  const toggleSpeakerDropdown = () => {
    setShowSpeakerDropdown(!showSpeakerDropdown);
    setShowOrganizerDropdown(false);
  };

  const toggleOrganizerDropdown = () => {
    setShowOrganizerDropdown(!showOrganizerDropdown);
    setShowSpeakerDropdown(false);
  };

  const handleSpeakerSelect = (booking: any) => {
    setSelectedSpeaker(booking);
    setShowSpeakerDropdown(false);
  };

  const handleOrganizerSelect = (organizer: any) => {
    setSelectedOrganizer(organizer);
    setShowOrganizerDropdown(false);
  };

  const handleSend = async (documentId: string) => {
    try {
      if (isOrganizer) {
        await sendToSpeaker({ documentId }).unwrap();
      } else if (isSpeaker) {
        await sendToOrganizer({ documentId }).unwrap();
      }
    } catch (e) {
      console.error("Send failed", e);
    }
  };

  // Use fetched documents

  const getStatusBadge = (status: string, isIncoming: boolean = false) => {
    const baseClasses = "px-6 py-1 rounded-lg text-sm font-medium";
    switch (status) {
      case "signed":
        return `${baseClasses} bg-green-100 border border-green-600 text-green-600`;
      case "sent":
        return `${baseClasses} bg-green-200 border border-green-600 text-green-600`;
      case "approved":
        return `${baseClasses} bg-[#1A9D59] text-white`;
      case "pending_review":
        return `${baseClasses} bg-[#FFA500] text-white`;
      case "pending":
        return `${baseClasses} bg-[#FF6B35] text-white`;
      case "assigned":
        // show as draft styling (neutral)
        return `${baseClasses} bg-gray-200 text-gray-700`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-700`;
    }
  };

  const getActionButton = (
    status: string,
    amount: string,
    isIncoming: boolean = false
  ) => {
    if (isIncoming) {
      switch (status) {
        case "approved":
          return (
            <button className="flex items-center gap-2 px-6 py-1 border border-[#FF6B35] text-[#FF6B35] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4" />
              View Only
            </button>
          );
        case "pending_review":
          return (
            <button className="flex items-center gap-2 px-6 py-1 border border-gray-600 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
          );
        default:
          return (
            <button className="flex items-center gap-2 px-6 py-1 border border-[#FF6B35] text-[#FF6B35] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4" />
              View Only
            </button>
          );
      }
    }

    // For outgoing documents, always show Process Payment
    return (
      <button className="bg-[#FF6B35]/10 border border-[#FF6B35] text-[#FF6B35] px-6 py-1 rounded-lg text-sm font-medium hover:bg-[#FF6B35] hover:text-white transition-colors">
        Process Payment
      </button>
    );
  };

  // Dynamic stats for outgoing documents
  const outgoingStats = useMemo(() => {
    const docs = outgoingDocuments;
    return {
      total: docs.length,
      received: docs.filter((d) => d.status === "sent").length,
      reviewed: docs.filter((d) => d.status === "pending_review").length,
      drafts: docs.filter((d) => d.status === "assigned").length,
      sent: docs.filter((d) => d.status === "sent").length,
    };
  }, [outgoingDocuments]);

  // Dynamic stats for incoming documents
  const incomingStats = useMemo(() => {
    const docs = incomingDocuments;
    return {
      total: docs.length,
      received: docs.filter((d) => d.status === "sent").length,
      reviewed: docs.filter((d) => d.status === "pending_review").length,
      approved: docs.filter((d) => d.status === "approved").length,
      presentations: docs.filter(
        (d) => d.event === "MOU" || d.event === "Contract"
      ).length,
      bills: docs.filter((d) => d.event === "Invoice").length,
    };
  }, [incomingDocuments]);

  const currentDocuments = isOutgoing ? outgoingDocuments : incomingDocuments;
  const filteredDocuments = currentDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.event.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderOutgoingStats = () => (
    <div className="grid grid-cols-5 gap-4 mb-6">
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-800">
              {outgoingStats.total}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Received</p>
            <p className="text-2xl font-bold text-gray-800">
              {outgoingStats.received}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Reviewed</p>
            <p className="text-2xl font-bold text-gray-800">
              {outgoingStats.reviewed}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Drafts</p>
            <p className="text-2xl font-bold text-gray-800">
              {outgoingStats.drafts}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Sent</p>
            <p className="text-2xl font-bold text-gray-800">
              {outgoingStats.sent}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIncomingStats = () => (
    <div className="grid grid-cols-6 gap-4 mb-6">
      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-800">
              {incomingStats.total}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Received</p>
            <p className="text-2xl font-bold text-gray-800">
              {incomingStats.received}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Reviewed</p>
            <p className="text-2xl font-bold text-gray-800">
              {incomingStats.reviewed}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-gray-800">
              {incomingStats.approved}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Presentations</p>
            <p className="text-2xl font-bold text-gray-800">
              {incomingStats.presentations}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#FF6B35] rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Bills</p>
            <p className="text-2xl font-bold text-gray-800">
              {incomingStats.bills}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-[#FF6B35]/20  flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-2">
                  Upload Document
                </h2>
                <p className="text-gray-600">
                  Upload a document that can be later assigned to speakers
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Document Name */}
              <div className="relative">
                <input
                  type="text"
                  id="documentName"
                  value={uploadForm.documentName}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      documentName: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none"
                  placeholder="Enter document name"
                />
                <label
                  htmlFor="documentName"
                  className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-[#FF6B35] font-medium"
                >
                  Document Name*
                </label>
              </div>

              {/* Document Type */}
              <div className="relative">
                <select
                  id="documentType"
                  value={uploadForm.documentType}
                  onChange={(e) =>
                    setUploadForm((prev) => ({
                      ...prev,
                      documentType: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none peer appearance-none bg-white"
                >
                  <option value="">Select Document Type</option>
                  <option value="MOU">MOU</option>
                  <option value="Contract">Contract</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Agreement">Agreement</option>
                </select>
                <label
                  htmlFor="documentType"
                  className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-[#FF6B35] font-medium transition-all duration-200"
                >
                  Document Type*
                </label>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Upload File */}
              <div className="relative">
                <input
                  type="file"
                  id="uploadFile"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#FF6B35] focus:border-[#FF6B35] outline-none file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-[#FF6B35] file:text-white file:font-medium hover:file:bg-[#FF6B35]/90"
                  accept=".pdf,.doc,.docx"
                />
                <label
                  htmlFor="uploadFile"
                  className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-[#FF6B35] font-medium"
                >
                  Upload File*
                </label>
              </div>

              {/* Note */}
              <div className="bg-[#FF6B35]/10 border border-[#FF6B35] rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-[#FF6B35]">
                    Note: After uploading, you can assign this document to
                    specific speakers from the documents list.{" "}
                  </span>
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleCloseModal}
                className="px-6 py-2.5 border border-[#FF6B35] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/10 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={
                  !uploadForm.documentName ||
                  !uploadForm.documentType ||
                  !uploadForm.file ||
                  isUploadingDocument
                }
                className="px-6 py-2.5 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isUploadingDocument ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-[#FF6B35]/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {isOrganizer
                  ? "Assign Speaker to Document"
                  : "Assign Organizer to Document"}
              </h3>
              <button
                onClick={closeAssignModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Select a {isOrganizer ? "speaker" : "organizer"} to assign to
                the document.
              </p>
            </div>

            <div className="space-y-4">
              {isOrganizer ? (
                // Show confirmed speakers for organizer
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Speaker
                  </label>
                  <div className="relative">
                    <button
                      onClick={toggleSpeakerDropdown}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white text-left flex items-center justify-between hover:bg-gray-50"
                    >
                      {selectedSpeaker ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {selectedSpeaker.speaker.firstName?.[0]}
                              {selectedSpeaker.speaker.lastName?.[0]}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">
                              {selectedSpeaker.speaker.firstName}{" "}
                              {selectedSpeaker.speaker.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedSpeaker.speaker.email} •{" "}
                              {selectedSpeaker.eventDetails?.name || "Event"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          Choose a speaker...
                        </div>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          showSpeakerDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Speaker List Dropdown */}
                    {showSpeakerDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {organizerBookings?.data?.confirmed?.length === 0 ? (
                          <div className="p-4 text-sm text-gray-600">
                            No confirmed speakers found.
                          </div>
                        ) : (
                          organizerBookings?.data?.confirmed?.map((booking) => (
                            <button
                              key={booking._id}
                              onClick={() => handleSpeakerSelect(booking)}
                              className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {booking.speaker.firstName?.[0]}
                                    {booking.speaker.lastName?.[0]}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {booking.speaker.firstName}{" "}
                                    {booking.speaker.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {booking.speaker.email} •{" "}
                                    {booking.eventDetails?.name || "Event"}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Show eligible organizers for speaker
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Organizer
                  </label>
                  <div className="relative">
                    <button
                      onClick={toggleOrganizerDropdown}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white text-left flex items-center justify-between hover:bg-gray-50"
                    >
                      {selectedOrganizer ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {selectedOrganizer.firstName?.[0]}
                              {selectedOrganizer.lastName?.[0]}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">
                              {selectedOrganizer.firstName}{" "}
                              {selectedOrganizer.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedOrganizer.email} •{" "}
                              {selectedOrganizer.recentBooking?.eventDetails
                                ?.name || "Event"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          Choose an organizer...
                        </div>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          showOrganizerDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Organizer List Dropdown */}
                    {showOrganizerDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {eligibleOrganizersResponse?.data?.length === 0 ? (
                          <div className="p-4 text-sm text-gray-600">
                            No eligible organizers found.
                          </div>
                        ) : (
                          eligibleOrganizersResponse?.data?.map((organizer) => (
                            <button
                              key={organizer._id}
                              onClick={() => handleOrganizerSelect(organizer)}
                              className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {organizer.firstName?.[0]}
                                    {organizer.lastName?.[0]}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {organizer.firstName} {organizer.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {organizer.email} •{" "}
                                    {organizer.recentBooking?.eventDetails
                                      ?.name || "Event"}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Note Section */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-medium">Note:</span> Speaker fee and event
                details will be automatically populated from the speaker
                profile.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeAssignModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (isOrganizer && selectedSpeaker) {
                    handleAssign(
                      selectedSpeaker.speaker._id,
                      selectedSpeaker._id
                    );
                  } else if (isSpeaker && selectedOrganizer) {
                    handleAssign(
                      selectedOrganizer._id,
                      selectedOrganizer.recentBooking?.bookingId
                    );
                  }
                }}
                disabled={
                  (isOrganizer && !selectedSpeaker) ||
                  (isSpeaker && !selectedOrganizer) ||
                  isAssigningSpeaker ||
                  isAssigningOrganizer
                }
                className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isOrganizer ? "Assign Speaker" : "Assign Organizer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Add Document Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Document Management
          </h2>
          <p className="text-gray-600 text-sm">
            Manage outgoing and incoming documents with speakers
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleUploadDocument}
            className="flex items-center gap-2 px-4 py-2 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
          <button
            onClick={handleGenerateMOU}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#FF6B35]/90 font-medium"
          >
            <Plus className="w-4 h-4" />
            Generate MOU
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center space-x-10 mb-6">
        <div className="relative flex-1 max-w-3xl">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search documents, speakers, or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#FF6B35] bg-[#FF6B35]/15 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
          />
        </div>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-20 py-2.5 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] text-sm"
          style={{ textAlign: "left", textAlignLast: "left" }}
        >
          <option>All Tags</option>
          <option>MOU</option>
          <option>Contract</option>
          <option>Invoice</option>
        </select>
      </div>

      {/* Document Tabs */}
      <div className="bg-gray-50 p-1 rounded-lg mb-6 flex w-full">
        <button
          onClick={() => setActiveTab("outgoing")}
          className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
            isOutgoing
              ? "text-white bg-[#FF6B35]"
              : "text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35]"
          }`}
        >
          Outgoing Documents
        </button>
        <button
          onClick={() => setActiveTab("incoming")}
          className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
            isIncoming
              ? "text-white bg-[#FF6B35]"
              : "text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35]"
          }`}
        >
          Incoming Documents
        </button>
      </div>

      {/* Stats Cards */}
      {isOutgoing ? renderOutgoingStats() : renderIncomingStats()}

      {/* Documents List */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 text-sm text-gray-600">Loading documents...</div>
        </div>
      ) : isError ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 text-sm text-red-600">
            Failed to load documents.
          </div>
        </div>
      ) : isOutgoing ? (
        // Table layout for outgoing documents
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FF6B35]/20">
                <th className="text-left py-4 px-6 text-black font-medium">
                  Document
                </th>
                <th className="text-left py-4 px-6 text-black font-medium">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-black font-medium">
                  Action
                </th>
                <th className="text-center py-4 px-6 text-black font-medium">
                  View
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-6 px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-1">
                        {doc.originalDoc ? (
                          getDocumentIcon(doc.originalDoc)
                        ) : (
                          <FileText className="w-8 h-8 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm mb-2">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                          <span>{doc.size}</span>
                          <span>Created: {doc.created}</span>
                          <span>{doc.event}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">To:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#1A9D59] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                D
                              </span>
                            </div>
                            <span className="text-xs text-gray-800 font-medium">
                              {doc.recipient}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 align-top">
                    <span className={getStatusBadge(doc.status, false)}>
                      {doc.status === "assigned"
                        ? "draft"
                        : doc.status.charAt(0).toUpperCase() +
                          doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-6 px-6 align-top">
                    <div className="flex items-center gap-3">
                      {doc.status === "uploaded" && (
                        <button
                          onClick={() => openAssignModal(doc.id)}
                          className="px-6 py-1 border border-[#FF6B35] text-[#FF6B35] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          {isOrganizer ? "Assign Speaker" : "Assign Organizer"}
                        </button>
                      )}
                      {doc.status === "assigned" && (
                        <button
                          disabled={isSendingToSpeaker || isSendingToOrganizer}
                          onClick={() => handleSend(doc.id)}
                          className="bg-[#FF6B35]/10 border border-[#FF6B35] text-[#FF6B35] px-6 py-1 rounded-lg text-sm font-medium hover:bg-[#FF6B35] hover:text-white transition-colors disabled:opacity-50"
                        >
                          Send
                        </button>
                      )}
                      {getActionButton(doc.status, doc.amount, false)}
                    </div>
                  </td>
                  <td className="py-6 px-6 align-top text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(doc.id)}
                        className="p-2 hover:scale-110 transition-transform duration-200"
                        title="View Document"
                      >
                        <Eye className="w-5 h-5 text-[#FF6B35]" />
                      </button>
                      {doc.status !== "sent" && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={isDeletingDocument}
                          className="p-2 hover:scale-110 transition-transform duration-200 disabled:opacity-50"
                          title="Delete Document"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Table layout for incoming documents
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FF6B35]/20">
                <th className="text-left py-4 px-6 text-black font-medium">
                  Document
                </th>
                <th className="text-left py-4 px-6 text-black font-medium">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-black font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-6 px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-1">
                        {doc.originalDoc ? (
                          getDocumentIcon(doc.originalDoc)
                        ) : (
                          <FileText className="w-8 h-8 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm mb-2">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                          <span>{doc.size}</span>
                          <span>Created: {doc.created}</span>
                          <span>{doc.event}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">
                            Received:
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#1A9D59] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                D
                              </span>
                            </div>
                            <span className="text-xs text-gray-800 font-medium">
                              {doc.recipient}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 align-top">
                    <span className={getStatusBadge(doc.status, true)}>
                      {doc.status === "pending_review"
                        ? "Pending Review"
                        : doc.status.charAt(0).toUpperCase() +
                          doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-6 px-6 align-top">
                    <div className="flex items-center gap-3">
                      {getActionButton(doc.status, doc.amount, true)}
                      <button
                        onClick={() => handleView(doc.id)}
                        className="p-2 hover:scale-110 transition-transform duration-200"
                        title="View"
                      >
                        <Eye className="w-5 h-5 text-[#FF6B35]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state when no documents */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No documents found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or create a new document.
          </p>
        </div>
      )}
    </>
  );
}
