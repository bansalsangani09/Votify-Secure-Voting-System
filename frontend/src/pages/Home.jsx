import React, { useEffect, useState } from "react";
import {
    motion,
    useScroll,
    useTransform,
} from "framer-motion";
import {
    ArrowRight,
    ShieldCheck,
    BarChart3,
    Users,
    Vote,
    CheckCircle2,
    Lock,
    Zap,
    Fingerprint,
    Globe,
    Database
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const { scrollY } = useScroll();
    const navigate = useNavigate();

    /* NAVBAR SHRINK */
    const navHeight = useTransform(scrollY, [0, 120], [80, 64]);

    /* CURSOR LIGHT */
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const move = (e) =>
            setMouse({ x: e.clientX, y: e.clientY });

        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    /* HERO PARALLAX */
    const heroY = useTransform(scrollY, [0, 500], [0, -80]);

    return (
        <div className="relative bg-white text-slate-900 overflow-hidden min-h-screen font-inter">

            {/* ===== Cursor Glow ===== */}
            <motion.div
                className="fixed w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10"
                animate={{ x: mouse.x - 192, y: mouse.y - 192 }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
            />

            {/* ===== Soft Gradient Atmosphere ===== */}
            <div className="absolute inset-0 -z-20">
                <div className="absolute w-[1000px] h-[1000px] bg-indigo-50/50 blur-[120px] rounded-full -top-96 -left-96" />
                <div className="absolute w-[800px] h-[800px] bg-blue-50/50 blur-[120px] rounded-full -bottom-96 -right-96" />
            </div>

            {/* ===== NAVBAR ===== */}
            <motion.header
                style={{ height: navHeight }}
                className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-slate-100"
            >
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo.svg" alt="Votify Logo" className="w-12 h-12 object-contain" />
                        <h1 className="text-xl font-black tracking-tight text-slate-900">
                            Votify
                        </h1>
                    </div>

                    <nav className="hidden lg:flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <a href="#features" className="hover:text-blue-600 transition-colors">Protocol</a>
                        <a href="#security" className="hover:text-blue-600 transition-colors">Cryptography</a>
                        <a href="#how-it-works" className="hover:text-blue-600 transition-colors">Consensus</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-900 hover:text-blue-600 transition-colors"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 hover:scale-105 transition-all shadow-xl active:scale-95"
                        >
                            Join Portal
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* ===== CINEMATIC HERO ===== */}
            <motion.section style={{ y: heroY }} className="pt-56 pb-40 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest mb-10 shadow-sm"
                    >
                        <Zap className="w-3 h-3" />
                        Next-Gen Governance Protocol
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-8xl font-black leading-[1.1] mb-8 tracking-tighter text-slate-950"
                    >
                        Elections,
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">
                            Redefined.
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
                    >
                        Votify is a state-of-the-art voting infrastructure built with mathematical certainty.
                        Transparent, immutable, and designed for the world's most critical organizations.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95"
                        >
                            Launch Workspace <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center"
                        >
                            View Protocol
                        </button>
                    </motion.div>
                </div>
            </motion.section>

            {/* ===== PRODUCT PREVIEW ===== */}
            <Reveal>
                <section className="pb-32 px-6">
                    <div className="max-w-6xl mx-auto premium-card p-10 md:p-16 relative overflow-hidden">
                        <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-lg">
                            System Live
                        </div>

                        <div className="grid md:grid-cols-4 gap-10">
                            <Stat title="Network Nodes" value="256" icon={<Globe className="w-5 h-5" />} />
                            <Stat title="Verified Voters" value="1.2M+" icon={<Users className="w-5 h-5" />} />
                            <Stat title="Total Records" value="50M+" icon={<Database className="w-5 h-5" />} blue />
                            <Stat title="Integrity Score" value="100%" icon={<ShieldCheck className="w-5 h-5" />} blue />
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* ===== FEATURES ===== */}
            <Reveal>
                <section id="features" className="py-32 px-6 bg-slate-50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black,transparent)] opacity-20" />

                    <div className="max-w-6xl mx-auto text-center mb-24 relative z-10">
                        <h3 className="text-4xl md:text-5xl font-black text-slate-950 mb-6 tracking-tight">
                            Protocol Standards
                        </h3>
                        <p className="text-slate-500 max-w-xl mx-auto font-medium">
                            Engineered for high-stakes governance with absolute mathematical certainty and maximum transparency.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto relative z-10">
                        <Card
                            icon={<ShieldCheck className="w-8 h-8" />}
                            title="Immutable Ledger"
                            description="Every vote generates a cryptographic signature anchored to the blockchain for eternal auditability."
                        />
                        <Card
                            icon={<Fingerprint className="w-8 h-8" />}
                            title="Zero-Knowledge"
                            description="Maintain absolute voter privacy while proving ballot inclusion with advanced ZK-Snark protocols."
                        />
                        <Card
                            icon={<Zap className="w-8 h-8" />}
                            title="Real-time Consensus"
                            description="Watch results broadcast live with sub-second finality across our global decentralized node network."
                        />
                    </div>
                </section>
            </Reveal>

            {/* ===== HOW IT WORKS ===== */}
            <Reveal>
                <section id="how-it-works" className="py-32 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-24">
                            <h3 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight">Technical Workflow</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            <Step
                                icon={<Vote className="w-10 h-10" />}
                                number="01"
                                title="Ballot Encryption"
                                description="Elections are created with secure public keys. Define candidates, rules, and launch with one signature."
                            />
                            <Step
                                icon={<Lock className="w-10 h-10" />}
                                number="02"
                                title="Identity Proof"
                                description="Voters authenticate via multi-layered protocols. Access is granted only once identity is cryptographically verified."
                            />
                            <Step
                                icon={<BarChart3 className="w-10 h-10" />}
                                number="03"
                                title="Consensus Audit"
                                description="Votes are audited by network nodes. Results are finalized and published with a full downloadable proof report."
                            />
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* ===== FINAL CTA ===== */}
            <Reveal>
                <section id="security" className="py-32 px-6">
                    <div className="max-w-6xl mx-auto bg-slate-950 text-white rounded-[3rem] p-12 md:p-24 text-center shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full -ml-48 -mb-48 blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="p-4 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/10 mb-10 group-hover:rotate-6 transition-transform">
                                <Vote className="w-12 h-12 text-blue-500" />
                            </div>
                            <h3 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
                                Secure the future <br /> of democracy.
                            </h3>
                            <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto font-medium">
                                Join the elite organizations already using Votify
                                to standardize their governance protocols.
                            </p>

                            <button
                                onClick={() => navigate("/register")}
                                className="bg-white text-slate-950 px-12 py-5 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl hover:scale-105 active:scale-95"
                            >
                                Get Started Now
                            </button>
                        </div>
                    </div>
                </section>
            </Reveal>

            <footer className="py-20 border-t border-slate-100 bg-slate-50 text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <img src="/logo.svg" alt="Votify Logo" className="w-8 h-8 object-contain" />
                        <h2 className="text-lg font-black tracking-tight text-slate-900">
                            Votify
                        </h2>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">
                        © 2026 Votify Protocol — All Systems Nominal.
                    </p>
                    <div className="flex justify-center flex-wrap gap-10 text-[10px] uppercase font-black tracking-widest text-slate-400">
                        <a href="#" className="hover:text-blue-600 transition-colors">Nodes</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Ledger</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ===== Helpers ===== */

