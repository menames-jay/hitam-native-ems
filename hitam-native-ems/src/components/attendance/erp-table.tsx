"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { submitToErp } from "@/lib/actions/attendance";

interface Student {
  id: string;
  rollNo: string;
  name: string;
}

interface ErpTableProps {
  students: Student[];
  eventAttendance: string[]; // List of student IDs who attended events
  facultyId: string;
  currentHour: number;
  mode?: "mark" | "review";
  subject?: string;
  academicMetadata?: {
    deptId: string;
    year: number;
    section: string;
  };
  existingAttendance?: { studentId: string; status: "PRESENT" | "ABSENT" }[];
}

export function ErpAttendanceTable({
  students,
  eventAttendance,
  facultyId,
  currentHour,
  mode = "mark",
  subject = "Class",
  academicMetadata,
  existingAttendance
}: ErpTableProps) {
  const [attendance, setAttendance] = useState<Record<string, "PRESENT" | "ABSENT">>(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const map = Object.fromEntries(existingAttendance.map(a => [a.studentId, a.status]));
      // Fill any missing students just in case (e.g. newly added students)
      students.forEach(s => {
        if (!map[s.id]) {
          map[s.id] = eventAttendance.includes(s.id) ? "PRESENT" : "ABSENT";
        }
      });
      return map;
    }
    return Object.fromEntries(
      students.map(s => [
        s.id,
        eventAttendance.includes(s.id) ? "PRESENT" : "ABSENT"
      ])
    );
  });
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Analytics Calculation
  const stats = useMemo(() => {
    const present = Object.values(attendance).filter(v => v === "PRESENT").length;
    const mapped = students.filter(s => eventAttendance.includes(s.id)).length;
    const absent = students.length - present;
    return { present, mapped, absent };
  }, [attendance, students, eventAttendance]);

  const toggleStatus = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "PRESENT" ? "ABSENT" : "PRESENT"
    }));
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const finalData = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const payload = {
        status: mode === "review" ? "SUBMITTED" : "DRAFT",
        records: finalData
      };

      // Pass the academic context for the ledger snapshot
      const result = await submitToErp(
        undefined, // No specific event session (academic class review)
        academicMetadata ? {
          ...academicMetadata,
          slot: currentHour,
          date: new Date()
        } : undefined,
        payload as any // Cast to any because the schema typings expect JSONB
      );

      if (result?.success) {
        alert(`Governance Success: Attendance for ${subject} has been sent to the Program Head for review.`);
        router.push("/attendance");
      } else {
        throw new Error(result?.error || "Sync Failed");
      }
    } catch (error) {
      console.error(error);
      alert("Governance Error: Failed to synchronize with ERP. Please check institutional connectivity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Analytics Grid Integration */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-emerald-500/30">
          <span className="text-3xl font-black text-emerald-600 tracking-tighter">{stats.present}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mt-2">Present</span>
        </div>
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-blue-500/30">
          <span className="text-3xl font-black text-blue-600 tracking-tighter">{stats.mapped}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mt-2">Mapped</span>
        </div>
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-rose-500/30">
          <span className="text-3xl font-black text-rose-600 tracking-tighter">{stats.absent}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mt-2">Absent</span>
        </div>
      </div>

      {/* Class Topic Section */}
      <div className="space-y-3 px-12">
        <label htmlFor="topic-coverage" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Today&apos;s Topic Coverage</label>
        <textarea
          id="topic-coverage"
          placeholder="Enter the lesson summary or topics discussed..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex min-h-[60px] w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-4 text-base shadow-sm transition-colors placeholder:text-muted-foreground outline-none focus-visible:ring-blue-500/20 md:text-sm h-32 font-medium resize-none shadow-inner"
        />
      </div>

      {/* Search & Bulk Actions */}
      <div className="px-12">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">search</span>
          <Input
            placeholder="Filter students by name or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-14 h-16 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-3xl font-bold shadow-sm focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Student Ledger */}
      <div className="bg-white dark:bg-[#0f140f] border border-slate-200 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                <th className="px-8 py-6 border-b border-slate-100 dark:border-white/5 w-24">ROLL NO</th>
                <th className="px-8 py-6 border-b border-slate-100 dark:border-white/5">STUDENT NAME</th>
                <th className="px-8 py-6 border-b border-slate-100 dark:border-white/5 text-center">ATTENDANCE STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filteredStudents.map((s) => {
                const isMapped = eventAttendance.includes(s.id);
                const currentStatus = attendance[s.id];

                return (
                  <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-7">
                      <span className="text-xs font-black text-slate-400 group-hover:text-blue-600 transition-colors">{s.rollNo}</span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          currentStatus === "PRESENT" ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white tracking-tight">{s.name}</p>
                          {isMapped && (
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">verified</span> Mapped via Event
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleStatus(s.id)}
                          className={cn(
                            "relative w-24 h-12 rounded-full transition-all duration-300 shadow-inner flex items-center p-1",
                            currentStatus === "PRESENT" ? "bg-emerald-500" : "bg-rose-500"
                          )}
                        >
                          <div className={cn(
                            "bg-white w-10 h-10 rounded-full shadow-md transition-all duration-300 flex items-center justify-center font-black text-[10px] uppercase tracking-tighter",
                            currentStatus === "PRESENT" ? "translate-x-12 text-emerald-600" : "translate-x-0 text-rose-600"
                          )}>
                            {currentStatus === "PRESENT" ? "P" : "A"}
                          </div>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Static Footer within Table Container */}
        <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Action</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAttendance(Object.fromEntries(students.map(s => [s.id, "PRESENT"])))}
                className="text-[10px] font-black uppercase rounded-xl border-slate-200 dark:border-white/10"
              >
                All Present
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAttendance(Object.fromEntries(students.map(s => [s.id, "ABSENT"])))}
                className="text-[10px] font-black uppercase rounded-xl border-slate-200 dark:border-white/10"
              >
                All Absent
              </Button>
            </div>
          </div>

          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-7 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting
              ? "Syncing with ERP..."
              : mode === "review"
                ? "Submit for Review"
                : "Mark Attendance"}
          </Button>
        </div>
      </div>
    </div>
  );
}
