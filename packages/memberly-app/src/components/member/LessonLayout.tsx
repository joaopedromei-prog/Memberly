interface LessonLayoutProps {
  player: React.ReactNode;
  info: React.ReactNode;
  comments?: React.ReactNode;
  navigation?: React.ReactNode;
  sidebar: React.ReactNode;
}

export function LessonLayout({ player, info, comments, navigation, sidebar }: LessonLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:gap-6">
      {/* Left column: video, info, comments, navigation — 70% on desktop */}
      <div className="w-full lg:w-[70%]">
        {player}
        <div className="bg-[#141414] px-4 pb-8 sm:px-6 lg:px-0">
          {info}
          {comments}
          {navigation}
        </div>
      </div>

      {/* Right column: lesson navigation sidebar — 30% on desktop, sticky */}
      <div className="w-full px-4 pb-8 sm:px-6 lg:w-[30%] lg:px-0">
        <div className="scrollbar-dark lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto">
          {sidebar}
        </div>
      </div>
    </div>
  );
}
