import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Users,
    Building2,
    ShieldCheck,
    ShoppingBag,
    Activity,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    ArrowUpRight,
    UserPlus,
    Settings,
    Database,
    Lock,
    Mail,
    Smartphone,
    Calendar,
    RefreshCw,
    BarChart3,
    FileText,
    FileSearch,
    ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AdminDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') || 'overview';

    const [activeTab, setActiveTab] = useState(tabParam);

    // Dynamic title mapping
    const tabTitles: Record<string, string> = {
        overview: 'Admin Overview',
        users: 'User Management',
        applications: 'Global Applications',
        security: 'System Security',
        logs: 'System Logs'
    };

    usePageTitle(tabTitles[activeTab] || 'Admin Control Center');

    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Sync tab with URL
    useEffect(() => {
        if (tabParam && tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        setSearchParams({ tab: newTab });
    };

    // Stats for Overview
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '0', icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { label: 'Active Startups', value: '0', icon: Building2, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { label: 'Pending Reviews', value: '0', icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100' },
        { label: 'System Health', value: '98%', icon: Activity, color: 'bg-purple-50 text-purple-600 border-purple-100' },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all applications
                const appRes = await fetch('/api/applications/all');
                const appData = await appRes.json();

                setApplications(appData);

                // Set stats based on real application data
                setStats([
                    { label: 'Total Users', value: (appData.length + 1).toString(), icon: Users, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { label: 'Verified Entities', value: appData.filter((a: any) => a.status === 'Approved').length.toString(), icon: Building2, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                    { label: 'Pending Reviews', value: appData.filter((a: any) => a.status === 'Pending').length.toString(), icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                    { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'bg-purple-50 text-purple-600 border-purple-100' },
                ]);

                // Reset users for now since we don't have a real users endpoint yet
                // But we'll keep the empty array so it doesn't show mock data
                setUsers([]);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewModule />;
            case 'users':
                return <UsersModule />;
            case 'applications':
                return <ApplicationsModule />;
            case 'security':
                return <SecurityModule />;
            case 'logs':
                return <LogsModule />;
            default:
                return <OverviewModule />;
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1400px] mx-auto">
                {/* Admin Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-[#002b5b] rounded-2xl flex items-center justify-center shadow-lg">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-[#002b5b]">
                                Admin <span className="text-blue-600">Control Center</span>
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 bg-white rounded-xl shadow-sm border-slate-200">
                            <RefreshCw className="w-4 h-4 text-emerald-600" />
                            Sync System
                        </Button>
                        <Button variant="outline" className="gap-2 bg-white rounded-xl shadow-sm border-slate-200">
                            <Database className="w-4 h-4 text-blue-600" />
                            Backup
                        </Button>
                        <Button className="gap-2 bg-[#002b5b] hover:bg-[#1a406d] rounded-xl shadow-lg shadow-blue-900/20">
                            <Settings className="w-4 h-4" />
                            Global Settings
                        </Button>
                    </div>
                </div>

                {/* Custom Tabs */}
                <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'users', label: 'User Management', icon: Users },
                        { id: 'applications', label: 'All Applications', icon: FileText },
                        { id: 'security', label: 'Security & Logs', icon: Lock },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap",
                                activeTab === tab.id
                                    ? "border-blue-600 text-blue-600 bg-blue-50/30"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Stats Row */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {stats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("p-6 rounded-3xl border shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all h-full bg-white", stat.color)}
                            >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-white/50 backdrop-blur-sm border border-white/80">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-3xl font-black mb-1">{stat.value}</h3>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-70">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );

    function OverviewModule() {
        return (
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Recent Activity Card */}
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-xl text-slate-800">System Activity Stream</h3>
                            <Button variant="ghost" size="sm" className="text-blue-600 font-bold">View History</Button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Activity className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="text-slate-500 font-medium">No recent system activity recorded.</p>
                                <p className="text-xs text-slate-400 mt-1">Live updates will appear here in real-time.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Audit Status */}
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
                        <h3 className="font-bold text-xl text-slate-800 mb-6">Security Audit</h3>
                        <div className="space-y-6">
                            <div className="p-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                <ShieldCheck className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                <p className="text-sm font-bold text-slate-800">System Monitoring Active</p>
                                <p className="text-xs text-slate-400 mt-1">All protocols are operating normally.</p>
                            </div>
                        </div>
                        <Button className="w-full mt-8 h-12 rounded-xl bg-slate-800 hover:bg-slate-900 gap-2 font-bold">
                            Run New Scan
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    function UsersModule() {
        return (
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email or role..."
                            className="pl-11 h-11 bg-white border-slate-200 focus:ring-blue-500 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 rounded-xl border-slate-200">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">
                            <UserPlus className="w-4 h-4" />
                            Add User
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User Info</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {users.length > 0 ? users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                                            user.role === 'admin' ? "bg-purple-100 text-purple-600" :
                                                user.role === 'officer' ? "bg-blue-100 text-blue-600" :
                                                    user.role === 'startup' ? "bg-emerald-100 text-emerald-600" :
                                                        "bg-slate-200 text-slate-600"
                                        )}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-slate-600">{user.phone}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            <span className="text-sm font-bold text-slate-700">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <Button variant="ghost" size="icon" className="rounded-lg text-slate-400 hover:text-slate-600">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Users className="w-8 h-8 text-slate-200" />
                                        </div>
                                        <h4 className="text-slate-800 font-bold">No Users Found</h4>
                                        <p className="text-slate-400 text-sm mt-1">Global user directory will be loaded here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    function ApplicationsModule() {
        return (
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h3 className="font-bold text-xl text-slate-800">Global Application Monitor</h3>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 rounded-xl border-slate-200 font-bold text-slate-600">
                            <FileSearch className="w-4 h-4" /> Export All
                        </Button>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {applications.map((app) => (
                        <div key={app._id} className="p-8 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                                        <Building2 className="w-7 h-7 text-slate-400 group-hover:text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 mb-1">{app.companyName}</h4>
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(app.submittedAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> {app.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" className="gap-2 text-blue-600 font-bold hover:bg-blue-50 rounded-xl h-12 px-6">
                                    View Dossier <ArrowUpRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    function SecurityModule() {
        return (
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[32px] border border-slate-200 p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Threat Monitoring</h3>
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: 'Brute Force Protection', status: 'Enabled', color: 'text-emerald-500' },
                            { label: 'SQL Injection Guard', status: 'Enabled', color: 'text-emerald-500' },
                            { label: 'API Rate Limiting', status: 'Enabled', color: 'text-emerald-500' },
                            { label: 'Unusual Login Attempts', status: '--', color: 'text-slate-400' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-1">
                                <span className="font-semibold text-slate-700">{item.label}</span>
                                <span className={cn("text-xs font-black uppercase tracking-widest", item.color)}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-[32px] border border-slate-200 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                <Lock className="w-5 h-5 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Admin Privileges</h3>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 mb-6">Current session has master access to database and user configuration.</p>
                        <Button className="w-full h-12 rounded-xl bg-blue-600 font-bold shadow-lg shadow-blue-200">Re-authenticate Master Key</Button>
                        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold text-rose-600 hover:bg-rose-50">Revoke Temporary Access</Button>
                    </div>
                </div>
            </div>
        );
    }

    function LogsModule() {
        return (
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800">Internal System Logs</h3>
                </div>
                <div className="p-8">
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Database className="w-16 h-16 text-slate-100 mb-6" />
                        <h4 className="text-xl font-bold text-slate-800">No Logs Available</h4>
                        <p className="text-slate-500 mt-2">All system events and debug logs will be aggregated here.</p>
                        <Button className="mt-8 bg-[#002b5b] hover:bg-[#1a406d] rounded-xl px-10 h-12 font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/20">
                            Configure Log Rotation
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}
