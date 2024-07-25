// TicTacToe Game - front end

const button1 = document.getElementById("btn1");
const button2 = document.getElementById("btn2");
const button3 = document.getElementById("btn3");
const button4 = document.getElementById("btn4");
const button5 = document.getElementById("btn5");
const button6 = document.getElementById("btn6");
const button7 = document.getElementById("btn7");
const button8 = document.getElementById("btn8");
const button9 = document.getElementById("btn9");


const board = document.getElementById("btnContainer");
const playerNamesContainer = document.getElementById("playerNamesContainer");
const playerValue = document.getElementById("playerValue");
const oppValue = document.getElementById("oppValue");
const turnText = document.getElementById("turnText");
const searchText = document.getElementById("searchingText");

// Make board not visible
board.style.display = "none";
playerValue.style.display = "none";
playerNamesContainer.style.display = "none";
oppValue.style.display = "none";
turnText.style.display = "none";
searchText.style.display = "none";

button1.innerHTML = '\u2060';
button2.innerHTML = '\u2060';
button3.innerHTML = '\u2060';
button4.innerHTML = '\u2060';
button5.innerHTML = '\u2060';
button6.innerHTML = '\u2060';
button7.innerHTML = '\u2060';
button8.innerHTML = '\u2060';
button9.innerHTML = '\u2060';

// Attempts or makes a connection to the backend server
const socket = io();

// Name of the player connecting
let playerName;

// On FindGame button pressed
document.getElementById("inputNameBtn").addEventListener("click", function()
{
    playerName = document.getElementById("inputNameBox").value;

    if(playerName == null || playerName == "")
        alert("Enter a name");
    else
    {
        document.getElementById("user1Name").innerText = "You: " + playerName;

        searchText.style.display = "block";

        // Send data to backend
        socket.emit("findGame", {name:playerName});
    }

})

// Called when both players are connected to each other
socket.on("loadPlayersData", (e)=> {

    board.style.display = "block"; // Make board visible
    playerNamesContainer.style.display = "block";
    oppValue.style.display = "block";
    turnText.style.display = "block";
    searchText.style.display = "none";

    console.log("Found Opponent!");

    let allPlayersArray = e.allPlayers;

    let oppName;
    let value;

    console.log(allPlayersArray);

    // Finds player obj from allPlayersArray that matches up with 'this' players name
    const foundObj = allPlayersArray.find(obj => obj.p1.p1Name == `${playerName}` || obj.p2.p2Name == `${playerName}`);
    foundObj.p1.p1Name == `${playerName}` ? oppName = foundObj.p2.p2Name : oppName = foundObj.p1.p1Name;
    foundObj.p1.p1Name == `${playerName}` ? value = foundObj.p2.p2Value : value = foundObj.p1.p1Value;

    document.getElementById("user2Name").innerText = "Opponent: " + oppName;

    oppValue.innerText = "You're playing against " + value;
    console.log("oppName = " + oppName);
    
    if(value == "O") { // Opponent is O
        document.getElementById("playerValue").innerText = "X";
        document.getElementById("user1Name").innerText = "You: " + playerName + "(" + "X" + ")";
    }
    else {
        document.getElementById("playerValue").innerText = "O";
        document.getElementById("user1Name").innerText = "You: " + playerName + "(" + "O" + ")";
    }

    turnText.innerText = "X's Turn";
});


document.querySelectorAll(".buttons").forEach(e => {
    e.addEventListener("click", function() { // Adds Listener event to each button, that when pressed emit onClickButton Event
        let value = document.getElementById("playerValue").innerText
        e.innerText = value;

        // e.id is the id of the button ex: btn1
        socket.emit("onClickButton", {value:value, id:e.id, name:playerName});
    })
})

socket.on("updateBoard", (e)=>{

    // OnClick Button

    // The user selected clicked a button when it was not there turn
    if(e.valid == false) {
        console.log("Wrong Turn");
        document.getElementById(e.buttonId).innerText = '\u2060';
        return;
    }

    const foundObject = (e.allPlayers).find(obj => obj.p1.p1Name == `${playerName}` || obj.p2.p2Name == `${playerName}`);

    let p1id = foundObject.p1.p1Move;
    let p2id = foundObject.p2.p2Move;
    let turnValue;

    turnValue = (foundObject.sum) % 2;

    // X's turn
    if(turnValue == 0)
    {
        console.log("X went");

        // Switching to O's turn
        turnText.innerText = "O's Turn";

        // Sets the text of the button based on the button clicked
        ButtonSetText(p1id, p2id);
    }
    else if(turnValue != 0)
    {
        console.log("O went");

        // Switching to X's turn
        turnText.innerText = "X's Turn";

        // Sets the text of the button based on the button clicked
        ButtonSetText(p1id, p2id);
    }
    else {
        console.log("ERROR");
    }

    // Check if there is a winner
    // Checking for x
    CheckWinCondition(playerName, foundObject.sum, "X");
    // Checking for o
    CheckWinCondition(playerName, foundObject.sum, "O");

});


function CheckWinCondition(name, sum, letter)
{
    let hasWon = false;

    if(button1.innerText == letter && button2.innerText == letter && button3.innerText == letter)
        hasWon = true; // Top row won
    else if(button4.innerText == letter && button5.innerText == letter && button6.innerText == letter)
        hasWon = true; // Middle row won
    else if(button7.innerText == letter && button8.innerText == letter && button9.innerText == letter)
        hasWon = true;  // Last row won
    else if(button1.innerText == letter && button5.innerText == letter && button9.innerText == letter)
        hasWon = true; // Diagonal Top left and botton right
    else if(button3.innerText == letter && button5.innerText == letter && button7.innerText == letter)
        hasWon = true; // Diagonal Top right and bottom left
    else if(button1.innerText == letter && button4.innerText == letter && button7.innerText == letter)
        hasWon = true; // Left column
    else if(button2.innerText == letter && button5.innerText == letter && button8.innerText == letter)
        hasWon = true; // Middle Column
    else if(button3.innerText == letter && button6.innerText == letter && button9.innerText == letter)
        hasWon = true; // Right Column

    if(hasWon) {
        socket.emit("gameOver", {name:playerName});

        setTimeout(()=> {
            sum % 2 == 0 ? alert("X Wins!") : alert("O Wins!")

            setTimeout(()=> {
                location.reload(); // Reload the page after 2 seconds
            }, 2000)

        }, 100);

    }
    else if(sum == 10) // if all buttons have been pressed
    {
        socket.emit("gameOver", {name:playerName});

        setTimeout(()=> {
            alert("Draw"); // Draw message after 100 miliseconds

            setTimeout(()=> {
                location.reload(); // Reload the page after 2 seconds
            }, 2000)

        }, 100);
    }

}// end of CheckWinCondition

function ButtonSetText(pMove1, pMove2) {
    // Sets the text of the botton for X
    if(pMove1 != '') {
        document.getElementById(`${pMove1}`).innerText = "X";
        document.getElementById(`${pMove1}`).disabled = true;
    }

    // Sets the text of the botton for O
    if(pMove2 != '') {
        document.getElementById(`${pMove2}`).innerText = "O";
        document.getElementById(`${pMove2}`).disabled = true;
    }
}

