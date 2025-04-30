import { useReducer, type Dispatch } from "react";

type State = Readonly<
  | {
      phase: "pre-game";
      wordPack: readonly string[] | null;
    }
  | {
      phase: "in-game";
      currRound: Round;
      finRounds: Round[];
      guess: string;
      wordsGuessed: number;
      wordsSkipped: number;
      wordPack: readonly string[] | null;
    }
  | {
      phase: "post-game";
      finRounds: Round[];
      wordsGuessed: number;
      wordsSkipped: number;
      wordPack: readonly string[] | null;
    }
>;

type Round = Readonly<{
  goal: string;
  scrambledWord: string;
  wasGuessed: boolean;
}>;

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

function startNewRound(state: State): Round {
  const base = getRandomWord(state);
  return {
    goal: base,
    scrambledWord: scrambleWord(base),
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
        wordsGuessed: 0,
        wordsSkipped: 0,
        wordPack: state.wordPack,
      };
    case "end-game":
      if (state.phase !== "in-game") break;
      return {
        phase: "post-game",
        finRounds: [...state.finRounds, state.currRound],
        wordsGuessed: state.wordsGuessed,
        wordsSkipped: state.wordsSkipped,
        wordPack: state.wordPack,
      };
    case "skip-word":
      if (state.phase !== "in-game") break;
      return {
        ...state,
        currRound: startNewRound(state),
        finRounds: [...state.finRounds, state.currRound],
        guess: "",
        wordsSkipped: state.wordsSkipped + 1,
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
