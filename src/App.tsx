import React, { useEffect } from "react";
import "./App.css";

import useAppState from "./useAppState";

function App() {
  const [state, dispatch] = useAppState();

  useEffect(() => {
    fetch("pokemon.txt")
      .then((response) => response.text())
      .then((text) => {
        setTimeout(
          () =>
            dispatch({
              type: "load-data",
              wordPack: text
                .split("\n")
                .map((word) =>
                  word.toLowerCase().trim().replaceAll(/\s+/g, " "),
                )
                .filter(Boolean),
            }),
          3000,
        );
      });
  }, [dispatch]);

  switch (state.phase) {
    case "pre-game": {
      if (state.wordPack === null) {
        return <div>Loading Data...</div>;
      } else {
        return (
          <div>
            <button onClick={() => dispatch({ type: "start-game" })}>
              Begin new game
            </button>
            <pre>{JSON.stringify(state, null, 2)}</pre>
          </div>
        );
      }
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
          <pre>{JSON.stringify(state, null, 2)}</pre>
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
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
      );
    }
  }

  return null;
}

export default App;
