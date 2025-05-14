import { useReducer, type Dispatch } from "react";

type State = Readonly<
  | {
      phase: "pre-game";
      wordPack: readonly string[] | null;
      bannedWords: readonly string[] | null;
    }
  | {
      phase: "in-game";
      currRound: Round;
      finRounds: Round[];
      guess: string;
      numWordsGuessed: number;
      numWordsSkipped: number;
      wordPack: readonly string[] | null;
      bannedWords: readonly string[] | null;
    }
  | {
      phase: "post-game";
      finRounds: Round[];
      numWordsGuessed: number;
      numWordsSkipped: number;
      wordPack: readonly string[] | null;
      bannedWords: readonly string[] | null;
    }
>;

type Round = Readonly<{
  goal: string;
  scrambledWord: string;
  wasGuessed: boolean;
}>;

type Action =
  | { type: "load-data"; wordPack: readonly string[] }
  | { type: "load-banned-words"; bannedWords: readonly string[] }
  | { type: "start-game" }
  | { type: "end-game" }
  | { type: "skip-word" }
  | { type: "update-guess"; newGuess: string };

export type { Action };

function getInitialState(): State {
  return {
    phase: "pre-game",
    wordPack: null,
    bannedWords: null,
  };
}

function getRandomWord(state: State): string {
  const words = state.wordPack!;
  return words[Math.floor(Math.random() * words.length)];
}

export function normalizeWord(word: string): string {
  return word.toUpperCase().trim().replaceAll(/\s+/g, " ");
}

function scrambleWord(word: string, bannedWords: readonly string[] | null): string {
  if (word.length < 2) return word; // Shouldn't matter in this game, but works as a safety net
  let res = word;
  let attempts = 0;
  while (res === word && attempts < 10) {
    // Scramble the word
    const wordArray = word.split("");
    for (let i = wordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
    }
    res = wordArray.join("");
    attempts++;

    // Confirm there's no naughty words in the scramble.
    if (bannedWords) {
      for (const bannedWord of bannedWords) {
        if (res.includes(bannedWord)) {
          res = word; // Reset to original word
          break;
        }
      }
    }
  }
  return res;
}

function startNewRound(state: State): Round {
  const base = getRandomWord(state);
  return {
    goal: base,
    scrambledWord: scrambleWord(base, state.bannedWords),
    wasGuessed: false,
  };
}

function reducer(state: State, action: Action): State {
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

      return {
        phase: "in-game",
        currRound: startNewRound(state),
        finRounds: [],
        guess: "",
        numWordsGuessed: 0,
        numWordsSkipped: 0,
        wordPack: state.wordPack,
        bannedWords: state.bannedWords,
      };
    case "end-game":
      if (state.phase !== "in-game") break;
      return {
        phase: "post-game",
        finRounds: [...state.finRounds, state.currRound],
        numWordsGuessed: state.numWordsGuessed,
        numWordsSkipped: state.numWordsSkipped,
        wordPack: state.wordPack,
        bannedWords: state.bannedWords,
      };
    case "skip-word":
      if (state.phase !== "in-game") break;
      return {
        ...state,
        currRound: startNewRound(state),
        finRounds: [...state.finRounds, state.currRound],
        guess: "",
        numWordsSkipped: state.numWordsSkipped + 1,
      };
    case "update-guess":
      if (state.phase !== "in-game") break;

      if (normalizeWord(action.newGuess) === state.currRound.goal) {
        return {
          ...state,
          currRound: startNewRound(state),
          finRounds: [
            ...state.finRounds,
            { ...state.currRound, wasGuessed: true },
          ],
          guess: "",
          numWordsGuessed: state.numWordsGuessed + 1,
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
