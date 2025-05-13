import React, { useEffect, useRef } from "react";
import "./App.css";

import useAppState from "./useAppState";

function App() {
  const [state, dispatch] = useAppState();
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const playAgainButtonRef = useRef<HTMLButtonElement>(null);

  // Load the word pack from a file
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

  // Handle the focus of the buttons, even when clicked off
  useEffect(() => {
    function handleDocClick(
      buttonRef: React.RefObject<HTMLButtonElement | null>,
    ) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 0);
    }

    switch (state.phase) {
      case "pre-game": {
        document.addEventListener("click", () => {
          handleDocClick(startButtonRef);
        });
        break;
      }
      case "in-game": {
        break;
      }
      case "post-game": {
        document.addEventListener("click", () => {
          handleDocClick(playAgainButtonRef);
        });
        break;
      }
    }
  }, [state.phase]);

  switch (state.phase) {
    case "pre-game": {
      if (state.wordPack === null) {
        return <div>Loading Data...</div>;
      } else {
        return (
          <div>
            <button
              onClick={() => dispatch({ type: "start-game" })}
              ref={startButtonRef}
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
              autoFocus
            />
          </label>
          <button onClick={() => dispatch({ type: "skip-word" })}>
            Skip Word
          </button>
          <button onClick={() => dispatch({ type: "end-game" })}>
            End Game
          </button>
          <span>
            Correct Guesses: {state.numWordsGuessed} || Skipped words:{" "}
            {state.numWordsSkipped}
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
            Congratulations! You guessed {state.numWordsGuessed}{" "}
            {state.numWordsGuessed === 1 ? "word" : "words"} and skipped{" "}
            {state.numWordsSkipped}{" "}
            {state.numWordsSkipped === 1 ? "word" : "words"}
          </h1>
          <button
            onClick={() => dispatch({ type: "start-game" })}
            ref={playAgainButtonRef}
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
