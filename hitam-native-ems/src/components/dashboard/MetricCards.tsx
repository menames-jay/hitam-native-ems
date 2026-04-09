import { cn } from "@/lib/utils";
import { RoleConfig } from "@/lib/config/roles";

interface MetricCardsProps {
  config: RoleConfig;
  metrics: Array<string | number>;
}

export function MetricCards({ config, metrics }: MetricCardsProps) {
  const metricItems = [
    { label: config.labels.metric1, val: metrics[0], icon: config.icons.metric1 },
    { label: config.labels.metric2, val: metrics[1], icon: config.icons.metric2 },
    { label: config.labels.metric3, val: metrics[2], icon: config.icons.metric3 }
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metricItems.map((m, idx) => (
        <div key={idx} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-8 rounded-[2.5rem] shadow-sm group hover:-translate-y-1 transition-all duration-300">
          <div className={cn("inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-6", config.theme.accent, "text-white")}>
            <span className="material-symbols-outlined text-2xl">{m.icon}</span>
          </div>
          <h4 className="text-4xl font-black text-slate-900 dark:text-white mb-1 group-hover:translate-x-1 transition-transform">{m.val}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{m.label}</p>
        </div>
      ))}
    </section>
  );
}
