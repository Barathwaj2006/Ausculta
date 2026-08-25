import React from 'react';
import { Heart, Wind, Activity, Check } from 'lucide-react';
import { AUSCULTATION_SITES, AuscultationSiteKey } from '../types';

interface AnatomicalSiteGuideProps {
  selectedSite: AuscultationSiteKey;
  onSelectSite: (site: AuscultationSiteKey) => void;
}

export const AnatomicalSiteGuide: React.FC<AnatomicalSiteGuideProps> = ({
  selectedSite,
  onSelectSite,
}) => {
  const sites = Object.values(AUSCULTATION_SITES);
  const heartSites = sites.filter((s) => s.category === 'Heart');
  const lungSites = sites.filter((s) => s.category === 'Lung');
  const vascularSites = sites.filter((s) => s.category === 'Vascular');

  const renderSection = (
    title: string,
    icon: React.ReactNode,
    items: typeof sites,
    iconColor: string
  ) => (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
        <span className={iconColor}>{icon}</span>
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => {
          const isSelected = selectedSite === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectSite(item.key)}
              className={`text-left p-2.5 rounded-xl border transition flex items-start justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#06B6D4]/15 border-[#22D3EE] text-[#F8FAFC] shadow-sm'
                  : 'bg-[#0F172A] border-[#334155]/60 text-[#94A3B8] hover:border-[#475569] hover:text-[#E2E8F0]'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-[#F8FAFC]">{item.displayName}</div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5">{item.description}</div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-[#22D3EE] shrink-0 ml-2" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4">
      <h3 className="text-sm font-bold text-[#F8FAFC] mb-3 flex items-center justify-between">
        <span>Anatomical Examination Site</span>
        <span className="text-xs font-normal text-[#22D3EE]">
          {AUSCULTATION_SITES[selectedSite]?.displayName}
        </span>
      </h3>

      {renderSection('Cardiac Auscultation Sites', <Heart className="w-3.5 h-3.5" />, heartSites, 'text-[#F43F5E]')}
      {renderSection('Pulmonary Auscultation Sites', <Wind className="w-3.5 h-3.5" />, lungSites, 'text-[#22D3EE]')}
      {renderSection('Vascular Auscultation Sites', <Activity className="w-3.5 h-3.5" />, vascularSites, 'text-[#10B981]')}
    </div>
  );
};
