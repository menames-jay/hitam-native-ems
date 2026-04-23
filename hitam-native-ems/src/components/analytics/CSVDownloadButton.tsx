"use client";

import { cn } from "@/lib/utils";

interface CSVDownloadButtonProps {
  data: any[];
  filename: string;
}

export function CSVDownloadButton({ data, filename }: CSVDownloadButtonProps) {
  const downloadCSV = () => {
    if (!data || data.length === 0) return;

    // Convert data to CSV string
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${val}"`).join(",")
    ).join("\n");
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Create link and trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={downloadCSV}
      className={cn(
        "px-8 py-4 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2",
        (!data || data.length === 0) && "opacity-20 cursor-not-allowed"
      )}
      disabled={!data || data.length === 0}
    >
      <span className="material-symbols-outlined text-sm">download</span>
      Institutional CSV
    </button>
  );
}
