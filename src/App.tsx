import React from "react";
import "./App.css";

type State =
  | {
      phase: "pre-game";
    }
  | {
      phase: "in-game";
      goal: string;
      guess: string;
    }
  | {
      phase: "post-game";
      goal: string;
    };

type Action =
  | { type: "start-game" }
  | { type: "update-guess"; newGuess: string };

function getInitialState(): State {
  return {
    phase: "pre-game",
  };
}

function getRandomWord(): string {
  const words = ["apple", "banana", "cherry", "date", "fig", "grape"];
  return words[Math.floor(Math.random() * words.length)];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start-game":
      if (state.phase === "in-game") break;
      return {
        phase: "in-game",
        goal: getRandomWord(),
        guess: "",
      };
    case "update-guess":
      if (state.phase !== "in-game") break;

      if (action.newGuess === state.goal) {
        return {
          phase: "post-game",
          goal: state.goal,
        };
      }
      return {
        ...state,
        guess: action.newGuess,
      };
  }

  return state;
}

function App() {
  const [state, dispatch] = React.useReducer(reducer, null, getInitialState);

  switch (state.phase) {
    case "pre-game": {
      return (
        <button onClick={() => dispatch({ type: "start-game" })}>
          Begin new game
        </button>
      );
    }
    case "in-game": {
      return (
        <div>
          <h1>Goal: {state.goal}</h1>
          <label>
            Guess:
            <input
              type="text"
              value={state.guess}
              onChange={(e) => {
                dispatch({ type: "update-guess", newGuess: e.target.value });
              }}
            />
          </label>
        </div>
      );
    }
    case "post-game": {
      return (
        <div>
          <h1>Congratulations! You guessed the word: {state.goal}</h1>
          <button onClick={() => dispatch({ type: "start-game" })}>
            Play again
          </button>
        </div>
      );
    }
  }

  return null;
}

export default App;