function Reveal({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}

function Card({ icon, title, description }) {
    return (
        <motion.div
            whileHover={{ y: -12 }}
            className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-3xl transition-all duration-500 group"
        >
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-8 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-blue-500/30 transition-all duration-500">
                {icon}
            </div>
            <h4 className="font-black text-xl mb-4 text-slate-950 tracking-tight">{title}</h4>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">{description}</p>
        </motion.div>
    );
}

function Step({ icon, title, description, number }) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="group relative"
        >
            <div className="absolute -top-10 left-0 text-[120px] font-black text-slate-50 select-none -z-10 group-hover:text-blue-50/50 transition-colors duration-500">
                {number}
            </div>
            <div className="flex text-blue-600 mb-8 pt-8">
                <div className="p-4 bg-white rounded-2xl shadow-xl shadow-slate-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-slate-50">
                    {icon}
                </div>
            </div>
            <h4 className="font-black text-xl mb-4 text-slate-950 tracking-tight">{title}</h4>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">{description}</p>
        </motion.div>
    );
}

function Stat({ title, value, blue, icon }) {
    return (
        <div className="text-center group">
            <div className={`p-4 rounded-2xl inline-flex items-center justify-center mb-6 transition-all duration-500 ${blue ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'} group-hover:scale-110`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{title}</p>
            <h3 className={`text-4xl font-black tracking-tighter ${blue ? "text-blue-600" : "text-slate-950"}`}>
                {value}
            </h3>
        </div>
    );
}
