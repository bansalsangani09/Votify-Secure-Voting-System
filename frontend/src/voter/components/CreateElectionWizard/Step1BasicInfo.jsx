import React from 'react';
import { motion } from 'framer-motion';

const categories = [
    { name: "Government", icon: "🏛️" },
    { name: "Organization", icon: "🏢" },
    { name: "Private", icon: "🔒" },
    { name: "Other", icon: "✨" }
];

const Step1BasicInfo = ({ data, setData }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
    >
        <div className="grid grid-cols-1 gap-8">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Election Title</label>
                <input
                    type="text"
                    placeholder="e.g. College President 2026"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-lg font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition-all placeholder:text-gray-300"
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                />
                <p className="text-[11px] text-gray-400 font-medium ml-1">Example: "Annual Board Meeting 2025" or "Department Lead Election"</p>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Position / Role</label>
                <input
                    type="text"
                    placeholder="e.g. President"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-lg font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition-all placeholder:text-gray-300"
                    value={data.position || ''}
                    onChange={(e) => setData({ ...data, position: e.target.value })}
                />
                <p className="text-[11px] text-gray-400 font-medium ml-1">Example: President, Class Representative, Team Leader</p>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">Description</label>
                <textarea
                    placeholder="Describe the purpose and rules of this election..."
                    rows="5"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-base font-medium focus:bg-white focus:border-indigo-600 focus:outline-none transition-all placeholder:text-gray-300 resize-none"
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                ></textarea>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">
                    Category
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.name}
                            type="button"
                            onClick={() => setData({ ...data, category: cat.name })}
                            className={`
          group p-4 rounded-2xl border-2 transition-all duration-200 text-left
          ${data.category === cat.name
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg scale-[1.02]"
                                    : "bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md"
                                }
        `}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{cat.icon}</span>
                                <div>
                                    <p className={`font-bold ${data.category === cat.name ? "text-white" : "text-gray-800"
                                        }`}>
                                        {cat.name}
                                    </p>
                                    <p className={`text-xs ${data.category === cat.name ? "text-indigo-100" : "text-gray-500"
                                        }`}>
                                        Select this election type
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

export default Step1BasicInfo;
