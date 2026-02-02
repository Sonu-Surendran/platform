import React, { useState, useEffect } from 'react';
import { ActiveOnboardCircuit } from '@/types';
import { fetchActiveOnboardCircuits, updateActiveOnboardCircuit } from '@/services/api';
import {
    LayoutGrid,
    List,
    MapPin,
    Users,
    Search,
    Filter,
    ChevronRight,
    ArrowLeft,
    Globe,
    Building2,
    Wifi,
    MoreHorizontal,
    Edit2,
    Save,
    X
} from 'lucide-react';

type GroupBy = 'client' | 'country';
type ViewState = 'groups' | 'list' | 'detail';

export const ActiveOnboardCircuits: React.FC = () => {
    const [circuits, setCircuits] = useState<ActiveOnboardCircuit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [groupBy, setGroupBy] = useState<GroupBy>('client');
    const [viewState, setViewState] = useState<ViewState>('groups');
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [selectedCircuit, setSelectedCircuit] = useState<ActiveOnboardCircuit | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<ActiveOnboardCircuit>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchActiveOnboardCircuits();
            setCircuits(data);
        } catch (err) {
            setError('Failed to load active circuits');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getGroupedData = () => {
        const groups: Record<string, ActiveOnboardCircuit[]> = {};

        circuits.forEach(circuit => {
            const key = groupBy === 'client' ? (circuit.client_name || 'Unknown Client') : (circuit.country || 'Unknown Country');
            if (!groups[key]) groups[key] = [];
            groups[key].push(circuit);
        });

        if (viewState === 'groups' && searchTerm) {
            const filteredGroups: Record<string, ActiveOnboardCircuit[]> = {};
            Object.keys(groups).forEach(key => {
                if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
                    filteredGroups[key] = groups[key];
                }
            });
            return filteredGroups;
        }

        return groups;
    };

    const handleGroupClick = (groupName: string) => {
        setSelectedGroup(groupName);
        setViewState('list');
    };

    const handleCircuitClick = (circuit: ActiveOnboardCircuit) => {
        setSelectedCircuit(circuit);
        setEditFormData({ ...circuit });
        setIsEditing(false);
        setViewState('detail');
    };

    const handleBack = () => {
        if (viewState === 'detail') {
            setViewState('list');
            setSelectedCircuit(null);
            setIsEditing(false);
        } else if (viewState === 'list') {
            setViewState('groups');
            setSelectedGroup(null);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        if (selectedCircuit) {
            setEditFormData({ ...selectedCircuit });
        }
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        if (!selectedCircuit || !selectedCircuit.id) return;
        try {
            await updateActiveOnboardCircuit(selectedCircuit.id, editFormData);
            // Update local state
            setCircuits(prev => prev.map(c => c.id === selectedCircuit.id ? { ...c, ...editFormData } as ActiveOnboardCircuit : c));
            setSelectedCircuit({ ...selectedCircuit, ...editFormData } as ActiveOnboardCircuit);
            setIsEditing(false);
        } catch (e) {
            console.error("Failed to update circuit", e);
            alert("Failed to save changes");
        }
    };

    const handleFieldChange = (field: keyof ActiveOnboardCircuit, value: any) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const groupedCircuits = getGroupedData();

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 dark:border-white"></div>
            </div>
        );
    }

    // --- DETAIL VIEW ---
    if (viewState === 'detail' && selectedCircuit) {
        return (
            <div className="h-full flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to List</span>
                    </button>

                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancelEdit} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-charcoal-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-charcoal-700 transition-colors">
                                    <X size={16} /> Cancel
                                </button>
                                <button onClick={handleSaveEdit} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
                                    <Save size={16} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <button onClick={handleEditClick} className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium transition-colors">
                                <Edit2 size={16} /> Edit Circuit
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm border border-slate-200 dark:border-charcoal-700 overflow-hidden flex-1 flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-charcoal-700 bg-slate-50/50 dark:bg-charcoal-800/50">
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-4 mb-2">
                                        <input
                                            value={editFormData.ntt_circuit_id || ''}
                                            onChange={e => handleFieldChange('ntt_circuit_id', e.target.value)}
                                            className="text-2xl font-bold bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-charcoal-600 rounded px-2 py-1 w-full"
                                            placeholder="NTT Circuit ID"
                                        />
                                        <select
                                            value={editFormData.order_type || ''}
                                            onChange={e => handleFieldChange('order_type', e.target.value)}
                                            className="ml-auto px-4 py-1.5 bg-white dark:bg-charcoal-900 border border-slate-300 dark:border-charcoal-600 rounded-full text-sm font-medium"
                                        >
                                            <option value="New">New</option>
                                            <option value="Move">Move</option>
                                            <option value="Change">Change</option>
                                            <option value="Active">Active</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-start">
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedCircuit.ntt_circuit_id || 'No ID'}</h1>
                                        <div className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                                            {selectedCircuit.order_type || 'Active'}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    <span className="flex items-center gap-1.5"><Building2 size={14} /> {selectedCircuit.client_name}</span>
                                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {selectedCircuit.city}, {selectedCircuit.country}</span>
                                    <span className="flex items-center gap-1.5"><Wifi size={14} /> {selectedCircuit.internet_type}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">

                            <Section title="Circuit Information">
                                <Field label="Client Name" field="client_name" value={editFormData.client_name} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="CR Number" field="cr_number" value={editFormData.cr_number} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Contracted Vendor" field="contracted_vendor" value={editFormData.contracted_vendor} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="ISP" field="isp" value={editFormData.isp} isEditing={isEditing} onChange={handleFieldChange} />
                            </Section>

                            <Section title="Financials">
                                <Field label="MRC" field="mrc" value={editFormData.mrc} isEditing={isEditing} onChange={handleFieldChange} type="number" isCurrency currency={editFormData.currency} />
                                <Field label="OTC" field="otc" value={editFormData.otc} isEditing={isEditing} onChange={handleFieldChange} type="number" isCurrency currency={editFormData.currency} />
                                <Field label="Currency" field="currency" value={editFormData.currency} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="LMP" field="lmp" value={editFormData.lmp} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Contract Term (Mo)" field="contract_term" value={editFormData.contract_term} isEditing={isEditing} onChange={handleFieldChange} type="number" />
                            </Section>

                            <Section title="Location">
                                <Field label="Site Name" field="site_name" value={editFormData.site_name} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Site Code" field="site_code" value={editFormData.site_code} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Address" field="address" value={editFormData.address} isEditing={isEditing} onChange={handleFieldChange} type="textarea" />
                                <Field label="City" field="city" value={editFormData.city} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Country" field="country" value={editFormData.country} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Postal/Zip" field="postal_zip" value={editFormData.postal_zip} isEditing={isEditing} onChange={handleFieldChange} />
                            </Section>

                            <Section title="Technical Details">
                                <Field label="Internet Type" field="internet_type" value={editFormData.internet_type} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Access Medium" field="access_medium" value={editFormData.access_medium} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Bandwidth (Bearer)" field="physical_access_bearer_bandwidth" value={editFormData.physical_access_bearer_bandwidth} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Downlink Speed" field="downlink_speed" value={editFormData.downlink_speed} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Uplink Speed" field="uplink_speed" value={editFormData.uplink_speed} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="IP Routing" field="ip_routing" value={editFormData.ip_routing} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="IP Assignment" field="ip_address_assignment" value={editFormData.ip_address_assignment} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Handoff" field="hand_off" value={editFormData.hand_off} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Demarcation" field="demarcation_details" value={editFormData.demarcation_details} isEditing={isEditing} onChange={handleFieldChange} type="textarea" />
                            </Section>

                            <Section title="SLA & Dates">
                                <Field label="TTR SLA" field="ttr_sla" value={editFormData.ttr_sla} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Availability SLA" field="availability_sla" value={editFormData.availability_sla} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="NTT Order Acceptance" field="ntt_order_acceptance_date" value={editFormData.ntt_order_acceptance_date} isEditing={isEditing} onChange={handleFieldChange} type="date" />
                                <Field label="Carrier Order Acceptance" field="carrier_order_acceptance_date" value={editFormData.carrier_order_acceptance_date} isEditing={isEditing} onChange={handleFieldChange} type="date" />
                            </Section>

                            <Section title="Contacts">
                                <Field label="Primary LCON Name" field="primary_lcon_name" value={editFormData.primary_lcon_name} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Primary LCON Email" field="primary_lcon_email" value={editFormData.primary_lcon_email} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Primary LCON Phone" field="primary_lcon_phone" value={editFormData.primary_lcon_phone} isEditing={isEditing} onChange={handleFieldChange} />
                                <div className="h-4"></div>
                                <Field label="Secondary LCON Name" field="secondary_lcon_name" value={editFormData.secondary_lcon_name} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Secondary LCON Email" field="secondary_lcon_email" value={editFormData.secondary_lcon_email} isEditing={isEditing} onChange={handleFieldChange} />
                                <Field label="Secondary LCON Phone" field="secondary_lcon_phone" value={editFormData.secondary_lcon_phone} isEditing={isEditing} onChange={handleFieldChange} />
                            </Section>

                            <Section title="Notes" colSpan={3}>
                                {isEditing ? (
                                    <textarea
                                        value={editFormData.notes || ''}
                                        onChange={e => handleFieldChange('notes', e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={4}
                                        placeholder="Add notes..."
                                    />
                                ) : (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                        {selectedCircuit.notes || 'No notes available.'}
                                    </p>
                                )}
                            </Section>

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST VIEW ---
    if (viewState === 'list' && selectedGroup) {
        const listData = groupedCircuits[selectedGroup] || [];

        return (
            <div className="h-full flex flex-col p-6 animate-in slide-in-from-right-4 duration-300">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors w-fit"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Groups</span>
                </button>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            {groupBy === 'client' ? <Building2 className="text-blue-500" /> : <Globe className="text-green-500" />}
                            {selectedGroup}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Found {listData.length} active circuits</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-charcoal-800 rounded-xl shadow-sm border border-slate-200 dark:border-charcoal-700 overflow-hidden flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-charcoal-900/50 border-b border-slate-200 dark:border-charcoal-700">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">NTT Circuit ID</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">MRC</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">LMP</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Country</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Term (Mo)</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Internet Type</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Primary LCON</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Phone</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-charcoal-700">
                                {listData.map((circuit) => (
                                    <tr
                                        key={circuit.id}
                                        onClick={() => handleCircuitClick(circuit)}
                                        className="group hover:bg-slate-50 dark:hover:bg-charcoal-700/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                                            {circuit.ntt_circuit_id}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            {circuit.currency} {circuit.mrc?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-[150px] truncate" title={circuit.lmp}>
                                            {circuit.lmp}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{circuit.country}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{circuit.contract_term}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                {circuit.internet_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{circuit.primary_lcon_name}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{circuit.primary_lcon_phone}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={circuit.primary_lcon_email}>
                                            {circuit.primary_lcon_email}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- GROUPS VIEW (DEFAULT) ---
    return (
        <div className="h-full flex flex-col p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Active Onboard Circuits</h1>
                    <p className="text-slate-500 dark:text-gray-400 mt-2">Manage and track all active circuit deployments.</p>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-charcoal-800 p-1.5 rounded-lg border border-slate-200 dark:border-charcoal-700 shadow-sm">
                    <button
                        onClick={() => setGroupBy('client')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${groupBy === 'client'
                            ? 'bg-slate-100 dark:bg-charcoal-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                    >
                        By Client
                    </button>
                    <button
                        onClick={() => setGroupBy('country')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${groupBy === 'country'
                            ? 'bg-slate-100 dark:bg-charcoal-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                    >
                        By Country
                    </button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder={`Search ${groupBy}s...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(groupedCircuits).map(([name, groupCircuits]) => (
                    <div
                        key={name}
                        onClick={() => handleGroupClick(name)}
                        className="group bg-white dark:bg-charcoal-800 rounded-2xl p-6 border border-slate-200 dark:border-charcoal-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            {groupBy === 'client' ? <Building2 size={80} /> : <Globe size={80} />}
                        </div>

                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${groupBy === 'client'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                }`}>
                                {groupBy === 'client' ? <Building2 size={24} /> : <Globe size={24} />}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 truncate" title={name}>
                                {name}
                            </h3>

                            <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 text-sm font-medium">
                                <span className="bg-slate-100 dark:bg-charcoal-700 px-2.5 py-1 rounded-full text-slate-700 dark:text-slate-300">
                                    {groupCircuits.length} Circuits
                                </span>
                            </div>
                        </div>

                        <div className="absolute bottom-4 right-4 text-slate-300 dark:text-charcoal-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                            <ChevronRight size={24} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const Section: React.FC<{ title: string; children: React.ReactNode; colSpan?: number }> = ({ title, children, colSpan = 1 }) => (
    <div className={`col-span-1 ${colSpan > 1 ? `lg:col-span-${colSpan}` : ''}`}>
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-charcoal-700 pb-2">
            {title}
        </h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

interface FieldProps {
    label: string;
    field: keyof ActiveOnboardCircuit;
    value: any;
    isCurrency?: boolean;
    currency?: string;
    isEditing?: boolean;
    onChange?: (field: keyof ActiveOnboardCircuit, value: any) => void;
    type?: 'text' | 'number' | 'date' | 'textarea';
}

const Field: React.FC<FieldProps> = ({
    label, field, value, isCurrency, currency,
    isEditing = false, onChange, type = 'text'
}) => {

    // RENDER READ-ONLY
    if (!isEditing) {
        let displayValue = value;
        if (value === null || value === undefined || value === '') {
            displayValue = <span className="text-slate-300 dark:text-charcoal-600 text-sm italic">N/A</span>;
        } else if (isCurrency) {
            // Safe number checking
            const num = Number(value);
            if (!isNaN(num)) {
                displayValue = `${currency || ''} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        } else if (type === 'date' && value) {
            try { displayValue = new Date(value).toLocaleDateString(); } catch (e) { displayValue = value; }
        }

        return (
            <div>
                <dt className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</dt>
                <dd className="text-sm font-medium text-slate-900 dark:text-slate-200 break-words">{displayValue}</dd>
            </div>
        );
    }

    // RENDER EDITING
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (onChange) {
            onChange(field, e.target.value);
        }
    };

    if (type === 'textarea') {
        return (
            <div>
                <dt className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</dt>
                <textarea
                    value={value || ''}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-900 focus:ring-1 focus:ring-blue-500 outline-none"
                />
            </div>
        );
    }

    return (
        <div>
            <dt className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</dt>
            <input
                type={type}
                value={value || ''}
                onChange={handleChange}
                className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-900 focus:ring-1 focus:ring-blue-500 outline-none"
            />
        </div>
    );
};
