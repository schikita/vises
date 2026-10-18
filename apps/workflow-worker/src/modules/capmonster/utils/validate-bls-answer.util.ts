import { CAPMONSTER_BLS_CELL_COUNT } from '../constants';

export const validateBlsAnswer = (answer: unknown): boolean[] => {
  if (!Array.isArray(answer) || answer.length !== CAPMONSTER_BLS_CELL_COUNT) {
    throw new Error(
      `CapMonster solution.answer must be a boolean[${CAPMONSTER_BLS_CELL_COUNT}]; got length=${Array.isArray(answer) ? answer.length : typeof answer}`,
    );
  }
  const out: boolean[] = [];
  for (let i = 0; i < answer.length; i += 1) {
    if (typeof answer[i] !== 'boolean') {
      throw new Error(
        `CapMonster solution.answer[${i}] must be boolean; got ${typeof answer[i]}`,
      );
    }
    out.push(answer[i] as boolean);
  }
  return out;
};
