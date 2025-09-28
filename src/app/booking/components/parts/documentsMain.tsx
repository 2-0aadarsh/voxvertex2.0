'use client';

import React, { useState } from 'react';
import { Upload, Plus, Eye, Download, Send, FileText, ChevronDown, ChevronUp, Search, ArrowDown, X } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  size: string;
  created: string;
  event: string;
  amount: string;
  recipient: string;
  status: 'signed' | 'sent' | 'pending' | 'approved' | 'pending_review';
  signedDate?: string;
}

type TabType = 'outgoing' | 'incoming';

export default function DocumentsMain() {
  const [activeTab, setActiveTab] = useState<TabType>('outgoing');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('All Tags');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentName: '',
    documentType: '',
    file: null as File | null
  });
  const [documents, setDocuments] = useState({
    outgoing: [
      {
        id: '1',
        name: 'AI_Summit_2024_MOU_Dr_Sarah_Chen.pdf',
        size: '245 KB',
        created: '3/5/2024',
        event: 'AI Summit 2024',
        amount: '$8,500',
        recipient: 'Dr. Sarah Chen',
        status: 'signed' as const,
        signedDate: '3/10/2024'
      },
      {
        id: '2',
        name: 'AI_Summit_2024_MOU_Dr_Sarah_Chen.pdf',
        size: '245 KB',
        created: '3/5/2024',
        event: 'AI Summit 2024',
        amount: '$8,500',
        recipient: 'Dr. Sarah Chen',
        status: 'sent' as const
      },
      {
        id: '3',
        name: 'AI_Summit_2024_MOU_Dr_Sarah_Chen.pdf',
        size: '245 KB',
        created: '3/5/2024',
        event: 'AI Summit 2024',
        amount: '$8,500',
        recipient: 'Dr. Sarah Chen',
        status: 'signed' as const
      }
    ],
    incoming: [
      {
        id: '4',
        name: 'AI_Summit_2024_MOU_Dr_Sarah_Chen.pdf',
        size: '245 KB',
        created: '3/5/2024',
        event: 'AI Summit 2024',
        amount: '$8,500',
        recipient: 'Dr. Sarah Chen',
        status: 'approved' as const
      },
      {
        id: '5',
        name: 'AI_Summit_2024_MOU_Dr_Sarah_Chen.pdf',
        size: '245 KB',
        created: '3/5/2024',
        event: 'AI Summit 2024',
        amount: '$8,500',
        recipient: 'Dr. Sarah Chen',
        status: 'pending_review' as const
      },
      {
        id: '6',
        name: 'AI_Summit_2024_MOU_Dr_Sarah_Chen.pdf',
        size: '245 KB',
        created: '3/5/2024',
        event: 'AI Summit 2024',
        amount: '$8,500',
        recipient: 'Dr. Sarah Chen',
        status: 'approved' as const
      },
      {
        id: '7',
        name: 'AI_Summit_2024_MOU_Dr_Sarah_Chen.pdf',
        size: '245 KB',
        created: '3/5/2024',
        event: 'AI Summit 2024',
        amount: '$8,500',
        recipient: 'Dr. Sarah Chen',
        status: 'approved' as const
      }
    ]
  });

  const isIncoming = activeTab === 'incoming';
  const isOutgoing = activeTab === 'outgoing';

  const handleUploadDocument = () => {
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadForm({
      documentName: '',
      documentType: '',
      file: null
    });
  };

  const handleFormSubmit = () => {
    if (uploadForm.documentName && uploadForm.documentType && uploadForm.file) {
      const newDocument = {
        id: Date.now().toString(),
        name: uploadForm.file.name,
        size: `${Math.round(uploadForm.file.size / 1024)} KB`,
        created: new Date().toLocaleDateString(),
        event: 'New Event',
        amount: '$0',
        recipient: 'To be assigned',
        status: 'sent' as const
      };

      setDocuments(prev => ({
        ...prev,
        outgoing: [newDocument, ...prev.outgoing]
      }));

      handleCloseModal();
      setActiveTab('outgoing');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm(prev => ({
        ...prev,
        file: e.target.files![0]
      }));
    }
  };

  const handleGenerateMOU = () => {
    console.log('Generate MOU');
  };

  // Mock data for outgoing documents - updated status values
  const outgoingDocuments: Document[] = documents.outgoing;

  // Mock data for incoming documents
  const incomingDocuments: Document[] = documents.incoming;

  const getStatusBadge = (status: string, isIncoming: boolean = false) => {
    const baseClasses = "px-6 py-1 rounded-lg text-sm font-medium";
    switch (status) {
      case 'signed':
        return `${baseClasses} bg-green-100 border border-green-600 text-green-600`;
      case 'sent':
        return `${baseClasses} bg-green-200 border border-green-600 text-green-600`;
      case 'approved':
        return `${baseClasses} bg-[#1A9D59] text-white`;
      case 'pending_review':
        return `${baseClasses} bg-[#FFA500] text-white`;
      case 'pending':
        return `${baseClasses} bg-[#FF6B35] text-white`;
      default:
        return `${baseClasses} bg-gray-200 text-gray-700`;
    }
  };

  const getActionButton = (status: string, amount: string, isIncoming: boolean = false) => {
    if (isIncoming) {
      switch (status) {
        case 'approved':
          return (
            <button className="flex items-center gap-2 px-6 py-1 border border-[#FF6B35] text-[#FF6B35] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4" />
              View Only
            </button>
          );
        case 'pending_review':
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

  // Stats for outgoing documents
  const outgoingStats = {
    total: 5,
    received: 1,
    reviewed: 1,
    drafts: 1,
    sent: 1
  };

  // Stats for incoming documents
  const incomingStats = {
    signed: 1,
    pendingPay: 1,
    approved: 2,
    presentations: 2,
    bills: 1
  };

  const currentDocuments = isOutgoing ? outgoingDocuments : incomingDocuments;
  const filteredDocuments = currentDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <p className="text-2xl font-bold text-gray-800">{outgoingStats.total}</p>
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
            <p className="text-2xl font-bold text-gray-800">{outgoingStats.received}</p>
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
            <p className="text-2xl font-bold text-gray-800">{outgoingStats.reviewed}</p>
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
            <p className="text-2xl font-bold text-gray-800">{outgoingStats.drafts}</p>
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
            <p className="text-2xl font-bold text-gray-800">{outgoingStats.sent}</p>
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
            <p className="text-2xl font-bold text-gray-800">5</p>
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
            <p className="text-2xl font-bold text-gray-800">1</p>
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
            <p className="text-2xl font-bold text-gray-800">1</p>
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
            <p className="text-2xl font-bold text-gray-800">{incomingStats.approved}</p>
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
            <p className="text-2xl font-bold text-gray-800">{incomingStats.presentations}</p>
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
            <p className="text-2xl font-bold text-gray-800">{incomingStats.bills}</p>
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
                <h2 className="text-2xl font-bold text-[#FF6B35] mb-2">Upload Document</h2>
                <p className="text-gray-600">Upload a document that can be later assigned to speakers</p>
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
                  onChange={(e) => setUploadForm(prev => ({ ...prev, documentName: e.target.value }))}
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
                  onChange={(e) => setUploadForm(prev => ({ ...prev, documentType: e.target.value }))}
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
                  <span className="font-medium text-[#FF6B35]">Note: After uploading, you can assign this document to specific speakers from the documents list. </span>
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
                disabled={!uploadForm.documentName || !uploadForm.documentType || !uploadForm.file}
                className="px-6 py-2.5 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Add Document Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Document Management</h2>
          <p className="text-gray-600 text-sm">Manage outgoing and incoming documents with speakers</p>
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
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
          style={{ textAlign: 'left', textAlignLast: 'left' }}
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
          onClick={() => setActiveTab('outgoing')}
          className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
            isOutgoing
              ? 'text-white bg-[#FF6B35]'
              : 'text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35]'
          }`}
        >
          Outgoing Documents
        </button>
        <button 
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-3 px-4 rounded-md text-center font-medium ${
            isIncoming
              ? 'text-white bg-[#FF6B35]'
              : 'text-gray-600 bg-[#FF6B35]/10 hover:text-[#FF6B35]'
          }`}
        >
          Incoming Documents
        </button>
      </div>

      {/* Stats Cards */}
      {isOutgoing ? renderOutgoingStats() : renderIncomingStats()}

      {/* Documents List */}
      {isOutgoing ? (
        // Table layout for outgoing documents
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FF6B35]/20">
                <th className="text-left py-4 px-6 text-black font-medium">Document</th>
                <th className="text-left py-4 px-6 text-black font-medium">Status</th>
                <th className="text-left py-4 px-6 text-black font-medium">Action</th>
                <th className="text-center py-4 px-6 text-black font-medium">View</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-6 px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-1">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm mb-2">{doc.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                          <span>{doc.size}</span>
                          <span>Created: {doc.created}</span>
                          <span>{doc.event}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">To:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#1A9D59] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">D</span>
                            </div>
                            <span className="text-xs text-gray-800 font-medium">{doc.recipient}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 align-top">
                    <span className={getStatusBadge(doc.status, false)}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-6 px-6 align-top">
                    {getActionButton(doc.status, doc.amount, false)}
                  </td>
                  <td className="py-6 px-6 align-top text-center">
                    <button className="p-2 hover:scale-110 transition-transform duration-200">
                      <Eye className="w-5 h-5 text-[#FF6B35]" />
                    </button>
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
                <th className="text-left py-4 px-6 text-black font-medium">Document</th>
                <th className="text-left py-4 px-6 text-black font-medium">Status</th>
                <th className="text-left py-4 px-6 text-black font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-6 px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-1">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm mb-2">{doc.name}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                          <span>{doc.size}</span>
                          <span>Created: {doc.created}</span>
                          <span>{doc.event}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Received:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-[#1A9D59] rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">D</span>
                            </div>
                            <span className="text-xs text-gray-800 font-medium">{doc.recipient}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 align-top">
                    <span className={getStatusBadge(doc.status, true)}>
                      {doc.status === 'pending_review' ? 'Pending Review' : doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-6 px-6 align-top">
                    {getActionButton(doc.status, doc.amount, true)}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">Try adjusting your search or create a new document.</p>
        </div>
      )}
    </>
  );
}