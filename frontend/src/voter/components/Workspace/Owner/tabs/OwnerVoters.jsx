// import React, { useState } from 'react';
// import { Mail, Search, Filter, CheckCircle2, XCircle, MoreVertical, Send, UserPlus, Clock, Trash2, Settings2, Plus } from 'lucide-react';
// import api from '../../../../../utils/api';
// import VotingSettingsModal from '../modals/VotingSettingsModal';
// import InviteVoterModal from '../modals/InviteVoterModal';


// const OwnerVoters = ({ data, onUpdateElection }) => {
//     const [searchQuery, setSearchQuery] = useState('');
//     const [filter, setFilter] = useState('all'); // all, voted, pending
//     const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//     const [isInviteOpen, setIsInviteOpen] = useState(false);


//     const voters = data?.participants?.filter(p => {
//         // If anonymous, we only want to match by "Secure" if they haven't voted, or just show all
//         const matchesSearch = data.anonymous
//             ? true // Search disabled or limited in anonymous mode
//             : (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 p.email?.toLowerCase().includes(searchQuery.toLowerCase()));

//         if (filter === 'voted') return matchesSearch && p.voted;
//         if (filter === 'pending') return matchesSearch && !p.voted;
//         return matchesSearch;
//     }).map((p, idx) => ({
//         id: p._id || idx,
//         name: data.anonymous ? 'Identity Secured' : (p.name || 'Anonymous Voter'),
//         email: data.anonymous ? 'voter details is secure' : (p.email || 'No email provided'),
//         voted: p.voted || false,
//         lastActive: p.lastActive || 'Joined'
//     })) || [];


//     const handleRemove = async (userId) => {
//         if (!window.confirm('Are you sure you want to remove this voter from the election?')) return;

//         try {
//             const res = await api.delete(`/elections/${data._id}/participants/${userId}`);
//             if (res.data.success) {
//                 alert('Voter removed successfully');
//                 if (onUpdateElection) onUpdateElection(res.data.data);
//             }
//         } catch (err) {
//             console.error('Remove voter error:', err);
//             alert(err.response?.data?.message || 'Failed to remove voter');
//         }
//     };

//     return (
//         <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
//             {/* Search & Filters */}
//             <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                 <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1 max-w-2xl">
//                     <div className="relative group flex-1">
//                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
//                         <input
//                             type="text"
//                             placeholder="Search by name or email..."
//                             className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
//                             value={searchQuery}
//                             onChange={(e) => setSearchQuery(e.target.value)}
//                         />
//                     </div>
//                     <div className="flex items-center gap-2 bg-white border border-gray-100 p-1 rounded-2xl shadow-sm self-start">
//                         <button
//                             onClick={() => setFilter('all')}
//                             className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
//                         >All</button>
//                         <button
//                             onClick={() => setFilter('voted')}
//                             className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${filter === 'voted' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
//                         >Voted</button>
//                         <button
//                             onClick={() => setFilter('pending')}
//                             className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
//                         >Pending</button>
//                         <div className="h-4 w-[1px] bg-gray-100 mx-1"></div>
//                         <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
//                             <Filter className="w-4 h-4" />
//                         </button>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <button
//                         onClick={() => setIsInviteOpen(true)}
//                         className="flex items-center justify-center gap-2 bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-50 transition-all active:scale-95"
//                     >
//                         <UserPlus className="w-4 h-4" />
//                         Invite Voters
//                     </button>
//                     <button
//                         onClick={() => setIsSettingsOpen(true)}
//                         className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
//                     >
//                         <Settings2 className="w-4 h-4" />
//                         Edit Voting
//                     </button>
//                 </div>

//             </div>

//             {/* Voters Table */}
//             <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left">
//                         <thead>
//                             <tr className="bg-gray-50/50 border-b border-gray-100">
//                                 <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                                     <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
//                                 </th>
//                                 <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Voter Name</th>
//                                 <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</th>
//                                 <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
//                                 <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Last Active</th>
//                                 <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-50">
//                             {voters.map((voter) => (
//                                 <tr key={voter.id} className="hover:bg-gray-50/50 transition-colors group">
//                                     <td className="px-8 py-4">
//                                         <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
//                                     </td>
//                                     <td className="px-8 py-5">
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-200 uppercase">
//                                                 {data.anonymous ? '?' : voter.name.split(' ').map(n => n[0]).join('')}
//                                             </div>
//                                             <p className={`text-sm font-bold ${data.anonymous ? 'text-indigo-600/50' : 'text-gray-800'}`}>
//                                                 {voter.name}
//                                             </p>
//                                         </div>
//                                     </td>

//                                     <td className="px-8 py-5">
//                                         <p className="text-sm text-gray-500 font-medium">{voter.email}</p>
//                                     </td>
//                                     <td className="px-8 py-5 text-center">
//                                         <div className={`
//                       inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
//                       ${voter.voted ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}
//                     `}>
//                                             {voter.voted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
//                                             {voter.voted ? 'Voted' : 'Pending'}
//                                         </div>
//                                     </td>
//                                     <td className="px-8 py-5 text-center">
//                                         <p className={`text-xs font-bold ${voter.lastActive === 'Online' ? 'text-green-500' : 'text-gray-400'}`}>
//                                             {voter.lastActive}
//                                         </p>
//                                     </td>
//                                     <td className="px-8 py-5 text-right">
//                                         <div className="flex items-center justify-end gap-2">
//                                             {!voter.voted && !data.anonymous && (
//                                                 <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Send reminder">
//                                                     <Send className="w-4 h-4" />
//                                                 </button>
//                                             )}
//                                             <button
//                                                 onClick={() => handleRemove(voter.id)}
//                                                 className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
//                                                 title="Remove voter"
//                                             >
//                                                 <Trash2 className="w-4 h-4" />
//                                             </button>
//                                             {!data.anonymous && (
//                                                 <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
//                                                     <MoreVertical className="w-4 h-4" />
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </td>

//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Selected Actions Bar (Placeholder) */}
//                 <div className="px-8 py-3 bg-indigo-600 text-white flex items-center justify-between animate-in slide-in-from-bottom-full duration-500">
//                     <div className="flex items-center gap-4">
//                         <p className="text-xs font-bold uppercase tracking-widest opacity-80">2 Voters Selected</p>
//                         <div className="h-4 w-[1px] bg-white/20"></div>
//                         <button className="text-xs font-bold hover:underline">Resend Invite</button>
//                         <button className="text-xs font-bold hover:underline">Remove</button>
//                     </div>
//                     <XCircle className="w-4 h-4 cursor-pointer opacity-60 hover:opacity-100" />
//                 </div>
//             </div>
//             <VotingSettingsModal
//                 isOpen={isSettingsOpen}
//                 onClose={() => setIsSettingsOpen(false)}
//                 election={data}
//                 onUpdate={onUpdateElection}
//             />
//             <InviteVoterModal
//                 isOpen={isInviteOpen}
//                 onClose={() => setIsInviteOpen(false)}
//                 electionId={data._id}
//                 onUpdate={onUpdateElection}
//             />
//         </div>

//     );
// };

// export default OwnerVoters;
