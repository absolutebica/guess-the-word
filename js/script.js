
const MESSAGE_CLASS = document.querySelector(".message");
const WIP_CLASS = document.querySelector(".word-in-progress");
const GUESSES_REMAINING_CLASS = document.querySelector(".remaining");
const GUESSED_LETTERS_CLASS = document.querySelector(".guessed-letters");
const GUESS_BTN = document.querySelector("button.guess");
const GUESS_INPUT_CLASS = document.querySelector("input.letter");
const ALREADY_GUESSED_CLASS = document.querySelector(".already-guessed");
const PLAY_AGAIN_BTN = document.querySelector("button.play-again");
const FORM_CONTAINER_CLASS = document.querySelector(".form-container");

const WordAPI = 'https://random-word-api.herokuapp.com/word';
const SUCCESS_MESSAGE = "I can't believe you won. Great job Einstein!";
const FAIL_MESSAGE = "Sorry! No soup for you!"
const SELECTED_WORD = '';

const GUESSES_LIMIT = 6;

class GuessTheWordGame {
	constructor(name) {
		this.name = name;
		this.selectedWord = SELECTED_WORD;
		this.guessesLimit = GUESSES_LIMIT;
		this.wrongGuesses = [];
		this.correctGuesses = [];
		this.selectedWordLetters = [];
	}

	render() {
		MESSAGE_CLASS.innerHTML = `${this.name}, welcome to Guess the Word`;
		this.events();
		this.newGame();
	}

	events() {
		GUESS_BTN.addEventListener("click", event => this.onGuessButtonClick(event));
		PLAY_AGAIN_BTN.addEventListener("click", event => this.startOver(event));
		GUESS_INPUT_CLASS.addEventListener("keypress", event => this.onGuessInput(event));
		document.addEventListener("keydown", event => this.onEnterKey(event));
	}

	// Event Callbacks
	onGuessButtonClick() {
		this.checkInputGuess();
	}

	startOver() {
		this.resetGame();
		PLAY_AGAIN_BTN.classList.add("hide");
		GUESS_BTN.classList.remove("hide");
		FORM_CONTAINER_CLASS.classList.remove("hide");
		GUESSED_LETTERS_CLASS.innerHTML = '';
		this.render();
	}

	onGuessInput(event) {
		const isValid = /^[a-zA-Z]+$/.test(event.key);

		if (!isValid) {
			event.preventDefault();
			return false;
		}
	}

	onEnterKey(event) {
		const isEnterKey = event.key === "Enter";
		const isGuessInputValid = !!GUESS_INPUT_CLASS.value;
		if (isEnterKey && isGuessInputValid) {
			this.checkInputGuess();
		}
	}

	// End Event callbacks

	checkInputGuess() {
		const letter = GUESS_INPUT_CLASS.value;
		if (letter?.length && this.guessesLimit) {
			this.testLetterInWord(letter);
			GUESS_INPUT_CLASS.value = "";
			this.setInputFocus();
		}
	}

	testLetterInWord(letter) {
		const regexp = new RegExp(letter, "g");
		const letterMatchesCount = (this.selectedWord.match(regexp) || []).length;
		const correctGuessesCount = this.correctGuesses.filter(guess => guess.toLowerCase() === letter.toLowerCase()).length;
		const hasWrongMatch = !!this.wrongGuesses.filter(guess => guess.toLowerCase() === letter.toLowerCase()).length;

		if (hasWrongMatch || (letterMatchesCount && correctGuessesCount >= letterMatchesCount)) {
			ALREADY_GUESSED_CLASS.classList.remove("hide");
		} else {
			if (letterMatchesCount) {
				this.correctGuesses.push(letter);
				this.updateCorrectLetters();
				this.didYouWin();
			} else {
				this.guessesLimit--;
				this.wrongGuesses.push(letter);
				this.updateIncorrectLetters();
				this.updateRemainingGuessesMessage();
			}

			ALREADY_GUESSED_CLASS.classList.add("hide");
		}
	}

