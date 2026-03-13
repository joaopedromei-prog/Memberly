interface TopLesson {
  lesson_title: string;
  product_title: string;
  count: number;
}

interface TopLessonsProps {
  lessons: TopLesson[];
}

export function TopLessons({ lessons }: TopLessonsProps) {
  if (lessons.length === 0) {
    return <p className="text-sm text-slate-500">Nenhuma aula completada ainda.</p>;
  }

  const maxCount = lessons[0]?.count ?? 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-[18px] font-semibold text-slate-900">
          Aulas Mais Assistidas
        </h2>
        <p className="text-[12px] font-medium text-slate-500">
          Top {lessons.length} por conclusões
        </p>
      </div>
      <div className="space-y-5">
        {lessons.map((lesson, i) => {
          const rank = i + 1;
          const progress = (lesson.count / maxCount) * 100;

          let rankStyle = 'bg-slate-50 text-slate-500';
          if (rank === 1) rankStyle = 'bg-amber-100 text-amber-700';
          else if (rank === 2) rankStyle = 'bg-slate-100 text-slate-600';
          else if (rank === 3) rankStyle = 'bg-orange-50 text-orange-600';

          return (
            <div key={i} className="flex items-center gap-4">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${rankStyle}`}
              >
                {rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-slate-900 truncate">
                  {lesson.lesson_title}
                </p>
                <p className="text-[12px] text-slate-400 truncate">
                  {lesson.product_title}
                </p>
              </div>
              <div className="w-24 shrink-0 text-right">
                <p className="text-[14px] text-slate-600 mb-1">
                  {lesson.count} conclusões
                </p>
                <div className="w-full h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
