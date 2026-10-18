/** Demo / empty-DB seed and reset port. */
export interface IDemoDataSeeder {
  seedIfEmpty(): Promise<void>;
  resetDemo(): Promise<void>;
}
