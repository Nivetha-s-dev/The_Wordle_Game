import * as React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { getRandomWord } from './server';
import './style.css';

const MIN_WORD_LENGTH = 4;
const MAX_WORD_LENGTH = 6;
const TOTAL_ATTEMPTS = 5;

const Tile = memo(({ letter, status }: { letter: string; status: string }) => (
    <div className={`tile ${status} ${letter && 'filled'} ${status && 'revealed'}`}>
        {letter}
        <div className="tile-overlay"></div>
    </div>
));

const WordLengthSelector = memo(({
                                     wordLength,
                                     onLengthChange,
                                     disabled
                                 }: {
    wordLength: number;
    onLengthChange: (length: number) => void;
    disabled: boolean;
}) => (
    <div className="word-length-selector">
        <label htmlFor="wordLength">Select Word Length: </label>
        <div className="select-wrapper">
            <select
                id="wordLength"
                value={wordLength}
                onChange={(e) => onLengthChange(Number(e.target.value))}
                disabled={disabled}
            >
                {Array.from({ length: MAX_WORD_LENGTH - MIN_WORD_LENGTH + 1 }, (_, i) => (
                    <option key={i + MIN_WORD_LENGTH} value={i + MIN_WORD_LENGTH}>
                        {i + MIN_WORD_LENGTH} Letters
                    </option>
                ))}
            </select>
        </div>
    </div>
));

const App = () => {
    const [wordLength, setWordLength] = useState<number>(5);
    const [targetWord, setTargetWord] = useState<string>('');
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [error, setError] = useState<string>('');

    const fetchWord = useCallback(async (length: number) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await getRandomWord(length);
            setTargetWord(response.data.content.toLowerCase());
        } catch (error) {
            setError('Failed to fetch word. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWord(wordLength);
    }, [wordLength, fetchWord]);

    const resetGame = useCallback(() => {
        setGuesses([]);
        setCurrentGuess('');
        setGameOver(false);
        setGameStatus('playing');
        setError('');
        fetchWord(wordLength);
    }, [wordLength, fetchWord]);

    const handleWordLengthChange = useCallback((length: number) => {
        setWordLength(length);
        resetGame();
    }, [resetGame]);

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (gameOver || isLoading) return;

        if (event.key === 'Enter') {
            if (currentGuess.length === wordLength) {
                const newGuesses = [...guesses, currentGuess];
                setGuesses(newGuesses);

                if (currentGuess === targetWord) {
                    setGameOver(true);
                    setGameStatus('won');
                } else if (newGuesses.length >= TOTAL_ATTEMPTS) {
                    setGameOver(true);
                    setGameStatus('lost');
                }
                setCurrentGuess('');
            }
        } else if (event.key === 'Backspace') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (
            /^[a-zA-Z]$/.test(event.key) &&
            currentGuess.length < wordLength
        ) {
            setCurrentGuess(prev => prev + event.key.toLowerCase());
        }
    }, [currentGuess, gameOver, guesses, targetWord, wordLength, isLoading]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    const getTileColor = useCallback((letter: string, index: number): string => {
        if (letter === targetWord[index]) return 'green';
        if (targetWord.includes(letter)) return 'yellow';
        return 'grey';
    }, [targetWord]);

    if (error) {
        return (
            <div className="error">
                {error}
                <button onClick={resetGame}>Try Again</button>
            </div>
        );
    }

    const showRemainingAttempts = gameStatus !== 'won' && !gameOver;

    return (
        <div className="app-container">
            <div className="game-header">
                <h1 className="title">Wordle Game</h1>
                <div className="header-content">
                    <WordLengthSelector
                        wordLength={wordLength}
                        onLengthChange={handleWordLengthChange}
                        disabled={!gameOver && guesses.length > 0}
                    />

                    {showRemainingAttempts && (
                        <div className="attempts-counter">
                            <span className="attempts-label">Attempts Remaining:</span>
                            <span className="attempts-number">{TOTAL_ATTEMPTS - guesses.length}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="game-container">
                <div className="game-board">
                    {/* Previous Guesses */}
                    {guesses.map((guess, i) => (
                        <div key={i} className="row">
                            {guess.split('').map((letter, j) => (
                                <Tile
                                    key={j}
                                    letter={letter}
                                    status={getTileColor(letter, j)}
                                />
                            ))}
                        </div>
                    ))}

                    {/* Current Guess */}
                    {!gameOver && (
                        <div className="row current">
                            {Array.from({ length: wordLength }).map((_, i) => (
                                <Tile
                                    key={i}
                                    letter={currentGuess[i] || ''}
                                    status="user-input"
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty Rows */}
                    {!gameOver && gameStatus !== 'won' &&
                        Array.from({ length: TOTAL_ATTEMPTS - guesses.length - 1 }).map((_, i) => (
                            <div key={i} className="row future">
                                {Array.from({ length: wordLength }).map((_, j) => (
                                    <Tile
                                        key={j}
                                        letter=""
                                        status=""
                                    />
                                ))}
                            </div>
                        ))
                    }
                </div>

                {gameOver && (
                    <div className={`game-status ${gameStatus}`}>
                        <div className="status-message">
                            {gameStatus === 'won'
                                ? `Congratulations! You won in ${guesses.length} ${guesses.length === 1 ? 'attempt' : 'attempts'}!`
                                : `Game Over! The word was ${targetWord}`}
                        </div>
                        <button onClick={resetGame} className="reset-button pulse">
                            Play Again
                        </button>
                    </div>
                )}

                {!gameOver && (
                    <button onClick={resetGame} className="reset-button">
                        Restart Game
                    </button>
                )}
            </div>
        </div>
    );
};

export default App;
