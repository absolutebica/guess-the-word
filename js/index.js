const playBtn = document.querySelector(".start-game");
const newUser = document.querySelector(".new-user-name");
const userContainer = document.querySelector(".new-user.container");

playBtn.addEventListener("click", startGame);

function startGame() {
	const userName = newUser.value ?? "";
	if (userName) {
		const gameContainer = document.querySelector("#gameAreaContainer");
		const newGame = new WordGame(gameContainer, userName);
		newGame.render();
		userContainer.classList.add("hide");
		document.querySelector("#gameAreaContainer")?.classList.remove("hide");
	}
}