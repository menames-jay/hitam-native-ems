export interface DashboardHeroProps {
  greetingTitle: string;
  greetingSubtitle: string;
  primaryActionLabel: string;
  primaryActionIcon: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel: string;
  onSecondaryAction?: () => void;
  countdownDays?: string;
  countdownHours?: string;
}

export function DashboardHero({
  greetingTitle,
  greetingSubtitle,
  primaryActionLabel,
  primaryActionIcon,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  countdownDays,
  countdownHours,
}: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] welcome-gradient p-8 sm:p-12 mb-10 shadow-2xl shadow-primary/20">
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        <div className="text-center lg:text-left max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            {greetingTitle}
          </h2>
          <p className="text-white/80 text-lg sm:text-xl font-medium mb-8">
            {greetingSubtitle}
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <button
              onClick={onPrimaryAction}
              className="px-8 py-4 bg-white text-primary dark:bg-white dark:text-primary font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-xl shadow-black/10 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">{primaryActionIcon}</span>
              {primaryActionLabel}
            </button>
            <button
              onClick={onSecondaryAction}
              className="px-8 py-4 bg-black/10 text-white border border-white/20 font-bold rounded-2xl hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              {secondaryActionLabel}
            </button>
          </div>
        </div>

        {countdownDays && countdownHours && (
          <div className="hidden lg:block shrink-0">
            <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-8 border border-white/20 shadow-2xl">
              <div className="text-white/60 text-xs font-black uppercase tracking-widest mb-4">
                Next Event Starts In
              </div>
              <div className="flex gap-6 items-center">
                <div className="text-center">
                  <div className="text-4xl font-black text-white leading-none">{countdownDays}</div>
                  <div className="text-[10px] font-bold text-white/60 uppercase mt-2">Days</div>
                </div>
                <div className="text-white/30 text-3xl font-light">:</div>
                <div className="text-center">
                  <div className="text-4xl font-black text-white leading-none">{countdownHours}</div>
                  <div className="text-[10px] font-bold text-white/60 uppercase mt-2">Hours</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
