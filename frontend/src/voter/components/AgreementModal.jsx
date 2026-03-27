import React, { useState } from 'react';
import { X } from 'lucide-react';

const AgreementModal = ({ isOpen, onClose, onContinue }) => {
    const [agreed, setAgreed] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">

                <div className="p-8">
                    <h2 className="text-2xl font-normal text-gray-900 mb-6 leading-tight">
                        Using Votify at a school/university with students?
                    </h2>

                    <div className="space-y-4 text-[14px] leading-relaxed text-gray-600">
                        <p>
                            If so, your school must sign up for an <a href="#" className="text-blue-600 hover:underline">Votify for Education</a> account before you can use the platform. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
                        </p>
                        <p>
                            Votify for Education lets schools/universities decide which Votify services their students can use, and provides additional <a href="#" className="text-blue-600 hover:underline">privacy and security</a> protection that is important in a school or university setting. Students cannot use Votify in a school or university with their personal accounts.
                        </p>
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-2xl flex gap-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setAgreed(!agreed)}>
                        <div className={`
              w-6 h-6 rounded-lg border-2 mt-0.5 shrink-0 flex items-center justify-center transition-all
              ${agreed ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}
            `}>
                            {agreed && <div className="w-1.5 h-3 border-r-2 border-b-2 border-white rotate-45 mb-1"></div>}
                        </div>
                        <p className="text-sm font-medium text-gray-700 leading-snug">
                            I've read and understand the above notice, and I'm not using Votify at a school/university with students
                        </p>
                    </div>
                </div>

                <div className="px-8 pb-8 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    >
                        Go back
                    </button>
                    <button
                        disabled={!agreed}
                        onClick={onContinue}
                        className={`
              px-8 py-2.5 rounded-full text-sm font-bold transition-all
              ${agreed
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
            `}
                    >
                        Continue
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AgreementModal;
