// TicTacToe backend server

const express = require('express');
const app = express();

// Socket.io setup, combining 3 servers into one to get the results we need
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const port = 3000;

// Gives all files in public folder access to be used in index.html
app.use(express.static('public'));

app.get('/', (req,res) =>{
    res.sendFile(__dirname + '/index.html')
})

let arr = [];
let playingArr = [];
let turnNum = 0; // the number of turns that have passed

// When a user connects to the server
io.on('connection', (socket) => {
    
    // On event fired findGameButton
    socket.on("findGame", (e) => {

        // If name is not empty
        if(e.name != null) {
            arr.push(e.name);
            turnNum = 0;

            // two players are connected, then connect the two players
            if(arr.length >= 2) {
                let p1Obj = {
                    p1Name:arr[0],
                    p1Value:"X",
                    p1Move: ""
                }
                let p2Obj = {
                    p2Name:arr[1],
                    p2Value:"O",
                    p2Move: ""
                }

                // Object that holds both player objects
                let obj = {
                    p1:p1Obj,
                    p2:p2Obj,
                    sum: 1
                }

                playingArr.push(obj);

                // Remove both elements from array
                arr.splice(0,2);

                // Send array to front end
                io.emit("loadPlayersData", {allPlayers:playingArr});
            }

        }
    })

    socket.on("onClickButton", (e)=>{

        let str = turnNum.toString();
        console.log("Button Pressed TurnNum = " + str);
        // e.value is the players letter value
        let isValid = true;

        if(turnNum % 2 == 0 && e.value == "X") // It's X's turn
        {
            let objToChange = playingArr.find(obj=>obj.p1.p1Name===e.name)
            objToChange.p1.p1Move = e.id;
            objToChange.sum++;
            turnNum++;
        }
        else if(turnNum % 2 != 0 && e.value == "O") {
            let objToChange = playingArr.find(obj => obj.p2.p2Name === e.name);
            objToChange.p2.p2Move = e.id;
            objToChange.sum++;
            turnNum++;
        }
        else {
            isValid = false;
        }

        io.emit("updateBoard", {allPlayers:playingArr, valid:isValid, buttonId:e.id});
    })

    // When a socket disconnects from game
    socket.on('disconnect', (reason) => {
        console.log(reason);
    })

    socket.on("gameOver", (e) => {
        // Remove elements from playingArr that have this name(p1Name)
        playingArr = playingArr.filter(obj=> obj.p1.p1Name !== e.name)
        console.log(playingArr);
    })

});



server.listen(port, () =>{
    console.log(`Example app listening on port ${port}`);
})


// Store all player data here that needs to be shared with the other player
// Store each players move on the board
// Store what Letter they are
// Game state: if the game is over/Win/Lose, still running, or tie, maybe not started
