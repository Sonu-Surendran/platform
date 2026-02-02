import React, { useEffect, useState } from 'react';
import {
    Server,
    Database,
    Cpu,
    ShieldCheck,
    Activity,
    RefreshCw,
    Moon,
    Sun,
    Monitor,
    Key,
    Save,
    Users,
    Trash2,
    Plus,
    UserPlus,
    Check
} from 'lucide-react';
import { fetchHealth, fetchUsers, createUser, deleteUser } from '@/services/api';

export const Settings: React.FC = () => {
    const [health, setHealth] = useState<any>(null);
    const [loadingHealth, setLoadingHealth] = useState(false);
    const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');

    // User Management State
    const [users, setUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        role: 'user',
        permissions: [] as any[]
    });

    const checkHealth = async () => {
        setLoadingHealth(true);
        try {
            const data = await fetchHealth();
            setHealth(data);
        } catch (error) {
            setHealth(null);
        } finally {
            setTimeout(() => setLoadingHealth(false), 800);
        }
    };

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await fetchUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleCreateUser = async () => {
        try {
            // Default View permissions for all tabs if role is user-basic
            const defaultPerms = [
                { resource: 'DASHBOARD', access_level: 'VIEW' },
                { resource: 'DEALS', access_level: 'VIEW' },
            ];

            await createUser({
                ...newUser,
                permissions: defaultPerms
            });
            await loadUsers();
            setIsAddUserOpen(false);
            setNewUser({ username: '', email: '', role: 'user', permissions: [] });
            alert("User added successfully!");
        } catch (error) {
            alert("Failed to create user.");
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (confirm("Are you sure you want to remove this user?")) {
            try {
                await deleteUser(id);
                await loadUsers();
            } catch (error) {
                alert("Failed to delete user.");
            }
        }
    };

    useEffect(() => {
        checkHealth();
        loadUsers();
    }, []);

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-charcoal-50">Settings & Configuration</h2>
                <p className="text-slate-500 dark:text-gray-400 mt-1">Manage application preferences, users, and system status.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: System Status & Users */}
                <div className="lg:col-span-2 space-y-6">

                    {/* User Management Card */}
                    <div className="bg-white dark:bg-charcoal-800 rounded-3xl p-6 border border-slate-200 dark:border-charcoal-700 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-charcoal-50 flex items-center gap-2">
                                <Users className="text-pastel-blue" /> User Management
                            </h3>
                            <button
                                onClick={() => setIsAddUserOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-pastel-blue text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                            >
                                <UserPlus size={16} /> Add Member
                            </button>
                        </div>

                        {/* Add User Form (Inline) */}
                        {isAddUserOpen && (
                            <div className="mb-6 p-4 bg-slate-50 dark:bg-charcoal-900 rounded-xl border border-slate-200 dark:border-charcoal-700 animate-in slide-in-from-top-2">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-charcoal-50 mb-3">New Team Member</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                    <input
                                        type="text" placeholder="Username"
                                        value={newUser.username}
                                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                        className="text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-800"
                                    />
                                    <input
                                        type="email" placeholder="Email Address"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-800"
                                    />
                                    <select
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        className="text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-charcoal-600 dark:bg-charcoal-800"
                                    >
                                        <option value="user">User (View Only)</option>
                                        <option value="editor">Editor (Can Scan)</option>
                                        <option value="admin">Admin (Full Access)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => setIsAddUserOpen(false)} className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                                    <button onClick={handleCreateUser} className="px-3 py-1 text-xs font-medium bg-emerald-500 text-white rounded-md hover:bg-emerald-600">Create User</button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-charcoal-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-charcoal-900 text-slate-500 dark:text-gray-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Access Level</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-charcoal-700">
                                    {users.length > 0 ? users.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-charcoal-900/50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800 dark:text-charcoal-50">{u.username}</div>
                                                <div className="text-xs text-slate-400">{u.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    u.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {u.role === 'admin' ? 'All Access' :
                                                    u.role === 'editor' ? 'View, Edit, Scan' : 'View Only'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* System Health Card */}
                    <div className="bg-white dark:bg-charcoal-800 rounded-3xl p-6 border border-slate-200 dark:border-charcoal-700 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-charcoal-50 flex items-center gap-2">
                                <Activity className="text-pastel-blue" /> System Status
                            </h3>
                            <button
                                onClick={checkHealth}
                                disabled={loadingHealth}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-charcoal-700 rounded-full transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={20} className={loadingHealth ? 'animate-spin text-slate-500' : 'text-slate-500'} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Backend API Status */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${health ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    <Server size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Backend API</p>
                                    <p className={`font-bold ${health ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {health ? 'Operational' : 'Unreachable'}
                                    </p>
                                </div>
                            </div>

                            {/* Database Status */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${health?.database === 'connected' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    <Database size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Database (Azure PG)</p>
                                    <p className={`font-bold ${health?.database === 'connected' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {health?.database === 'connected' ? 'Connected' : 'Disconnected'}
                                    </p>
                                </div>
                            </div>

                            {/* AI Engine Status */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                                    <Cpu size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">AI Engine (OpenAI)</p>
                                    <p className="font-bold text-slate-700 dark:text-charcoal-50">GPT-4o</p>
                                </div>
                            </div>

                            {/* Auth Status */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-gray-400">Security</p>
                                    <p className="font-bold text-slate-700 dark:text-charcoal-50">Role-Based</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Preferences */}
                    <div className="bg-white dark:bg-charcoal-800 rounded-3xl p-6 border border-slate-200 dark:border-charcoal-700 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-charcoal-50 mb-6 flex items-center gap-2">
                            <Monitor className="text-pastel-purple" /> Application Preferences
                        </h3>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-charcoal-700">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-charcoal-50">Appearance</p>
                                    <p className="text-sm text-slate-500">Customize how the application looks.</p>
                                </div>
                                <div className="flex bg-slate-100 dark:bg-charcoal-900 p-1 rounded-xl">
                                    <button
                                        onClick={() => setThemeMode('light')}
                                        className={`p-2 rounded-lg transition-all ${themeMode === 'light' ? 'bg-white dark:bg-charcoal-700 shadow-sm text-amber-500' : 'text-slate-400'}`}
                                    >
                                        <Sun size={20} />
                                    </button>
                                    <button
                                        onClick={() => setThemeMode('system')}
                                        className={`p-2 rounded-lg transition-all ${themeMode === 'system' ? 'bg-white dark:bg-charcoal-700 shadow-sm text-blue-500' : 'text-slate-400'}`}
                                    >
                                        <Monitor size={20} />
                                    </button>
                                    <button
                                        onClick={() => setThemeMode('dark')}
                                        className={`p-2 rounded-lg transition-all ${themeMode === 'dark' ? 'bg-white dark:bg-charcoal-700 shadow-sm text-purple-500' : 'text-slate-400'}`}
                                    >
                                        <Moon size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-charcoal-50">Default Currency</p>
                                    <p className="text-sm text-slate-500">Select base currency for financial data.</p>
                                </div>
                                <select className="bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pastel-blue">
                                    <option>USD ($)</option>
                                    <option>EUR (€)</option>
                                    <option>GBP (£)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Configuration & Info */}
                <div className="space-y-6">

                    {/* API Configuration */}
                    <div className="bg-white dark:bg-charcoal-800 rounded-3xl p-6 border border-slate-200 dark:border-charcoal-700 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-charcoal-50 mb-4 flex items-center gap-2">
                            <Key className="text-amber-500" /> API Configuration
                        </h3>

                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 mb-4">
                            <p className="text-xs text-amber-700 dark:text-amber-500">
                                Sensitive keys are managed securely via environment variables (.env) on the backend server.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">OpenAI API Key</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="password"
                                        value="************************"
                                        disabled
                                        className="w-full bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                                    />
                                    <span className="text-xs text-emerald-500 font-medium whitespace-nowrap">Configured</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Mapbox / Geo Key</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <input
                                        type="password"
                                        value=""
                                        disabled
                                        placeholder="Not Configured"
                                        className="w-full bg-slate-50 dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-700 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                                    />
                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Optional</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About App */}
                    <div className="bg-gradient-to-br from-pastel-blue to-purple-600 rounded-3xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">MIC Platform</h3>
                        <p className="text-white/80 text-sm mb-6">
                            Version 2.5.0 (Admin Update)
                            <br />
                            Build: 2025-12-26
                        </p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-sm font-medium transition-colors">
                                Documentation
                            </button>
                            <button className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors">
                                Contact Support
                            </button>
                        </div>
                    </div>

                    <div className="grid place-items-center pt-8">
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 dark:bg-charcoal-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm font-medium">
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
