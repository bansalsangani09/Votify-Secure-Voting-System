import React from 'react';
import { PlusCircle, UserPlus, X } from 'lucide-react';

const CreateChoiceModal = ({ isOpen, onClose, onJoinClick, onCreateClick }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-50 rounded-lg text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-2">
                    <button
                        onClick={onJoinClick}
                        className="w-full flex items-center gap-4 p-4 hover:bg-indigo-50 rounded-xl transition-all group group-active:scale-95"
                    >
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">Join Election</p>
                            <p className="text-xs text-gray-500">Enter a code to participate</p>
                        </div>
                    </button>

                    <button
                        onClick={onCreateClick}
                        className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 rounded-xl transition-all group group-active:scale-95 mt-1"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <PlusCircle className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Create Election</p>
                            <p className="text-xs text-gray-500">Start your own voting process</p>
                        </div>
                    </button>
                </div>

                <div className="p-3 bg-gray-50 text-center">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Powered by Votify</p>
                </div>
            </div>
        </div>
    );
};

export default CreateChoiceModal;
