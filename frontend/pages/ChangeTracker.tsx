import React, { useState, useEffect } from 'react';
import { ListChecks, Search, Filter, X, Save, Edit2, Eye } from 'lucide-react';
import { fetchChangeRequests, updateChangeRequest } from '@/services/api';

// Types
interface ChangeRequest {
    id: string;
    account_name: string;
    salesforce_region?: string;
    change_type: string;
    status: string;
    status_notes?: string;
    created_at: string;
    updated_at: string;

    // Add New Sites
    site_id?: string;
    bandwidth?: string;
    new_circuit_type?: string;
    site_address?: string;
    contract_term?: number;

    // Upgrade/Downgrade
    current_circuit_id?: string;
    existing_bandwidth?: string;
    new_bandwidth?: string;

    // Shifting
    circuit_id_move?: string;
    new_address?: string;
    old_circuit_address?: string;

    // Decommission
    decommission_circuit_id?: string;
    decommission_date?: string;
    decommission_notice_period?: string;
    circuit_details?: string;
    reason_for_decommission?: string;

    // Common
    new_intl_dom_split?: string;
    notes?: string;
    salesforce_record_id?: string;
}

export const ChangeTracker: React.FC = () => {
    const [requests, setRequests] = useState<ChangeRequest[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<ChangeRequest>>({});

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const statuses = ['New Request', 'In Progress', 'Successful', 'Unsuccessful', 'Pending'];

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoadingRequests(true);
        try {
            const data = await fetchChangeRequests();
            setRequests(data);
        } catch (e) {
            console.error("Failed to load requests", e);
        } finally {
            setLoadingRequests(false);
        }
    };

    const openDetailModal = (req: ChangeRequest) => {
        setSelectedRequest(req);
        setEditFormData({ ...req });
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const closeDetailModal = () => {
        setSelectedRequest(null);
        setIsEditing(false);
        setEditFormData({});
    };

    const handleInputChange = (field: keyof ChangeRequest, value: any) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!selectedRequest) return;
        try {
            await updateChangeRequest(selectedRequest.id, editFormData);
            await loadRequests();
            closeDetailModal();
        } catch (e) {
            console.error("Failed to save", e);
            alert("Failed to save changes.");
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = (r.account_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !filterStatus || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Successful': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'Unsuccessful': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            case 'In Progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    // Helper to render form fields
    const renderField = (label: string, field: keyof ChangeRequest, type: 'text' | 'date' | 'number' | 'textarea' = 'text') => {
        const value = editFormData[field] || '';
        if (!isEditing) {
            return (
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</label>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-charcoal-900/50 p-2 rounded border border-transparent">
                        {value || <span className="text-slate-400 italic">N/A</span>}
                    </div>
                </div>
            );
        }

        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">{label}</label>
                {type === 'textarea' ? (
                    <textarea
                        value={value}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        rows={3}
                    />
                ) : (
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-900 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-charcoal-50 flex items-center gap-2">
                    <ListChecks className="text-purple-600" />
                    Change Request Tracker
                </h2>
                <p className="text-slate-500 dark:text-gray-400 mt-1">Track and manage circuit change requests.</p>
            </div>

            {/* Tracker View */}
            <div className="bg-white dark:bg-charcoal-800 rounded-3xl p-6 border border-slate-200 dark:border-charcoal-700 shadow-sm animate-in fade-in flex-1">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" placeholder="Search by ID or Account..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-900 text-sm" />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-900 text-sm appearance-none cursor-pointer">
                            <option value="">All Statuses</option>
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                {loadingRequests ? <p className="text-center text-slate-400 py-10">Loading...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-slate-200 dark:border-charcoal-700 text-left text-slate-500 dark:text-gray-400"><th className="pb-3 font-semibold px-4">Request ID</th><th className="pb-3 font-semibold">Account</th><th className="pb-3 font-semibold">Type</th><th className="pb-3 font-semibold">Status</th><th className="pb-3 font-semibold">Created</th><th className="pb-3 font-semibold text-right px-4">Actions</th></tr></thead>
                            <tbody>
                                {filteredRequests.length === 0 ? <tr><td colSpan={6} className="text-center py-10 text-slate-400">No requests found.</td></tr> : filteredRequests.map(req => (
                                    <tr key={req.id} onClick={() => openDetailModal(req)} className="border-b border-slate-100 dark:border-charcoal-700/50 hover:bg-slate-50 dark:hover:bg-charcoal-700/30 transition-colors cursor-pointer group">
                                        <td className="py-4 px-4 font-mono text-xs text-slate-600">{req.id}</td>
                                        <td className="py-4 font-medium text-slate-700 dark:text-charcoal-100">{req.account_name || '-'}</td>
                                        <td className="py-4 text-slate-600">{req.change_type || '-'}</td>
                                        <td className="py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status || 'New Request')}`}>{req.status || 'New Request'}</span></td>
                                        <td className="py-4 text-slate-500 dark:text-gray-400">{req.created_at ? new Date(req.created_at).toLocaleDateString() : '-'}</td>
                                        <td className="py-4 px-4 text-right">
                                            <button className="text-slate-400 hover:text-purple-600 transition-colors">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail/Edit Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-24 animate-in fade-in" onClick={closeDetailModal}>
                    <div className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-charcoal-700 flex justify-between items-center bg-slate-50/50 dark:bg-charcoal-900/50 rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                    {isEditing ? 'Edit Request' : 'Request Details'}
                                    <span className="text-sm font-normal text-slate-500 font-mono bg-slate-200 dark:bg-charcoal-700 px-2 py-0.5 rounded">{selectedRequest.id}</span>
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isEditing ? (
                                    <button onClick={handleEditClick} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-sm font-medium transition-colors">
                                        <Edit2 size={16} /> Edit
                                    </button>
                                ) : (
                                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                        <Save size={16} /> Save
                                    </button>
                                )}
                                <button onClick={closeDetailModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Core Info */}
                                <div className="col-span-full border-b border-slate-100 dark:border-charcoal-700 pb-4 mb-2">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Core Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {renderField('Account Name', 'account_name')}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Status</label>
                                            {isEditing ? (
                                                <select value={editFormData.status} onChange={(e) => handleInputChange('status', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-900">
                                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            ) : (
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</span>
                                            )}
                                        </div>
                                        {renderField('Change Type', 'change_type')}
                                        {renderField('Salesforce Region', 'salesforce_region')}
                                        {renderField('Salesforce Record ID', 'salesforce_record_id')}
                                    </div>
                                    <div className="mt-2">
                                        {renderField('Status Notes', 'status_notes', 'textarea')}
                                    </div>
                                </div>

                                {/* Dynamic Fields based on Type */}
                                <div className="col-span-full">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Specific Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                                        {selectedRequest.change_type === 'Add New Sites' && (
                                            <>
                                                {renderField('Site ID', 'site_id')}
                                                {renderField('Bandwidth', 'bandwidth')}
                                                {renderField('New Circuit Type', 'new_circuit_type')}
                                                {renderField('Site Address', 'site_address', 'textarea')}
                                                {renderField('Contract Term (Months)', 'contract_term', 'number')}
                                            </>
                                        )}

                                        {selectedRequest.change_type === 'Upgradation/Downgradation' && (
                                            <>
                                                {renderField('Current Circuit ID', 'current_circuit_id')}
                                                {renderField('Existing Bandwidth', 'existing_bandwidth')}
                                                {renderField('New Bandwidth', 'new_bandwidth')}
                                            </>
                                        )}

                                        {selectedRequest.change_type === 'Shifting' && (
                                            <>
                                                {renderField('Circuit ID to Move', 'circuit_id_move')}
                                                {renderField('New Address', 'new_address', 'textarea')}
                                                {renderField('Old Circuit Address', 'old_circuit_address', 'textarea')}
                                            </>
                                        )}

                                        {selectedRequest.change_type === 'Decommission' && (
                                            <>
                                                {renderField('Decommission Circuit ID', 'decommission_circuit_id')}
                                                {renderField('Decommission Date', 'decommission_date', 'date')}
                                                {renderField('Notice Period', 'decommission_notice_period')}
                                                {renderField('Circuit Details', 'circuit_details', 'textarea')}
                                                {renderField('Reason', 'reason_for_decommission', 'textarea')}
                                            </>
                                        )}

                                        {/* Common Fields */}
                                        {renderField('New Int/Dom Split', 'new_intl_dom_split')}
                                        {renderField('Additional Notes', 'notes', 'textarea')}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
