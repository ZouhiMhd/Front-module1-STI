// app/dashboard/[id]/layout.tsx
import { CaseDetailProvider } from "@/app/components/auth/CaseDetailContext";

export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <CaseDetailProvider>
      {children}
    </CaseDetailProvider>
  );
}