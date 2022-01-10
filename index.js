let express = require('express'); // Express contains some boilerplate to for routing and such
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http); // Here's where we include socket.io as a node module

const serverPartOfGame = require('./card_server.js');

let cards_names = serverPartOfGame.createDeck();

let text_game;
let players_name = ['Игрок №1','Игрок №2','Игрок №3','Игрок №4'];
let discard_pile_players_click_ok = [];
let whose_move = 0;
let playersSocketId = [0,0,0,0];
//let number_player = 0;
let card_number_in_hod = 0;
let hand_move = [];
let max_index;
let turn_index = [];
let numberActiveUser = 0;
let teamScore = [0,0];
let teamDiscardPile = [0,0];
let totalGameScore = [0,0];
let trump;
let suits = ['b','c','p','x'];
let playerName;
let discardPile = [0,0];
let timer = new Date();

// Serve the index page
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

// Serve the assets directory
app.use('/images',express.static('images'));
app.use('/js',express.static('js'));

// Listen on port 80
app.set('port', (process.env.PORT || 80));

http.listen(app.get('port'), function(){
    console.log('listening on port',app.get('port'));
});

io.on('connection', function(socket){
    //connect new user
    io.to(socket.id).emit('giveStartGameState',players_name, playersSocketId);

    socket.on('givePlayerName', function (playerName,index) {

        numberActiveUser ++;

        players_name[index] = playerName;
        io.emit('givePlayerNameAll', playerName, index);
        io.to(socket.id).emit('blockAllButton', playerName, index);
        playersSocketId[index] = socket.id;
        //console.log(playersSocketId + '2');

        //if (numberActiveUser == 4) {
        if (true) {
            //console.log('hello');
            if (!trump) {
                //получаем козер
                io.to(playersSocketId[whose_move]).emit('getTrump', suits, cards_names[whose_move].slice(0,3));
                //io.to(playersSocketId[whose_move]).emit('getTrump', suits, cards_names[whose_move].slice(0,3));
                text_game = 'Игрок ' + players_name[whose_move] + 'выберает козер.';
                io.emit('get_text', text_game);
                io.to(playersSocketId[whose_move]).emit('get_text', 'ВЫБЕРИТЕ КОЗЕР ->');

            }
            //если происходит переподключение
            else {
                //finalize
                /*for (let i = 0; i < 4; i++) {
                    console.log(playersSocketId + ' переподключение 3');
                    playerName = (i + 1) + ' ' + players_name[i];
                    io.to(playersSocketId[i]).emit("giveGameState", cards_names[i], playerName, hand_move, trump, discardPile);
                    text_game = 'Ходит игрок ' + players_name[card_number_in_hod];
                    io.emit('get_text', text_game);
                    io.emit('user_connect');
                }*/
                io.to(playersSocketId[index]).emit("giveGameState", cards_names[index], playerName, hand_move, trump, discardPile);
                text_game = 'Ходит игрок ' + players_name[card_number_in_hod];
                io.emit('get_text', text_game);
                io.emit('user_connect');
            }

        }
    });

    socket.on('giveTrump', function (giveTrump) {
        trump = giveTrump;
        console.log(cards_names);
        let temp = cards_names.slice();
        cards_names = [];
        cards_names = serverPartOfGame.sortCardsOfPlayers(temp, trump);
        console.log(cards_names);
        for (let i = 0; i < 4; i++) {
            console.log('players SocketID '+ playersSocketId + ' 4');
            playerName = (i + 1) + ' ' + players_name[i];
            io.to(playersSocketId[i]).emit("giveGameState", cards_names[i], playerName, hand_move, trump, discardPile);
            text_game = 'Ходит игрок ' + players_name[whose_move];
            io.emit('get_text', text_game);
            card_number_in_hod = whose_move;
        }

    });

    socket.on('discard_pile_click', function () {

        if (!discard_pile_players_click_ok.includes(socket.id)) {
            discard_pile_players_click_ok.push(socket.id);
        }
        if (discard_pile_players_click_ok.length == 4 || (new Date - timer) > 8000) {

            discard_pile_players_click_ok = [];
            io.emit('discard_pile_flag_false');
            io.emit('to_clear_move', teamDiscardPile);
            hand_move = [];

            //начинаем новую партию
            if (!trump) {
                console.log('Start new game');
                teamScore = [0,0];
                whose_move += 1;
                if (whose_move == 4) whose_move = 0;
                cards_names = [];
                cards_names = serverPartOfGame.createDeck();
                console.log(cards_names);
                console.log('whose_move=' + whose_move);
                console.log(whose_move);
                io.emit('newGame');
                text_game = 'Игрок ' + players_name[whose_move] + 'выберает козер.';
                io.emit('get_text', text_game);

                io.to(playersSocketId[whose_move]).emit('get_text', 'ВЫБЕРИТЕ КОЗЕР ->');
                console.log(cards_names[whose_move].slice(0,3));
                io.to(playersSocketId[whose_move]).emit('getTrump', suits, cards_names[whose_move].slice(0,3));

            }
            else {
                //discard_pile_players_click_ok = [];
                text_game = 'Ходит игрок ' + players_name[turn_index[max_index]];
                io.emit('get_text', text_game);

                card_number_in_hod = turn_index[max_index];
                turn_index = [];
            }
        }

    });

    socket.on('card-click', function (nameOfCard){
        //console.log(socket.id);
        console.log('player_number_in_hod ' + card_number_in_hod + ' ' + players_name[card_number_in_hod]);
        //console.log(players_socket_id[card_number_in_hod]);
        if (socket.id != playersSocketId[card_number_in_hod]) {
            console.log('Not your move')
            text_game = "Не Ваш ход. Ходит " + players_name[card_number_in_hod];
            io.to(socket.id).emit('get_text', text_game);
            io.to(socket.id).emit('audioError');
        }
        else {
            let hand_possible_moves = serverPartOfGame.possible_moves(hand_move,cards_names[card_number_in_hod],trump);

            console.log('possible moves ' + hand_possible_moves);
            console.log('Card click ' + nameOfCard + '\n');
            //если карта есть в списке возможных ходов
            if (hand_possible_moves.includes(nameOfCard)) {


                io.emit('addCardOfTurn',nameOfCard,hand_move.length);
                hand_move.push(nameOfCard);

                io.to(socket.id).emit('deleteCardFromPlayerHand');
                let delete_card = cards_names[card_number_in_hod].indexOf(nameOfCard);
                cards_names[card_number_in_hod].splice(delete_card,1);
                turn_index.push(card_number_in_hod);

                if (hand_move.length < 4) {
                    let temp = 1;
                    if (card_number_in_hod ==3) temp = -3;
                    text_game = 'Ходит игрок ' + players_name[card_number_in_hod + temp];
                    io.emit('get_text', text_game);
                }
                //если все походили
                else {
                    console.log('\nCards on desk ' + hand_move);

                    max_index = serverPartOfGame.max_card(hand_move, trump);
                    console.log('Index max card ' + max_index);
                    console.log('turn' + turn_index);
                    console.log('Win player ' + turn_index[max_index]);
                    console.log('Player name ' + players_name[turn_index[max_index]]);
                    text_game = 'Забирает игрок ' + players_name[turn_index[max_index]] + '. Нажмите чтобы продолжыть';
                    io.emit('get_text', text_game);
                    io.emit('discard_pile_flag_true');
                    timer = new Date;

                    //считаем очки
                    let score = serverPartOfGame.getScoreOfCards(hand_move);
                    if (turn_index[max_index] == 0 ||turn_index[max_index] == 2) {
                        teamDiscardPile = [4,0];
                        discardPile[0] += 4;
                        teamScore[0] += score;
                    }
                    else {
                        teamDiscardPile = [0,4];
                        discardPile[1] += 4;
                        teamScore[1] += score;
                    }
                    //конец партиии
                    if (teamScore[0] + teamScore[1] == 120) {
                        totalGameScore = serverPartOfGame.getTotalGameScore(teamScore, totalGameScore);
                        text_game = 'Счет: Команда №1 набрала' + teamScore[0] + '\n Команда №2 набрала' + teamScore[1];
                        text_game += '\n Общий счет ' + totalGameScore[0] + ' : ' + totalGameScore[1];
                        io.emit('get_text', text_game);
                        //io.emit('discard_pile_flag_true');
                        trump = '';
                        discardPile = [0,0];
                        //cards_names = [];
                        //hand_move = [];

                    }


                    console.log(teamScore + '\n');
                    //начинаем новый ход


                }
                if (card_number_in_hod == 3) {
                    card_number_in_hod = -1;
                }
                card_number_in_hod++;
            }
            else {
                console.log('wrong card!!!' + '\n');
                text_game = "Картой " + nameOfCard + " ходить нельзя!!!" + 'Можна ' +  hand_possible_moves;
                io.to(socket.id).emit('get_text', text_game);
                io.to(socket.id).emit('audioError');
            }
        }
    });

    socket.on('disconnect',function(){
        let i = playersSocketId.indexOf(socket.id);
        if (i != -1) {
            console.log(socket.id);
            console.log("i =" + i);
            playersSocketId[i] = 0;
            numberActiveUser --;
            console.log('disconekt');
            io.emit('user_disconnect');
            //io.emit('update-players',players);
        }

    });

    //number_player++;

});
let a = 0;