import React, { useState } from 'react';
import { User, Plus, Search, UserCheck, FileText, Check } from 'lucide-react';
import { Patient } from '../types';
import { StorageService } from '../services/StorageService';

interface PatientsScreenProps {
  patients: Patient[];
  onRefreshPatients: () => void;
}

export const PatientsScreen: React.FC<PatientsScreenProps> = ({
  patients,
  onRefreshPatients,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Patient Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [sex, setSex] = useState('Male');
  const [notes, setNotes] = useState('');

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPatient: Patient = {
      id: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      age: Number(age) || 30,
      sex,
      notes: notes.trim() || 'No baseline notes specified.',
    };

    StorageService.addPatient(newPatient);
    onRefreshPatients();
    setIsModalOpen(false);
    setName('');
    setAge(30);
    setSex('Male');
    setNotes('');
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Add Patient */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F8FAFC]">Patient Profiles</h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Manage personal and clinical subject records for targeted auscultation baselines.
          </p>
        </div>

        <button
          id="btn-open-add-patient-modal"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#06B6D4] hover:bg-[#22D3EE] text-[#0B0F17] font-extrabold text-xs rounded-xl transition shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Subject Profile
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search profiles by name, ID, or clinical baseline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE]"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-[#1E293B] border border-[#334155] rounded-2xl p-5 shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/15 flex items-center justify-center text-[#22D3EE]">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0F172A] border border-[#334155] text-[#94A3B8]">
                  {patient.id}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-[#F8FAFC]">{patient.name}</h3>
              <div className="text-xs text-[#22D3EE] mt-0.5">
                {patient.age} years old • {patient.sex}
              </div>

              <div className="mt-3 p-3 rounded-xl bg-[#0F172A] border border-[#334155]/60 text-xs text-[#94A3B8] line-clamp-2">
                {patient.notes}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#334155]/60 flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1 text-[#10B981]">
                <UserCheck className="w-3.5 h-3.5" /> Active Baseline
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#F8FAFC] mb-1">Add Subject Profile</h3>
            <p className="text-xs text-[#94A3B8] mb-4">
              Enter demographic and baseline medical details.
            </p>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
                  Full Name / Identifier
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
                    Sex
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value)}
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94A3B8] uppercase mb-1">
                  Baseline Notes / History
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. History of asthma, baseline resting pulse 68..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#06B6D4] hover:bg-[#22D3EE] text-xs font-bold text-[#0B0F17] transition cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
