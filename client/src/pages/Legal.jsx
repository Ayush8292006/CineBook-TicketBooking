import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, Gavel, Scale } from 'lucide-react';

const Legal = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0); // Default to top if no hash
    }
  }, [hash]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 pt-44 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* 🛡️ Section 1: Privacy Policy */}
      <section id="privacy" className="mb-32 scroll-mt-32">
        <div className="flex flex-col mb-10">
          <div className="flex items-center gap-4 mb-2">
            <ShieldCheck className="text-primary w-10 h-10" />
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Privacy Policy</h1>
          </div>
          <div className="h-1 w-20 bg-primary rounded-full shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-4">Security & Data Integrity</p>
        </div>

        <div className="space-y-8 text-gray-400 leading-relaxed text-base">
          <p className="text-lg text-gray-300">
            At CineBook, your privacy is our script's main lead. We ensure your data is handled with the same care as a 70mm film reel.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-colors group">
              <Lock className="text-primary mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-white font-bold text-lg mb-3 tracking-tight">Clerk Protection</h3>
              <p className="text-sm leading-6">We use Clerk for enterprise-grade authentication. Your passwords never touch our servers; we only store your basic profile to manage bookings.</p>
            </div>

            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-colors group">
              <Scale className="text-primary mb-4 group-hover:scale-110 transition-transform" size={24} />
              <h3 className="text-white font-bold text-lg mb-3 tracking-tight">TMDB Usage</h3>
              <p className="text-sm leading-6">Movie data is synced from TMDB. We do not track your browsing history or share your interests with external marketing agencies.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-transparent p-8 rounded-[2rem] border border-primary/10">
            <p className="text-sm italic">
              "We use session cookies solely to enhance your booking speed and keep you logged in. No persistent tracking, no hidden scripts."
            </p>
          </div>
        </div>
      </section>

      {/* 📏 Minimalist Divider */}
      <div className="flex justify-center mb-32">
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
        </div>
      </div>

      {/* 📜 Section 2: Terms of Use */}
      <section id="terms" className="scroll-mt-32">
        <div className="flex flex-col mb-10">
          <div className="flex items-center gap-4 mb-2">
            <Gavel className="text-primary w-10 h-10" />
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Terms of Use</h1>
          </div>
          <div className="h-1 w-20 bg-primary rounded-full shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] mt-4">The User Agreement</p>
        </div>

        <div className="space-y-6 text-gray-400 font-medium">
          <div className="prose prose-invert max-w-none">
            <ul className="grid grid-cols-1 gap-4 list-none p-0">
              {[
                { title: "Booking Validity", desc: "Tickets are valid only for the selected showtime and theater." },
                { title: "Fair Usage", desc: "Automated booking scripts or bots are strictly prohibited." },
                { title: "Account Safety", desc: "Users are responsible for all bookings made via their Clerk account." }
              ].map((item, index) => (
                <li key={index} className="flex gap-6 p-6 rounded-2xl bg-white/[0.01] border border-white/5 items-start">
                  <span className="text-primary font-black text-xl italic">0{index + 1}</span>
                  <div>
                    <h4 className="text-white font-bold">{item.title}</h4>
                    <p className="text-sm mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm mt-8 border-t border-white/5 pt-8 italic">
            CineBook reserves the right to update these terms to reflect changes in our service or legal requirements.
          </p>
        </div>
      </section>

      {/* 📧 Help Footer */}
      <div className="mt-32 p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black mb-2">Effective: March 20, 2026</p>
        <p className="text-gray-300 text-sm">Need legal clarification? <span className="text-primary font-bold cursor-pointer hover:underline underline-offset-4">legal@cinebook.com</span></p>
      </div>
    </div>
  );
};

export default Legal;