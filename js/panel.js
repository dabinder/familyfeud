const gameStartTimerInSeconds = 1;
const maxMiss = 3;

var game = null;
var currentTeam = -1;
var missPointTeam1 = 0;
var missPointTeam2 = 0;
var steal = false;
var pointsAwarded = false;
var faceOff = true;
var faceOffMiss = false;
var faceOffAnswered = false;
var lastQuestion = false;

var currentRound = -1;
var totalAnswers = 0;
var successfulAnswers = 0;

document.addEventListener("DOMContentLoaded", function() {
	var roundSelect = document.getElementById("roundSelect");
	roundSelect.addEventListener("change", function(evt) {
		currentRound = parseInt(this.value);
	}, false);
	roundSelect.dispatchEvent(new Event("change"));
}, false);

function start_game() {
	document.getElementById("buttonStart").disabled = true;
	document.getElementById("buttonNextQuestion").disabled = true;
	nextQuestion();
	document.getElementById("buttonMiss").disabled = false;
	document.getElementById("tableAnswers").classList.add("ready");
	currentTeam = -1;
	faceOff = true;
	faceOffMiss = false;
	faceOffAnswered = false;
	lastQuestion = false;
}

function open_game_window() {
	// play_sound('ff_dogru.mp3');
	game = window.open('game.html', 'game', 'resizable=yes');
	game.addEventListener("DOMContentLoaded", function () {
		game.app.init(currentRound);
	}, false);
	document.getElementById("buttonStart").disabled = false;
	document.getElementById("buttonOpen").disabled = true;
	document.getElementById("buttonClose").disabled = false;
}

function close_game_window() {
	game.close();
}

function game_window_init_done() {
	document.getElementById("question").className = "label label-success";
	game.app.makeQuestion(-1);
}

function game_window_closed() {
	game = null;
	document.getElementById("team1POINT").textContent = 0;
	document.getElementById("team2POINT").textContent = 0;
	document.getElementById("currentTeam").textContent = "";
	document.getElementById("misspoint1").textContent = "";
	document.getElementById("misspoint2").textContent = "";
	document.getElementById("team1Label").classList.remove("active");
	document.getElementById("team2Label").classList.remove("active");
}

// play sound object
var audio = new Audio('');

function play_sound(sound) {
	audio.pause();
	audio = new Audio('sfx/' + sound);
	audio.play();
}

function pause_sound() {
	audio.pause();
	audio = new Audio('');
	//audio.play();
}

function deleteMissPoint() {
	missPointTeam1 = 0;
	missPointTeam2 = 0;
	document.getElementById("misspoint1").innerHTML = missPointTeam1;
	document.getElementById("misspoint2").innerHTML = missPointTeam2;
	game.document.getElementById("missDisplay_1").classList.remove("active");
	game.document.getElementById("missDisplay_2").classList.remove("active");
	game.document.getElementById("missDisplay_3").classList.remove("active");
}

function showMissPoint(team) {
	if (team == 1) {
		if (missPointTeam1 < maxMiss) missPointTeam1++;
		document.getElementById("misspoint1").innerHTML = missPointTeam1;
	} else if (team == 2) {
		if (missPointTeam2 < maxMiss) missPointTeam2++;
		document.getElementById("misspoint2").innerHTML = missPointTeam2;
	} else {
		throw `Unexpected team value: ${team}`;
	}

	var counter = team === 1 ? missPointTeam1 : missPointTeam2;
	game.document.getElementById("misses").className = "active";
	for (i = 1; i <= counter; i++) {
		game.document.getElementById(`missDisplay_${i}`).classList.add("active");
	}
	setTimeout(() => {
		game.document.getElementById("misses").className = "";
		if (steal) {
			calculatePoints(currentTeam == 1 ? 2 : 1);
		} else if (counter == maxMiss) {
			changeTurn();
			steal = true;
		}
	}, 1000);
	play_sound('ff-strike.wav');
}

function nextQuestion() {
	var table = document.getElementById("tableAnswers");
	for (var i = table.rows.length - 1; i > 0; i--) {
		table.deleteRow(i);
	}
	deleteMissPoint();
	document.getElementById("buttonNextQuestion").disabled = true;
	game.app.changeQuestion(() => lastQuestion = true);
	if (!steal) {
		changeTurn();
	}
	steal = false;
	successfulAnswers = 0;
	pointsAwarded = false;
	faceOff = false;
	if (currentTeam < 1) {
		document.getElementById("tableAnswers").classList.remove("ready");
	} else {
		document.getElementById("buttonMiss").disabled = false;
	}
}

function calculatePoints(team) {
	if (pointsAwarded) return;

	if (team == 1) {
		game.document.getElementById("awardTeam1").click();
	} else if (team == 2) {
		game.document.getElementById("awardTeam2").click();
	}

	// play_sound('ff_dogru.mp3');
	pointsAwarded = true;
	document.getElementById("buttonNextQuestion").disabled = lastQuestion;
	document.getElementById("buttonMiss").disabled = true;
}

function GetQuestion(questionParam) {
	document.getElementById("question").innerHTML = questionParam;
}

