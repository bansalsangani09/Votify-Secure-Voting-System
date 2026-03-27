import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const Step2Schedule = ({ data, setData }) => {
    const Toggle = ({ label, value, onChange, desc }) => (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer" onClick={() => onChange(!value)}>
            <div className="flex-1">
                <p className="font-bold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <div className={`
        w-12 h-6 rounded-full relative transition-all
        ${value ? 'bg-indigo-600' : 'bg-gray-200'}
      `}>
                <div className={`
          absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all
          ${value ? 'translate-x-6' : ''}
        `}></div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Start Date & Time */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Start Date & Time</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600" />
                            <input
                                type="date"
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                value={data.startDate}
                                onChange={(e) => setData({ ...data, startDate: e.target.value })}
                            />
                        </div>
                        <div className="sm:w-50 relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600" />
                            <input
                                type="time"
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                value={data.startTime}
                                onChange={(e) => setData({ ...data, startTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">End Date & Time</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600" />
                            <input
                                type="date"
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                value={data.endDate}
                                onChange={(e) => setData({ ...data, endDate: e.target.value })}
                            />
                        </div>
                        <div className="sm:w-50 relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600" />
                            <input
                                type="time"
                                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                                value={data.endTime}
                                onChange={(e) => setData({ ...data, endTime: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Toggle
                    label="Auto Activate"
                    value={data.autoActivate}
                    onChange={(val) => setData({ ...data, autoActivate: val })}
                    desc="Election will start automatically at the set time"
                />
                <Toggle
                    label="Auto Close"
                    value={data.autoClose}
                    onChange={(val) => setData({ ...data, autoClose: val })}
                    desc="Election will stop accepting votes at the set time"
                />
            </div>

            {/* Result Time */}
            <div className="p-6 bg-indigo-50/50 rounded-[28px] border-2 border-dashed border-indigo-100 flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <AlertCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-indigo-900">Result Declaration Time</h4>
                    <p className="text-sm text-indigo-600/70 mb-4 sm:mb-0">When should the official results be published?</p>
                </div>
                <div className="w-full sm:w-auto flex gap-3">
                    <input
                        type="datetime-local"
                        className="w-full sm:w-auto px-4 py-3 bg-white border border-indigo-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all text-indigo-700"
                        value={data.resultTime}
                        onChange={(e) => setData({ ...data, resultTime: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
};

export default Step2Schedule;