	updateCorrectLetters() {
		this.correctGuesses.forEach(letter => {
			const findLetter = this.selectedWordLetters.find(wordLetter => {
				console.log("looped");
				return wordLetter.letter.toLowerCase() === letter.toLowerCase()
				&& !wordLetter.used;
			});

			const letterPosition = findLetter?.index ?? -1;
			const letterElements = WIP_CLASS.children;
			if (letterPosition > -1 && findLetter) {
				letterElements[letterPosition].innerHTML = letter;
				letterElements[letterPosition].classList.remove("invalid-guess");
				findLetter.used = true;
			}
		})
	}

	updateIncorrectLetters() {
		GUESSED_LETTERS_CLASS.innerHTML = '';
		this.wrongGuesses.forEach(letter => {
			const incorrectLetterElement = document.createElement('span');
			incorrectLetterElement.classList.add("incorrect-letter");
			incorrectLetterElement.textContent = letter;
			GUESSED_LETTERS_CLASS.append(incorrectLetterElement);
		});

		GUESSED_LETTERS_CLASS.classList.remove("hide");
	}

	setupWord() {
		this.fetchRandomWord().then((word) => {
			this.selectedWord = word;
			this.setInitialRemainingGuesses();
			this.buildWordMask();
			this.updateRemainingGuessesMessage();
			console.log(`Shhhh the word is ${word}`);
		});
	}

	buildWordMask() {
		const splitLetters = this.selectedWord.split('');
		let HTML = '';
		splitLetters.forEach((letter, index) => {
			this.selectedWordLetters.push(
				{
					letter: letter,
					index: index,
					used: false
				}
			);
			
			HTML += `<span class="letter invalid-guess">
			<span class="letter-char">&bull;</span>
			</span>`;
		});
		
		WIP_CLASS.innerHTML = HTML;
	}

	setInitialRemainingGuesses() {
		this.guessesLimit = this.selectedWord.length + 2;
		this.updateRemainingGuessesMessage();
	}

	updateRemainingGuessesMessage() {
		const guessMessage = this.guessesLimit ? `You have <span class="danger">${this.guessesLimit} incorrect guesses</span> remaining.` : FAIL_MESSAGE;
		GUESSES_REMAINING_CLASS.innerHTML = guessMessage;
		GUESSES_REMAINING_CLASS.classList.remove("hide");
		this.updateButtonStates();
	}

	updateButtonStates() {
		if (!this.guessesLimit) {
			PLAY_AGAIN_BTN.classList.remove("hide");
			GUESS_BTN.classList.add("hide");
			FORM_CONTAINER_CLASS.classList.add("hide");
		}

		GUESS_INPUT_CLASS.disabled = !this.guessesLimit;
		GUESS_BTN.disabled = !this.guessesLimit;
	}

	fetchRandomWord() {
		return new Promise(resolve => {
			fetch(WordAPI)
				.then(response => response.json())
				.then(wordData => {
					resolve(wordData?.[0])
				});
		})
	}

	setInputFocus() {
		GUESS_INPUT_CLASS.focus();
	}

	didYouWin() {
		console.log(this.selectedWord.length, this.correctGuesses.length);
		const isWinner = this.selectedWord.length === this.correctGuesses.length;
		isWinner && this.gameWon();
	}

	gameWon() {
		PLAY_AGAIN_BTN.classList.remove("hide");
		GUESS_BTN.classList.add("hide");
		FORM_CONTAINER_CLASS.classList.add("hide");
		GUESSES_REMAINING_CLASS.classList.add("hide");
		GUESSED_LETTERS_CLASS.classList.add("hide");
		MESSAGE_CLASS.innerHTML = SUCCESS_MESSAGE;
	}

	newGame() {
		this.resetGame();
		this.setupWord();
		this.setInputFocus();
	}

	resetGame() {
		this.wrongGuesses = [];
		this.correctGuesses = [];
		this.guessesLimit = GUESSES_LIMIT;
		this.selectedWordLetters = [];
		this.selectedWord = SELECTED_WORD;
		this.selectedWordLetters = [];
	}
}

const newGame = new GuessTheWordGame("Bryan");
newGame.render();