function GetAnswers(answers, currentQnumber, totalQnumber) {
	var table = document.getElementById("tableAnswers");
	totalAnswers = answers.length;

	for (let i = 0; i < answers.length; i++) {
		var row = table.insertRow(i + 1);
		var cell1 = row.insertCell(0)
		var cell2 = row.insertCell(1)
		var cell3 = row.insertCell(2)

		var tempID = "answer_" + i;

		row.setAttribute("id", tempID, 0);
		row.dataset.answer = i;
		row.addEventListener("click", function () {
			if (!faceOff && (currentTeam === -1 || pointsAwarded)) return;
			var flipped = this.dataset.flipped == "true";
			if (!flipped) {
				this.dataset.flipped = true;
				play_sound('ff-clang.wav');
				successfulAnswers++;
			} else {
				this.dataset.flipped = false;
				successfulAnswers--;
			}
			let rank = this.dataset.answer;
			game.app.showCard(rank, function () {
				if (faceOff) {
					if (parseInt(rank) === 0 || faceOffMiss) {
						// play_sound('ff_dogru.mp3');
						document.getElementById("buttonNextQuestion").disabled = false;
						document.getElementById("buttonMiss").disabled = true;
					} else {
						faceOffAnswered = true;
					}
				} else if (successfulAnswers == totalAnswers || steal) {
					calculatePoints(currentTeam);
				}
			});
		}, false);
		cell1.innerHTML = i + 1;
		cell2.innerHTML = answers[i][0];
		cell3.innerHTML = answers[i][1];

		document.getElementById("tableAnswers").style.display = "";
		document.getElementById("answerInfo").style.display = "none";

		document.getElementById("currentQ").innerHTML = currentQnumber;
	}
}

function turnOfTeam(team) {
	currentTeam = team;
	if (team == 1) {
		game.document.getElementById("team1").classList.add("active");
		game.document.getElementById("awardTeam1").classList.add("active");
		game.document.getElementById("team2").classList.remove("active");
		game.document.getElementById("awardTeam2").classList.remove("active");

		document.getElementById("team1Label").classList.add("active");
		document.getElementById("team2Label").classList.remove("active");
	} else if (team == 2) {
		game.document.getElementById("team2").classList.add("active");
		game.document.getElementById("awardTeam2").classList.add("active");
		game.document.getElementById("team1").classList.remove("active");
		game.document.getElementById("awardTeam1").classList.remove("active");

		document.getElementById("team1Label").classList.remove("active");
		document.getElementById("team2Label").classList.add("active");
	}
	document.getElementById("tableAnswers").classList.add("ready");
	document.getElementById("currentTeam").textContent = team;
	document.getElementById("buttonMiss").disabled = false;
}

function gameClosed() {
	game = null;
	document.getElementById("question").innerHTML = "The game has ended";
	document.getElementById("question").className = "label label-danger";
	missPointTeam1 = 0;
	document.getElementById("misspoint1").innerHTML = missPointTeam1;
	missPointTeam1 = 0;
	document.getElementById("misspoint2").innerHTML = missPointTeam1;

	document.getElementById("buttonClose").disabled = true;
	document.getElementById("buttonMiss").disabled = true;
	document.getElementById("buttonNextQuestion").disabled = true;
	document.getElementById("buttonStart").disabled = true;
	document.getElementById("buttonOpen").disabled = false;
	document.getElementById("tableAnswers").style.display = "none";
	document.getElementById("answerInfo").style.display = "";

	var table = document.getElementById("tableAnswers");
	for (var i = table.rows.length - 1; i > 0; i--) {
		table.deleteRow(i);
	}
}

function gameCompleted() {
	document.getElementById("buttonFinish").disabled = true;

	game.document.getElementById("winnerId").innerHTML = game.winner();
	game.document.getElementById("winnercontainer").classList.add("active");
}

function changeTeamNames() {
	game.teamNameChange();
}

function changeTeamPoint() {
	game.teamPointChange();
	document.getElementById("team1POINT").textContent = game.document.getElementById("team1").value;
	document.getElementById("team2POINT").textContent = game.document.getElementById("team2").value;
}

function changeTurn() {
	if (currentTeam == 1) {
		turnOfTeam(2);
	} else if (currentTeam == 2) {
		turnOfTeam(1);
	}
}

function miss() {
	if (faceOff) {
		game.document.getElementById("misses").className = "active";
		game.document.getElementById("missDisplay_1").classList.add("active");
		play_sound('ff-strike.wav');
		faceOffMiss = true;
		setTimeout(() => {
			game.document.getElementById("misses").classList.remove("active");
			if (faceOffAnswered) {
				// play_sound('ff_dogru.mp3');
				document.getElementById("buttonNextQuestion").disabled = false;
				document.getElementById("buttonMiss").disabled = true;
			}
		}, 1000);
	} else {
		if (currentTeam == 1) {
			if (missPointTeam1 < maxMiss) missPointTeam1++;
			document.getElementById("misspoint1").innerHTML = missPointTeam1;
		} else if (currentTeam == 2) {
			if (missPointTeam2 < maxMiss) missPointTeam2++;
			document.getElementById("misspoint2").innerHTML = missPointTeam2;
		} else {
			return;
		}

		var counter = currentTeam === 1 ? missPointTeam1 : missPointTeam2;
		game.document.getElementById("misses").className = "active";
		for (i = 1; i <= counter; i++) {
			game.document.getElementById(`missDisplay_${i}`).classList.add("active");
		}
		setTimeout(() => {
			game.document.getElementById("misses").className = "";
			if (steal) {
				calculatePoints(currentTeam == 1 ? 2 : 1);
			} else if (counter == maxMiss) {
				changeTurn();
				steal = true;
			}
		}, 1000);
		play_sound('ff-strike.wav');
	}
}