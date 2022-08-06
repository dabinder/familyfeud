const gameStartTimerInSeconds = 1;
const maxMiss = 3;

var game = null;
var whichTeamTurn = -1;
var missPointTeam1 = 0;
var missPointTeam2 = 0;
var steal = false;
var pointsAwarded = false;

var totalAnswers = 0;
var successfulAnswers = 0;

	function start_game(){	
		document.getElementById("buttonStart").disabled = true;
		nextQuestion();
		turnOfTeam(1);
	}
	
	function finish_game(){
		// game.document.getElementById("idcLogo").style.width = '50%';
		game.document.getElementById("welcomePageInfo").innerHTML = "Thank you!";
		game.document.getElementById("welcomePageInfo").style.display = "";
	}
	
	function open_game_window() {
		play_sound('ff_dogru.mp3');
		game = window.open('game.html', 'game', 'resizable=yes');
		game.addEventListener("DOMContentLoaded", function() {
			game.app.init();
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
		// document.getElementById("buttonAwardT1").disabled = false;
		document.getElementById("buttonAwardT2").disabled = false;
		// document.getElementById("buttonAwardT3").disabled = false;
	}
	
	function game_window_closed() {
		game = null;
	}
	
	// play sound object
	var audio = new Audio('');

	function play_sound(sound) {
		audio.pause();
		audio = new Audio('sfx/'+sound);
		audio.play();
	}
	
	function pause_sound() {
		audio.pause();
		audio = new Audio('');
		//audio.play();
	}
	
	function deleteMissPoint(){
		missPointTeam1 = 0;
		missPointTeam2 = 0;
		document.getElementById("misspoint1").innerHTML = missPointTeam1;
		document.getElementById("misspoint2").innerHTML = missPointTeam2;
		game.document.getElementById("missDisplay_1").classList.remove("active");
		game.document.getElementById("missDisplay_2").classList.remove("active");
		game.document.getElementById("missDisplay_3").classList.remove("active");
	}
	
	function showMissPoint(team){
		if (team == 1){
			if (missPointTeam1 < maxMiss) missPointTeam1++;
			document.getElementById("misspoint1").innerHTML = missPointTeam1;
		}
		else if (team == 2) {
			if (missPointTeam2 < maxMiss) missPointTeam2++;
			document.getElementById("misspoint2").innerHTML = missPointTeam2;
		}	
		
		var counter = team === 1 ? missPointTeam1 : missPointTeam2;
		game.document.getElementById("misses").className = "active";
		for (i = 1; i <= counter; i++) { 
			game.document.getElementById(`missDisplay_${i}`).classList.add("active");
		}
		setTimeout(() => {
			game.document.getElementById("misses").className = "";
			if (steal) {
				calculatePoints(whichTeamTurn == 1 ? 2 : 1);
			} else if (counter == maxMiss) {
				changeTurn();
				steal = true;
			}
		}, 1000);
		play_sound('ff-strike.wav');
	}
	
	function nextQuestion(){
		var table = document.getElementById("tableAnswers");
		for(var i = table.rows.length - 1; i > 0; i--)
		{
			table.deleteRow(i);
		}
		deleteMissPoint();
		game.app.changeQuestion();
		steal = false;
		successfulAnswers = 0;
		pointsAwarded = false;
	}
	
	function calculatePoints(team){
		if (pointsAwarded) return;
		
		if (team == 1){
			game.document.getElementById("awardTeam1").click();
		}
		else if (team == 2){
			game.document.getElementById("awardTeam2").click();
		}
		
		play_sound('ff_dogru.mp3');
		pointsAwarded = true;
	}
	
	function GetQuestion(questionParam){
		document.getElementById("question").innerHTML = questionParam;
	}
	
	function GetAnswers(answers, currentQnumber, totalQnumber){
		var table = document.getElementById("tableAnswers");
		totalAnswers = answers.length;
		
		for (let i = 0; i < answers.length; i++) { 
			var row = table.insertRow(i+1);
			var cell1 = row.insertCell(0)
			var cell2 = row.insertCell(1)
			var cell3 = row.insertCell(2)
			
			var tempID = "answer_" + i;
			
			row.setAttribute("id", tempID, 0);
			row.addEventListener("click", function () {
				if (whichTeamTurn === -1) return;
				game.document.getElementById(this.id).click();
				var tempBgColor = this.style.backgroundColor;
				if(tempBgColor == ""){
					this.setAttribute("style", "background-color: lightgreen;");
					play_sound('ff-clang.wav');
					successfulAnswers++;
					if (successfulAnswers == totalAnswers || steal) {
						calculatePoints(whichTeamTurn);
					}
				}
				else if(tempBgColor == "lightgreen"){
					this.setAttribute("style", "background-color: ;");
					successfulAnswers--;
				}
			}, false);
			cell1.innerHTML = i + 1;
			cell2.innerHTML = answers[i][0];
			cell3.innerHTML = answers[i][1];
			
			document.getElementById("tableAnswers").style.display = "";
			document.getElementById("answerInfo").style.display = "none";
			
			// document.getElementById("totalQ").innerHTML = totalQnumber;
			document.getElementById("currentQ").innerHTML = currentQnumber;
		}
	}
	
	function turnOfTeam(team){
		whichTeamTurn = team;
		if (team == 1){
			game.document.getElementById("team1").classList.add("active");
			game.document.getElementById("awardTeam1").classList.add("active");
			game.document.getElementById("team2").classList.remove("active");
			game.document.getElementById("awardTeam2").classList.remove("active");

			document.getElementById("buttonMistakeT1").disabled = false;

			document.getElementById("buttonMistakeT2").disabled = true;
		}
		else if (team == 2){
			game.document.getElementById("team2").classList.add("active");
			game.document.getElementById("awardTeam2").classList.add("active");
			game.document.getElementById("team1").classList.remove("active");
			game.document.getElementById("awardTeam1").classList.remove("active");

			document.getElementById("buttonMistakeT2").disabled = false;
			
			document.getElementById("buttonMistakeT1").disabled = true;

		}
	}
	
	function gameClosed(){
		//sıfırlayacaksın abi herşeyi!!!
		game = null;
		document.getElementById("question").innerHTML = "The game has been finished.";
		document.getElementById("question").className = "label label-danger";
		missPointTeam1 = 0;
			document.getElementById("misspoint1").innerHTML = missPointTeam1;
		missPointTeam1 = 0;
			document.getElementById("misspoint2").innerHTML = missPointTeam1;
			
		document.getElementById("buttonClose").disabled = true;
		document.getElementById("buttonMistakeT1").disabled = true;
		document.getElementById("buttonMistakeT2").disabled = true;
		// document.getElementById("buttonAwardT1").disabled = true;
		document.getElementById("buttonAwardT2").disabled = true;
		// document.getElementById("buttonAwardT3").disabled = true;
		document.getElementById("buttonStart").disabled = true;
		document.getElementById("buttonOpen").disabled = false;
		document.getElementById("tableAnswers").style.display = "none";
		document.getElementById("answerInfo").style.display = "";

		var table = document.getElementById("tableAnswers");
		for(var i = table.rows.length - 1; i > 0; i--)
		{
			table.deleteRow(i);
		}
	}
	
	function gameCompleted(){
		document.getElementById("buttonWinner").disabled = false;
			game.document.getElementById("gameBoardId").style.display = "none";
			// game.document.getElementById("idcLogo").style.width = '50%';
		
		var table = document.getElementById("tableAnswers");
		for(var i = table.rows.length - 1; i > 0; i--){
			table.deleteRow(i);
		}
		announceWinner();
	}
	
	function announceWinner(){
		game.document.getElementById("winnerId").innerHTML = game.winner();
		game.document.getElementById('winnerId').style.display = "block";
	}
	
	function changeTeamNames(){
		game.teamNameChange();
	}
	
	function changeTeamPoint(){
		game.teamPointChange();
		document.getElementById("team1POINT").innerHTML = game.document.getElementById("team1").value;
		document.getElementById("team2POINT").innerHTML = game.document.getElementById("team2").value;
	}
	
	function changeTurn(){
		if(whichTeamTurn == 1){
			turnOfTeam(2);
		}
		else if (whichTeamTurn == 2){
			turnOfTeam(1);
		}
	}