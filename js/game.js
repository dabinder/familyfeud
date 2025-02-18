const shuffleQuestions = false;
const minAnswers = 8;
const lastQuestionBonus = 2;

var team1 = window.opener.document.getElementById("team1NAME").value;
var team2 = window.opener.document.getElementById("team2NAME").value;

var lastQuestion = false;

var app = {
	version: 1,
	currentQ: 0,
	board: $("<div>" +
		"<!--- Scores --->" +
		"<div class='score' id='boardScore'>0</div>" +
		"<div class='score' id='team1' >0</div>" +
		"<div class='score' id='team2' >0</div>" +

		"<!--- Question --->" +
		"<div id='questionBar' class='questionHolder'>" +
		"<span class='question'></span>" +
		"</div>" +

		"<!--- Answers --->" +
		"<div id='answerBar' class='colHolder'>" +
		"<div class='col1'></div>" +
		"<div class='col2'></div>" +
		"</div>" +

		"<!--- Buttons --->" +
		"<div id='buttonBar' class='btnHolder'>" +
		"<div id='misses'>" +
		"<div id='missDisplay_3' class='miss'></div>" +
		"<div id='missDisplay_2' class='miss'></div>" +
		"<div id='missDisplay_1' class='miss'></div>" +
		"</div>" +
		"<div id='awardTeam1' data-team='1' class='button'>" + team1 + "</div>" +
		"<div id='awardTeam2' data-team='2' class='button'>" + team2 + "</div>" +
		"</div>" +
		"</div>"
	),


	// Utility functions
	shuffle: function (array) {
		var currentIndex = array.length,
			temporaryValue, randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	},

	jsonLoaded: function (data) {
		//console.clear()
		app.allData = data
		app.questions = Object.keys(data)

		if (shuffleQuestions == true) {
			app.shuffle(app.questions);
		}
		$('#gameBoardId').append(app.board)
	},

	// Action functions
	makeQuestion: function (qIndex) {
		var col1 = app.board.find(".col1");
		var col2 = app.board.find(".col2");
		col1.empty();
		col2.empty();

		if (qIndex == -1) { //draw empty board
			for (var i = 0; i < minAnswers; i++) {
				let aLI = $("<div class='cardHolder empty'><div></div></div>");
				let parentDiv = (i < (minAnswers / 2)) ? col1 : col2;
				$(aLI).appendTo(parentDiv)
			}

			return;
		}

		var qText = app.questions[qIndex]
		var qAnswr = app.allData[qText]

		var qNum = qAnswr.length
		qNum = (qNum < minAnswers) ? minAnswers : qNum;
		qNum = (qNum % 2 != 0) ? qNum + 1 : qNum;

		var boardScore = app.board.find("#boardScore")
		var question = app.board.find(".question")

		boardScore.html(0)
		question.html(qText.replace(/&x22;/gi, '"'))

		for (var i = 0; i < qNum; i++) {
			var aLI
			if (qAnswr[i]) {
				aLI = $("<div class='cardHolder' data-card-got='false' id='answer_" + i + "' data-answer='" + i + "'>" +
					"<div class='card'>" +
					"<div class='front'>" +
					"<span class='DBG'>" + (i + 1) + "</span>" +
					"</div>" +
					"<div class='back DBG'>" +
					"<span>" + qAnswr[i][0] + "</span>" +
					"<b class='LBG'>" + qAnswr[i][1] + "</b>" +
					"</div>" +
					"</div>" +
					"</div>")
			} else {
				aLI = $("<div class='cardHolder empty'><div></div></div>")
			}
			var parentDiv = (i < (qNum / 2)) ? col1 : col2;
			$(aLI).appendTo(parentDiv)
		}

		var cardHolders = app.board.find('.cardHolder')
		var cards = app.board.find('.card')
		var backs = app.board.find('.back')
		var cardSides = app.board.find('.card>div')

		TweenLite.set(cardHolders, {
			perspective: 800
		});
		TweenLite.set(cards, {
			transformStyle: "preserve-3d"
		});
		TweenLite.set(backs, {
			rotationX: 180
		});
		TweenLite.set(cardSides, {
			backfaceVisibility: "hidden"
		});

		cards.data("flipped", false)
		cards.data("gotPoint", false)

		window.opener.GetQuestion(qText);
		window.opener.GetAnswers(qAnswr, app.currentQ, app.questions.length);
	},

	showCard: function (cardNum, callback) {
		var card = $(`#answer_${cardNum} > div.card`);
		var flipped = $(card).data("flipped")
		var cardRotate = (flipped) ? 0 : -180;
		TweenLite.to(card, 1, {
			rotationX: cardRotate,
			ease: Back.easeOut
		});
		flipped = !flipped;
		$(card).data("flipped", flipped);

		app.getBoardScore(callback)
	},

	getBoardScore: function (callback) {

		//var gotPointsBefore = document.getElementById(card).getAttribute("data-card-got");

		var cards = app.board.find('.card')
		var boardScore = app.board.find('#boardScore')
		var currentScore = {
			var: boardScore.html()
		}
		var score = 0

		function tallyScore() {
			if ($(this).data("flipped")) {
				var value = parseInt($(this).find("b").html());
				if (lastQuestion) value *= lastQuestionBonus;
				score += value;
			}
		}
		$.each(cards, tallyScore)
		TweenMax.to(currentScore, 1, {
			var: score,
			onUpdate: function () {
				boardScore.html(Math.round(currentScore.var));
			},
			onComplete: function () {
				if (typeof (callback) == "function") callback();
			},
			ease: Power3.easeOut,
		});

		//document.getElementById(card).setAttribute("data-card-got", "true"); 

	},

	awardPoints: function (num) {
		var num = $(this).attr("data-team")
		var boardScore = app.board.find('#boardScore')
		var currentScore = {
			var: parseInt(boardScore.html())
		}
		var team = app.board.find("#team" + num)

		var teamScore = {
			var: parseInt(team.html())
		}
		var teamScoreUpdated = (teamScore.var+currentScore.var)


		TweenMax.to(teamScore, 1, {
			var: teamScoreUpdated,
			onUpdate: function () {
				team.html(Math.round(teamScore.var));
				window.opener.document.getElementById("team1POINT").innerHTML = document.getElementById("team1").innerHTML;
				window.opener.document.getElementById("team2POINT").innerHTML = document.getElementById("team2").innerHTML;
			},
			ease: Power3.easeOut,
		});
	},

	changeQuestion: function (callback) {
		app.makeQuestion(app.currentQ++);
		if (app.currentQ == app.questions.length) {
			lastQuestion = true;
			callback();
		}
	},

	// Inital function
	init: function (round) {
		app.jsonFile = `questions/round${round}.json`,
		$.getJSON(app.jsonFile, app.jsonLoaded)
		app.board.find('#awardTeam1').on('click', app.awardPoints)
		app.board.find('#awardTeam2').on('click', app.awardPoints)
		window.opener.game_window_init_done();
		lastQuestion = false;
	}
}

function teamPointChange() {
	document.getElementById("team1").innerHTML = window.opener.document.getElementById("team1POINT").innerHTML;
	document.getElementById("team2").innerHTML = window.opener.document.getElementById("team2POINT").innerHTML;
}

function teamNameChange() {
	team1 = window.opener.document.getElementById("team1NAME").value;
	team2 = window.opener.document.getElementById("team2NAME").value;

	document.getElementById("awardTeam1").innerHTML = team1;
	document.getElementById("awardTeam2").innerHTML = team2;
}

function winner(tieBreaker) {
	let winner;
	let team1Score = parseInt(document.getElementById("team1").textContent);
	let team2Score = parseInt(document.getElementById("team2").textContent);

	if (team1Score > team2Score) {
		winner = team1;
	} else if (team1Score < team2Score) {
		winner = team2;
	} else {
		winner = tieBreaker === 1 ? team1 : team2;
	}
	return `${winner} wins!`;
}

//oyun kapatıldı.
window.onbeforeunload = function (e) {
	// notify control window
	window.opener.gameClosed();
};

//http://www.qwizx.com/gssfx/usa/ff.htm