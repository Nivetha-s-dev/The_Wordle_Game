type WordBank = {
  4: string[];
  5: string[];
  6: string[];
};

type ApiResponse = {
  code: number;
  data: {
    content: string;
    wordLength: number;
  };
};

export const getRandomWord = (length: number): Promise<ApiResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomWordIndex = randomInt(1, 20);

      if (length in WORD_BANK) {
        const randomWord: string = WORD_BANK[length as keyof WordBank][randomWordIndex];

        resolve({
          code: 200,
          data: {
            content: randomWord,
            wordLength: length,
          },
        });
      } else {
        throw new Error(`Invalid word length: ${length}`);
      }
    }, 2000);
  });
};

/** Returns random number between min & max */
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const WORD_BANK: WordBank = {
  4: [
    'ache',
    'back',
    'bulk',
    'clip',
    'coin',
    'door',
    'dunk',
    'echo',
    'fake',
    'gain',
    'home',
    'land',
    'leaf',
    'left',
    'stow',
    'swap',
    'wine',
    'word',
    'zone',
    'zoom',
  ],
  5: [
    'water',
    'after',
    'where',
    'right',
    'think',
    'three',
    'years',
    'place',
    'sound',
    'great',
    'again',
    'still',
    'every',
    'small',
    'found',
    'never',
    'under',
    'might',
    'while',
    'house',
  ],
  6: [
    'people',
    'should',
    'little',
    'number',
    'world',
    'house',
    'system',
    'family',
    'during',
    'school',
    'always',
    'mother',
    'father',
    'return',
    'student',
    'change',
    'social',
    'around',
    'figure',
    'nation',
  ],
};
