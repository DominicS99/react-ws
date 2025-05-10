import React, { useEffect, useRef } from "react";
import "./App.css";

import useAppState from "./useAppState";

function App() {
  const [state, dispatch] = useAppState();
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (state.phase) {
        case "pre-game": {
          if (e.key === "Enter") {
            buttonRef.current?.click();
          }
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [state.phase, buttonRef]);

  switch (state.phase) {
    case "pre-game": {
      if (state.wordPack === null) {
        return <div>Loading Data...</div>;
      } else {
        return (
          <div>
            <button
              ref={buttonRef}
              onClick={() => dispatch({ type: "start-game" })}
              autoFocus
            >
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
          <h1>Unscramble this: {state.currRound.scrambledWord}</h1>
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
          <button onClick={() => dispatch({ type: "skip-word" })}>
            Skip Word
          </button>
          <button onClick={() => dispatch({ type: "end-game" })}>
            End Game
          </button>
          <span>
            Correct Guesses: {state.wordsGuessed} || Skipped words:{" "}
            {state.wordsSkipped}
          </span>
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
      );
    }
    case "post-game": {
      return (
        <div>
          <h1>
            Game Over! The final word was{" "}
            {state.finRounds[state.finRounds.length - 1].goal}
          </h1>
          <h1>
            Congratulations! You guessed {state.wordsGuessed}{" "}
            {state.wordsGuessed === 1 ? "word" : "words"} and skipped{" "}
            {state.wordsSkipped} {state.wordsSkipped === 1 ? "word" : "words"}
          </h1>
          <button
            ref={buttonRef}
            onClick={() => dispatch({ type: "start-game" })}
            autoFocus
          >
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
