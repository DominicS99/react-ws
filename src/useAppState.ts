import { useReducer, type Dispatch } from "react";

type State = Readonly<
  | {
      phase: "pre-game";
      wordPack: readonly string[] | null;
    }
  | {
      phase: "in-game";
      goal: string;
      scrambledWord: string;
      guess: string;
      wordsGuessed: number;
      wordsSkipped: number;
      wordPack: readonly string[] | null;
    }
  | {
      phase: "post-game";
      goal: string;
      wordsGuessed: number;
      wordsSkipped: number;
      wordPack: readonly string[] | null;
    }
>;

type Action =
  | { type: "load-data"; wordPack: readonly string[] }
  | { type: "start-game" }
  | { type: "end-game" }
  | { type: "skip-word" }
  | { type: "update-guess"; newGuess: string };

function getInitialState(): State {
  return {
    phase: "pre-game",
    wordPack: null,
  };
}

function getRandomWord(state: State): string {
  const words = state.wordPack!;
  return words[Math.floor(Math.random() * words.length)];
}

function normalizeWord(word: string): string {
  return word.toLowerCase().trim().replaceAll(/\s+/g, " ");
}

function scrambleWord(word: string): string {
  const wordArray = word.split("");
  for (let i = wordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
  }
  return wordArray.join("");
}

function reducer(state: State, action: Action): State {
  let base = "";
  switch (action.type) {
    case "load-data":
      if (state.phase !== "pre-game") break;
      return {
        ...state,
        wordPack: action.wordPack,
      };
    case "start-game":
      if (state.phase === "in-game") break;
      if (state.wordPack === null) break;

      base = getRandomWord(state);
      return {
        phase: "in-game",
        goal: base,
        scrambledWord: scrambleWord(base),
        guess: "",
        wordsGuessed: 0,
        wordsSkipped: 0,
        wordPack: state.wordPack,
      };
    case "end-game":
      if (state.phase !== "in-game") break;
      return {
        phase: "post-game",
        goal: state.goal,
        wordsGuessed: state.wordsGuessed,
        wordsSkipped: state.wordsSkipped,
        wordPack: state.wordPack,
      };
    case "skip-word":
      if (state.phase !== "in-game") break;

      base = getRandomWord(state);
      return {
        ...state,
        goal: base,
        scrambledWord: scrambleWord(base),
        guess: "",
        wordsSkipped: state.wordsSkipped + 1,
      };
    case "update-guess":
      if (state.phase !== "in-game") break;

      if (normalizeWord(action.newGuess) === state.goal) {
        base = getRandomWord(state);
        return {
          ...state,
          goal: base,
          scrambledWord: scrambleWord(base),
          guess: "",
          wordsGuessed: state.wordsGuessed + 1,
        };
      }
      return {
        ...state,
        guess: action.newGuess,
      };
  }

  return state;
}

export default function useAppState(): [State, Dispatch<Action>] {
  return useReducer(reducer, null, getInitialState);
}
