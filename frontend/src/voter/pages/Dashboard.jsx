import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Vote,
    Clock,
    Trash2,
    ArrowRight,
    Search,
    Filter,
    Activity,
    Users,
    ChevronRight,
    Sparkles,
    LayoutGrid,
    LayoutList,
    GripVertical,
    X,
} from "lucide-react";
import {
    DndContext,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CountUp from "react-countup";
import toast from "react-hot-toast";
import DEFAULT_IMAGE from "../../assets/election_cover_placeholder_1772523633362.png";

const STATUS_CONFIG = {
    Active: {
        class: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
        dot: "bg-white animate-pulse",
        label: "Live Now"
    },
    Closed: {
        class: "bg-slate-500 text-white shadow-lg shadow-slate-500/20",
        dot: "bg-slate-200",
        label: "Ended"
    },
    Scheduled: {
        class: "bg-blue-500 text-white shadow-lg shadow-blue-500/20",
        dot: "bg-blue-200",
        label: "Upcoming"
    }
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            },
        })
    );

    const [activeItem, setActiveItem] = useState(null);

    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchElections = async () => {
            try {
                const res = await api.get("/elections/my");

                if (res.data?.success) {
                    const { joined = [], created = [] } = res.data.data;
                    const createdIds = new Set(created.map((c) => c._id));

                    const all = [...created, ...joined].map((e) => {
                        const isOwner = createdIds.has(e._id);
                        const owner = e.admins?.find(a => a.role === 'owner')?.userId || e.owner;

                        return {
                            id: e._id,
                            title: e.title,
                            status: e.status === "active" ? "Active" : e.status === "closed" ? "Closed" : "Scheduled",
                            endTime: e.endDate ? new Date(e.endDate).toLocaleDateString() : "TBA",
                            rawEndTime: e.endDate,
                            progress: Math.floor(Math.random() * 40) + 60, // Mock turnout
                            type: isOwner ? "Owner" : "Participant",
                            image: e.image || DEFAULT_IMAGE,
                            ownerAvatar: owner?.photoUrl,
                            ownerName: owner?.name || 'Admin'
                        };
                    });

                    setElections(all);
                }
            } catch (err) {
                console.error("Failed to fetch elections:", err);
                toast.error("Failed to load elections");
            } finally {
                setLoading(false);
            }
        };

        fetchElections();
    }, []);

    const handleDeleteLeave = async (e, election) => {
        e.stopPropagation();
        const isOwner = election.type === 'Owner';
        const actionText = isOwner ? 'remove this election from your dashboard' : 'leave this election';

        if (!window.confirm(`Are you sure you want to ${actionText}?`)) return;

        try {
            // For both owners and participants, it's now a soft removal (hide)
            // Owners use DELETE /api/elections/:id (which we refactored to hide)
            // Participants use POST /api/elections/:id/leave (which we refactored to hide)
            const endpoint = isOwner ? `/elections/${election.id}` : `/elections/${election.id}/leave`;
            const method = isOwner ? 'delete' : 'post';

            const res = await api[method](endpoint);
            if (res.data.success) {
                toast.success(isOwner ? "Election removed from dashboard" : "Left election successfully");
                setElections(prev => prev.filter(item => item.id !== election.id));
            }
        } catch (err) {
            console.error("Action failed:", err);
            toast.error(err.response?.data?.message || "Action failed");
        }
    };

    const filteredElections = elections.filter(e => {
        const matchesTab = activeTab === 'All'
            || (activeTab === 'Owner' && e.type === 'Owner')
            || (activeTab === 'Participating' && e.type === 'Participant');

        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

        return matchesTab && matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-10">
            {/* HERO SECTION */}
            <div className="relative overflow-hidden rounded-3xl premium-gradient p-8 md:p-10 text-white shadow-2xl shadow-blue-500/20 group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000">
                    <Vote className="w-48 h-48" />
                </div>

                <div className="relative z-10 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 mb-4"
                    >
                        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-blue-300" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Election Dashboard</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-black mb-4 leading-tight"
                    >
                        Welcome back,
                        <span className="text-blue-200"> {user?.name || "Voter"}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-blue-100 text-base font-medium mb-8 leading-relaxed max-w-xl"
                    >
                        Your voice matters. Track your elections and participate in ongoing votes securely.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-3"
                    >
                        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                            <Activity className="w-4 h-4 text-blue-300" />
                            <div className="text-left">
                                <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest leading-none mb-1">Total Elections</p>
                                <p className="text-xs font-black"><CountUp end={elections.length} /> Elections</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                            <Users className="w-4 h-4 text-emerald-300" />
                            <div className="text-left">
                                <p className="text-[9px] font-black text-emerald-200 uppercase tracking-widest leading-none mb-1">Active Now</p>
                                <p className="text-xs font-black"><CountUp end={elections.filter(e => e.status === 'Active').length} /> Active</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        {['All', 'Participating', 'Owner'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-white dark:bg-card-dark text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Status Filter */}
                        <div className="flex bg-white/50 dark:bg-card-dark/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 shadow-sm">
                            {['All', 'Active', 'Scheduled', 'Closed'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${statusFilter === status
                                        ? STATUS_CONFIG[status]?.class || 'bg-blue-600 text-white shadow-lg'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {status !== 'All' && (
                                        <div className={`w-1.5 h-1.5 rounded-full ${statusFilter === status ? 'bg-white' : STATUS_CONFIG[status]?.dot.replace('bg-white', 'bg-slate-400')}`} />
                                    )}
                                    {status === 'All' ? 'Every Status' : STATUS_CONFIG[status]?.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-focus-within:bg-blue-500/10 transition-all duration-500"></div>
                            <div className="relative flex items-center">
                                <Search className={`absolute left-4 w-4 h-4 transition-all duration-300 ${searchQuery ? 'text-blue-500 scale-110' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Search by title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-white/80 dark:bg-card-dark/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-10 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 w-64 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm hover:shadow-md"
                                />
                                <AnimatePresence>
                                    {searchQuery && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="premium-card h-80 animate-pulse">
                                <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-t-[20px]" />
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                                    <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredElections.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={(event) => {
                            const item = elections.find(e => e.id === event.active.id);
                            setActiveItem(item);
                        }}
                        onDragEnd={(event) => {
                            const { active, over } = event;

                            setActiveItem(null);

                            if (!over || active.id === over.id) return;

                            setElections((items) => {
                                const oldIndex = items.findIndex(i => i.id === active.id);
                                const newIndex = items.findIndex(i => i.id === over.id);

                                return arrayMove(items, oldIndex, newIndex);
                            });
                        }}
                    >
                        <SortableContext
                            items={filteredElections.map(e => e.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredElections.map((election) => (
                                    <ElectionCard
                                        key={election.id}
                                        election={election}
                                        onDeleteLeave={handleDeleteLeave}
                                        navigate={navigate}
                                    />
                                ))}
                            </div>
                        </SortableContext>

                        {/* Drag Shadow */}
                        <DragOverlay>
                            {activeItem ? (
                                <div className="premium-card scale-105 shadow-2xl opacity-90">
                                    <img
                                        src={activeItem.image}
                                        className="h-40 w-full object-cover rounded-t-[20px]"
                                    />
                                    <div className="p-4 font-bold">{activeItem.title}</div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                ) : (
                    <div className="text-center py-32 premium-card border-dashed">
                        <Vote className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No elections found</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">
                            You're not currently participating or managing any elections in this category.
                        </p>
                        <button
                            className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                            onClick={() => navigate('/')}
                        >
                            BROWSE ELECTIONS
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component for individual election cards with drag controls
const ElectionCard = ({ election, onDeleteLeave, navigate }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: election.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            layout
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`premium-card group relative flex flex-col h-full cursor-grab active:cursor-grabbing transition ${isDragging ? "z-50 scale-105 shadow-2xl rotate-1" : ""
                }`}
        >
            {/* Card Header/Image */}
            <div className="relative h-48 overflow-hidden rounded-t-[20px] select-none">
                <img
                    src={election.image}
                    onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
                    alt={election.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_CONFIG[election.status].class}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[election.status].dot}`} />
                        {STATUS_CONFIG[election.status].label}
                    </div>
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    <button
                        onClick={(e) => onDeleteLeave(e, election)}
                        className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-rose-500 transition-all active:scale-90 border border-white/20"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Ending Time */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/90">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">Ends {election.endTime}</span>
                </div>

                {/* Owner Info Participant Only */}
                {election.type === 'Participant' && (
                    <div className="absolute bottom-4 w-16 h-16 right-4">
                        <div className="relative group/avatar">
                            <img
                                src={election.ownerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${election.ownerName}`}
                                className="w-16 h-16 rounded-2xl border-4 border-white/30 object-cover shadow-2xl"
                                alt={election.ownerName}
                            />
                            <div className="absolute bottom-full right-0 mb-2 invisible group-hover/avatar:visible opacity-0 group-hover/avatar:opacity-100 transition-all bg-black/90 text-[9px] font-bold text-white px-3 py-1.5 rounded-lg whitespace-nowrap">
                                Organized by {election.ownerName}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {election.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-6 text-slate-400 dark:text-slate-500">
                        <span className="text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-md">
                            {election.type}
                        </span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2 mb-8">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-500">Voter Turnout</span>
                            <span className="text-blue-600">{election.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${election.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full premium-gradient"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => navigate(`/election/${election.id}`)}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-900 dark:text-white hover:text-white rounded-2xl text-xs font-black transition-all group/btn"
                >
                    ENTER ELECTION
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
            </div>
        </motion.div>
    );
};

export default Dashboard;
