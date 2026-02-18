import React from 'react';
import { Github, Linkedin, Twitter } from 'lucide-react';

const TeamPage = () => {
    const team = [
        { id: 1, name: "Alex Chen", role: "Founder & CEO", bio: "Ex-Google SRE with a passion for resilient systems." },
        { id: 2, name: "Sarah Jones", role: "CTO", bio: "AI researcher turned infrastructure engineer." },
        { id: 3, name: "Mike Ross", role: "Lead Engineer", bio: "Full-stack wizard building the next gen of tools." },
        { id: 4, name: "Emily White", role: "Product Designer", bio: "Crafting intuitive experiences for complex data." },
        { id: 5, name: "David Kim", role: "Data Scientist", bio: "Teaching machines to understand chaos." },
        { id: 6, name: "Jessica Lee", role: "Developer Advocate", bio: "Bridge between the community and the code." },
    ];

  return (
    <div className="min-h-screen bg-kairos-bg text-white relative py-24 px-6 overflow-hidden">
        {/* Background Elements */}
       <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-kairos-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-center">
          Meet the <span className="text-purple-500">Builders</span>
        </h1>
        <p className="text-xl text-kairos-muted text-center max-w-2xl mx-auto mb-24">
          A diverse team of engineers, researchers, and designers working together to solve the hardest problems in observability.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.id} className="glass-card p-8 rounded-2xl text-center group hover:border-kairos-blue/50 transition-all duration-300">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gray-700 to-gray-900 mb-6 overflow-hidden relative border-4 border-white/5 group-hover:border-kairos-blue transition-all shadow-xl">
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white/20 bg-white/5">
                        {member.name.charAt(0)}{member.name.split(' ')[1].charAt(0)}
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-kairos-blue font-medium mb-4">{member.role}</p>
                <p className="text-sm text-kairos-muted mb-6">{member.bio}</p>

                <div className="flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-gray-400 hover:text-white transition-colors"><Github size={20}/></button>
                    <button className="text-gray-400 hover:text-blue-400 transition-colors"><Linkedin size={20}/></button>
                    <button className="text-gray-400 hover:text-blue-300 transition-colors"><Twitter size={20}/></button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
