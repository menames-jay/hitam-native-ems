export interface StatItem {
  label: string;
  value: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

export interface InfoGridProps {
  primaryCardTitle: string;
  primaryCardSubtitle: string;
  primaryCardDescription: string;
  primaryActionLabel: string;
  primaryActionIcon: string;
  primaryCardWatermarkIcon: string;
  stats: StatItem[];
  statsTitle: string;
}

export function InfoGrid({
  primaryCardTitle,
  primaryCardSubtitle,
  primaryCardDescription,
  primaryActionLabel,
  primaryActionIcon,
  primaryCardWatermarkIcon,
  stats,
  statsTitle,
}: InfoGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
      
      {/* Primary Action Card (Takes up 2 cols on Desktop) */}
      <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] shadow-xl shadow-black/5 hover:shadow-primary/10 transition-all border-none relative overflow-hidden group">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 dark:bg-primary/10 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    {primaryCardWatermarkIcon}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {primaryCardTitle}
                  </h3>
                  <p className="text-primary/70 text-sm font-bold">
                    {primaryCardSubtitle}
                  </p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                {primaryCardDescription}
              </p>
              <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3">
                <span className="material-symbols-outlined">{primaryActionIcon}</span>
                {primaryActionLabel}
              </button>
            </div>
            
            {/* Outline Box */}
            <div className="hidden md:flex w-40 h-40 bg-gray-50 dark:bg-neutral-800 rounded-3xl border-2 border-dashed border-primary/20 items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300">
              <span className="material-symbols-outlined text-primary/20 text-7xl">
                qr_code_2
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="glass p-8 rounded-[2.5rem] shadow-xl shadow-black/5 border-none flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            {statsTitle}
          </h3>
          <div className="space-y-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgClass} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-xl ${stat.colorClass}`}>
                      {stat.icon}
                    </span>
                  </div>
                  <span className="font-bold text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </span>
                </div>
                <span className="text-xl font-black text-gray-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <button className="mt-8 text-primary font-black flex items-center gap-2 hover:gap-4 transition-all group w-fit">
          View full analytics <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
        </button>
      </div>

    </div>
  );
}
