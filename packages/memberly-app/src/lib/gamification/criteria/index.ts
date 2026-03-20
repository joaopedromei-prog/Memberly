/**
 * Criteria checkers registry.
 * Maps badge criteria type to its checker function.
 *
 * Story 16.2 — AC11
 */

import type { CriteriaChecker } from '../types';
import { checkFirstLesson } from './first-lesson';
import { checkCourseComplete } from './course-complete';
import { checkStreak } from './streak';
import { checkComments } from './comments';
import { checkExplorer } from './explorer';
import { checkLessonsCount } from './lessons-count';

export const criteriaCheckers: Record<string, CriteriaChecker> = {
  FIRST_LESSON: checkFirstLesson,
  COURSE_COMPLETE: checkCourseComplete,
  STREAK_7: checkStreak,
  STREAK_30: checkStreak,
  COMMENTS_10: checkComments,
  EXPLORER_3: checkExplorer,
  LESSONS_50: checkLessonsCount,
};
