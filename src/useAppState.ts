import { useReducer, type Dispatch } from "react";

type State = Readonly<
  | {
      phase: "pre-game";
      wordPack: readonly string[] | null;
    }
  | {
      phase: "in-game";
      goal: string;
      guess: string;
      wordPack: readonly string[] | null;
    }
  | {
      phase: "post-game";
      goal: string;
      wordPack: readonly string[] | null;
    }
>;

type Action =
  | { type: "load-data"; wordPack: readonly string[] }
  | { type: "start-game" }
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
        goal: getRandomWord(state),
        guess: "",
        wordPack: state.wordPack,
      };
    case "update-guess":
      if (state.phase !== "in-game") break;

      if (normalizeWord(action.newGuess) === state.goal) {
        return {
          phase: "post-game",
          goal: state.goal,
          wordPack: state.wordPack,
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
