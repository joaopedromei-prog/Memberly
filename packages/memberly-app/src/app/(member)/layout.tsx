import { MemberHeader } from '@/components/member/MemberHeader';
import { MemberFooter } from '@/components/member/MemberFooter';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-bg text-base text-white">
      <MemberHeader />
      <main>{children}</main>
      <MemberFooter />
    </div>
  );
}
