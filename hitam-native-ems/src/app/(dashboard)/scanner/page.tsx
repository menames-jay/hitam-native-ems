import { QRScanner } from "@/components/events/QRScanner";

export default function Page() {
  // TODO: Get real student ID from auth session
  const mockStudentId = "student_mock_123";

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <QRScanner studentId={mockStudentId} />
    </div>
  );
}
