interface LessonLayoutProps {
  player: React.ReactNode;
  info: React.ReactNode;
  comments?: React.ReactNode;
  sidebar: React.ReactNode;
}

export function LessonLayout({ player, info, comments, sidebar }: LessonLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row md:gap-4 lg:gap-6">
      {/* Main content: 70% desktop, 65% tablet */}
      <div className="w-full md:w-[65%] lg:w-[70%]">
        {player}
        <div className="px-4 pb-8 sm:px-6 lg:px-0">
          {info}
          {comments}
        </div>
      </div>

      {/* Sidebar: 30% desktop, 35% tablet */}
      <div className="w-full px-4 pb-8 sm:px-6 md:w-[35%] md:px-0 lg:w-[30%]">
        <div className="md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:overflow-y-auto">
          {sidebar}
        </div>
      </div>
    </div>
  );
}
