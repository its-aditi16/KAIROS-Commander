import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-kairos-bg text-white relative py-24 px-6 flex items-center justify-center">
       {/* Background Elements */}
       <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 glass-panel p-8 md:p-12 rounded-3xl border border-white/10">
            
            {/* Contact Info */}
            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Let's <span className="text-kairos-blue">Talk</span>
                    </h1>
                    <p className="text-lg text-kairos-muted">
                        Have questions about the platform? Need a custom enterprise plan? We're here to help.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/5 rounded-lg text-kairos-blue">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Email Us</h3>
                            <p className="text-kairos-muted">hello@kairos.ai</p>
                            <p className="text-kairos-muted">support@kairos.ai</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/5 rounded-lg text-kairos-blue">
                            <MapPin size={24} />
                        </div>
                         <div>
                            <h3 className="font-bold text-white">Visit Us</h3>
                            <p className="text-kairos-muted">123 Innovation Dr.</p>
                            <p className="text-kairos-muted">San Francisco, CA 94103</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                         <div className="p-3 bg-white/5 rounded-lg text-kairos-blue">
                            <Phone size={24} />
                        </div>
                         <div>
                            <h3 className="font-bold text-white">Call Us</h3>
                            <p className="text-kairos-muted">+1 (555) 123-4567</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 p-8 rounded-2xl border border-white/5">
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">First Name</label>
                            <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-kairos-blue focus:outline-none transition-colors" placeholder="John" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Last Name</label>
                            <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-kairos-blue focus:outline-none transition-colors" placeholder="Doe" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <input type="email" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-kairos-blue focus:outline-none transition-colors" placeholder="john@company.com" />
                    </div>

                     <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Message</label>
                        <textarea rows="4" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-kairos-blue focus:outline-none transition-colors" placeholder="How can we help you?" />
                    </div>

                    <button className="w-full py-4 bg-kairos-blue text-kairos-bg font-bold rounded-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]">
                        Send Message
                        <Send size={18} />
                    </button>
                </form>
            </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
