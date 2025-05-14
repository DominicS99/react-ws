import React, { useEffect, useRef } from "react";
import "./App.css";

import useAppState, { normalizeWord } from "./useAppState";

function App() {
  const [state, dispatch] = useAppState();
  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  const wordInputRef = useRef<HTMLInputElement | null>(null);
  const playAgainButtonRef = useRef<HTMLButtonElement | null>(null);

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
                .map((word) => normalizeWord(word))
                .filter(Boolean),
            }),
          0,
        );
      });

    fetch("https://unpkg.com/naught-words@1.2.0/en.json")
      .then((response) => response.json())
      .then((jsonObj) => {
        dispatch({
          type: "load-banned-words",
          bannedWords: jsonObj.map((word: string) => normalizeWord(word)),
        });
      });
  }, [dispatch]);

  // Handle the focus of the buttons / input box, even when clicked off
  useEffect(() => {
    function handleDocClick(
      buttonRef: React.RefObject<HTMLButtonElement | HTMLInputElement | null>,
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
        document.addEventListener("click", () => {
          handleDocClick(wordInputRef);
        });
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
              style={{ textTransform: "uppercase" }}
              value={state.guess}
              onChange={(e) => {
                dispatch({ type: "update-guess", newGuess: e.target.value });
              }}
              ref={wordInputRef}
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
        </div>
      );
    }
  }

  return null;
}

export default App;
