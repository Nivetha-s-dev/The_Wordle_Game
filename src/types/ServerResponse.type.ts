export type ServerResponse = {
  code: number;
  data: {
    content: string;
    wordLength: number;
  };
};
