"use client";

import { useState } from "react";
import { downloadAttendanceAction } from "@/lib/actions/attendance";
import { Button } from "@/components/ui/button";

export function DownloadReportButton({ sessionId }: { sessionId: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleDownload = async () => {
    setIsPending(true);
    try {
      const result = await downloadAttendanceAction(sessionId);
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", result.filename || "attendance_report.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Failed to generate report: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Institutional Error: Failed to generate digest.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button 
      onClick={handleDownload}
      disabled={isPending}
      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg uppercase tracking-widest flex items-center gap-2"
    >
      <span className="material-symbols-outlined text-base">cloud_download</span>
      {isPending ? "Generating..." : "Download CSV Report"}
    </Button>
  );
}
