
import React, { useState, useEffect } from 'react';
import { CVData, AIProvider } from '../../types';
import { fetchCVSuggestions } from '../../services/geminiService';
import { fetchCVSuggestionsNvidia } from '../../services/nvidiaService';
import { jsPDF } from 'jspdf';

interface CVWizardProps {
  onClose: () => void;
  major: string;
  isDarkMode: boolean;
  provider: AIProvider;
}

const steps = [
  { id: 'personal', title: 'Data Diri', icon: 'person' },
  { id: 'education', title: 'Pendidikan', icon: 'school' },
  { id: 'skills', title: 'Keahlian', icon: 'star' },
  { id: 'experience', title: 'Pengalaman', icon: 'work' },
  { id: 'finalize', title: 'Selesai', icon: 'check_circle' },
];

const CVWizard: React.FC<CVWizardProps> = ({ onClose, major, provider }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<CVData>({ name: '', email: '', phone: '', education: '', gradYear: '', skills: [], experience: '', summary: '' });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (steps[currentStep].id === 'skills' || steps[currentStep].id === 'experience') loadSuggestions(steps[currentStep].id);
  }, [currentStep]);

  const loadSuggestions = async (section: string) => {
    setIsLoadingSuggestions(true);
    let result;
    if (provider === AIProvider.NVIDIA) {
      result = await fetchCVSuggestionsNvidia(section, major);
    } else {
      result = await fetchCVSuggestions(section, major);
    }
    setSuggestions(result);
    setIsLoadingSuggestions(false);
  };

  const handleNext = () => { if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 0) setCurrentStep(currentStep - 1); };
  const toggleSkill = (skill: string) => {
    setData(prev => ({ ...prev, skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill] }));
  };

  const generatePDF = () => {
    const doc = new jsPDF(); const m = 20; let y = 20;
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text(data.name.toUpperCase(), m, y); y += 10;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(80, 80, 80); doc.text(`${data.email}  |  ${data.phone}`, m, y); y += 15;
    doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.text("PENDIDIKAN", m, y); y += 2;
    doc.setDrawColor(200, 200, 200); doc.line(m, y, 190, y); y += 8;
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text(data.education, m, y); y += 5;
    doc.setFont("helvetica", "normal"); doc.text(`${major}  |  Lulus: ${data.gradYear}`, m, y); y += 15;
    doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.text("KEAHLIAN", m, y); y += 2; doc.line(m, y, 190, y); y += 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    const sl = doc.splitTextToSize(data.skills.join(", "), 170); doc.text(sl, m, y); y += (sl.length * 6) + 5;
    doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.text("PENGALAMAN & PROYEK", m, y); y += 2; doc.line(m, y, 190, y); y += 8;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    const el = doc.splitTextToSize(data.experience, 170); doc.text(el, m, y);
    doc.save(`CV_${data.name.replace(/\s+/g, '_')}.pdf`);
  };

  const copyToClipboard = () => {
    const text = `CURRICULUM VITAE\nNama: ${data.name}\nEmail: ${data.email}\nTelepon: ${data.phone}\n\nPENDIDIKAN\nSMK: ${data.education}\nTahun Lulus: ${data.gradYear}\nJurusan: ${major}\n\nKEAHLIAN\n${data.skills.join(', ')}\n\nPENGALAMAN\n${data.experience}`;
    navigator.clipboard.writeText(text);
    alert('CV disalin ke clipboard!');
  };

  const inputStyle: React.CSSProperties = { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-md)' }}>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>Buat CV SMK</h2>
            <p className="text-[10px] font-medium" style={{ color: 'var(--text-tertiary)' }}>ATS-Friendly CV Builder</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--surface-hover)]" style={{ color: 'var(--text-secondary)' }}>
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Steps */}
        <div className="flex px-5 py-3 gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
          {steps.map((s, i) => (
            <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${i <= currentStep ? 'text-white' : ''}`}
                style={i === currentStep ? { background: 'var(--accent)' } : i < currentStep ? { background: 'var(--success)', color: 'white' } : { background: 'var(--bg-alt)', color: 'var(--text-tertiary)' }}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className="text-[9px] font-medium" style={{ color: i === currentStep ? 'var(--accent)' : 'var(--text-tertiary)' }}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 anim-fade-in">
          {currentStep === 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>Informasi Kontak</h3>
              <input type="text" placeholder="Nama Lengkap" value={data.name} onChange={e => setData({...data, name: e.target.value})}
                className="w-full p-3 rounded-xl border text-sm outline-none focus:border-[var(--accent)]" style={inputStyle} />
              <input type="email" placeholder="Email" value={data.email} onChange={e => setData({...data, email: e.target.value})}
                className="w-full p-3 rounded-xl border text-sm outline-none focus:border-[var(--accent)]" style={inputStyle} />
              <input type="text" placeholder="Nomor HP" value={data.phone} onChange={e => setData({...data, phone: e.target.value})}
                className="w-full p-3 rounded-xl border text-sm outline-none focus:border-[var(--accent)]" style={inputStyle} />
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>Pendidikan</h3>
              <input type="text" placeholder="Nama SMK" value={data.education} onChange={e => setData({...data, education: e.target.value})}
                className="w-full p-3 rounded-xl border text-sm outline-none focus:border-[var(--accent)]" style={inputStyle} />
              <input type="text" placeholder="Tahun Lulus (2024)" value={data.gradYear} onChange={e => setData({...data, gradYear: e.target.value})}
                className="w-full p-3 rounded-xl border text-sm outline-none focus:border-[var(--accent)]" style={inputStyle} />
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Keahlian</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>AI Suggested</span>
              </div>
              {isLoadingSuggestions ? (
                <div className="flex items-center gap-2 py-6 justify-center" style={{ color: 'var(--accent)' }}>
                  <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                  <span className="text-sm">Menyiapkan saran...</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((skill, i) => (
                    <button key={i} onClick={() => toggleSkill(skill)}
                      className="px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-colors active:scale-95"
                      style={data.skills.includes(skill)
                        ? { background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }
                        : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>Pengalaman / PKL</h3>
              <textarea rows={4} placeholder="Ceritakan pengalaman PKL/proyek..."
                value={data.experience} onChange={e => setData({...data, experience: e.target.value})}
                className="w-full p-3 rounded-xl border text-sm outline-none resize-none focus:border-[var(--accent)]" style={inputStyle} />
              {isLoadingSuggestions ? (
                <p className="text-[11px]" style={{ color: 'var(--accent)' }}>Menganalisis...</p>
              ) : suggestions.map((ex, i) => (
                <button key={i} onClick={() => setData({...data, experience: ex})}
                  className="w-full text-left p-3 rounded-xl border text-[12px] italic transition-colors hover:bg-[var(--surface-hover)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  "{ex}"
                </button>
              ))}
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-4 text-center">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>CV Siap! 🎉</h3>
              <div className="grid gap-2">
                <button onClick={generatePDF}
                  className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'var(--accent)' }}>
                  <span className="material-symbols-outlined text-base">download</span> Unduh PDF
                </button>
                <button onClick={copyToClipboard}
                  className="w-full py-3 rounded-xl font-medium text-sm border flex items-center justify-center gap-2 hover:bg-[var(--surface-hover)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                  <span className="material-symbols-outlined text-base">content_copy</span> Salin Teks
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex justify-between border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleBack} disabled={currentStep === 0}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${currentStep === 0 ? 'opacity-0' : 'hover:bg-[var(--surface-hover)]'}`}
            style={{ color: 'var(--text-secondary)' }}>
            ← Kembali
          </button>
          {currentStep < steps.length - 1 && (
            <button onClick={handleNext}
              className="text-sm font-semibold px-5 py-2 rounded-lg text-white hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'var(--accent)' }}>
              Lanjut →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVWizard;
