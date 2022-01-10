class DiscardPile {
    constructor(xStartPercent, yStartPercent) {
        this.xStartPercent = xStartPercent;
        this.yStartPercent = yStartPercent;
        this.listImages = [];
    }

    addImage(number) {
        for (let i = 0; i < number; i++) {
            let card = new CreateImage('fon', this.xStartPercent, this.yStartPercent, 15, 187, 261);
            this.listImages.push(card);
            this.xStartPercent += 0.2;
            this.yStartPercent -= 0.1;
        }
    }
}

class CreateImage {
    constructor(imageName, xStartPercent, yStartPercent, widthPercent, imageWidth, imageHeight) {
        let fileName = "images/" + imageName + ".png";
        this.imageName = imageName;
        this.card_name = imageName;
        this.xStartPercent = xStartPercent;
        this.yStartPercent = yStartPercent;
        this.widthPercent = widthPercent;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;

        this.image = new Image();
        this.image.src = fileName;
        this.calculateCoordinates();
    }

    calculateCoordinates() {
        let xPixel = canvas.width / 100;
        let yPixel = canvas.height / 100;
        let ratio = this.imageHeight / this.imageWidth;
        this.x = this.xStartPercent * xPixel;
        this.image_width =  this.widthPercent * xPixel;
        //this.xEnd = this.x + this.image_width;
        this.x_end = this.x + this.image_width;


        this.y = this.yStartPercent * yPixel;
        this.image_height =  this.image_width * ratio;
        //this.yEnd = this.y + this.image_height;
        this.y_end = this.y + this.image_height;
        //alert(this.y_end);
    }
}

class Card {
    constructor(card_name, number_x, number_y) {
        let file_name = "images/" + card_name + ".png";
        this.card_name =card_name;
        this.number_x = number_x;
        this.number_y = number_y;

        this.image = new Image();
        this.image.src = file_name;
        this.Math_cord();
    }

    Update_cord() {
        let delta_y = -20;
        this.y = this.y + delta_y;
        this.y_end = this.y + this.image_height + delta_y;
    }

    Math_cord() {
        console.log("math")
        let delta_y_card_cord = (canvas.height - (canvas.height * 0.13 + 2 * 261 * scale)) / 3;
        if (delta_y_card_cord < 10) {
            delta_y_card_cord = 25;
        }
        //console.log(document.readyState);

        //console.log(scale);
        //console.log(this.image.width);
        //console.log(this.image.height);

        //this.image_width = this.image.width * scale, //Ширина изображения на холсте, умноженная на масштаб
        //this.image_height = this.image.height * scale //Высота изображения на холсте, умноженная на масштаб
        this.image_width = 187 * scale; //Ширина изображения на холсте, умноженная на масштаб
        this.image_height = 261 * scale; //Высота изображения на холсте, умноженная на масштаб


        this.x = canvas.width * 0.05 + 187 * scale * this.number_x;
        this.x_end = this.x + this.image_width;

        this.y = canvas.height*0.05 + delta_y_card_cord*this.number_y;
        this.y_end = this.y + this.image_height;
        }
}

const UPDATE_TIME = 1000 / 25;
let canvas = document.getElementById("canvas"); //Получение холста из DOM
let ctx = canvas.getContext("2d"); //Получение контекста — через него можно работать с холстом

let table = document.getElementById("table");
let turn_audio = document.getElementById('turn_audio');
let error_audio = document.getElementById('error_audio');

let scale; //Масштаб обьектов

let discard_pile_flag = false;

let text_player;
let text_game;

let discardPile1 = new DiscardPile(5, 65);
let discardPile2 = new DiscardPile(80, 65);

let nameOfCards = [];
let cards = [];
let trump = '';
let moves = [];
let card_delete;

let listToClick = cards;

let buttons = [];
let inputs = [];
let suitsImage = [];

for (let i = 0; i < 4; i++) {
    buttons.push(document.getElementById("button" + i));
    inputs.push(document.getElementById("input" + i));
    buttons[i].onclick = function () {getPlayerName(i)};
}

Resize(); // При загрузке страницы задаётся размер холста

window.addEventListener("resize", Resize); //При изменении размеров окна будут меняться размеры холста
window.addEventListener("click", function (e) { clickImage(e)});

socket = io();

socket.on('newGame', function () {
    //alert('new game')
    trump = '';
    cards = [];
    moves = [];
    nameOfCards = [];
    discardPile1.listImages = [];
    discardPile2.listImages = [];

});

socket.on('giveStartGameState', function (playersName, playersSocketId) {
    //состояние регистрации игроков
    for (let i = 0; i < 4; i ++) {
        //если игрок зарегистрирован
        if (playersSocketId[i] != 0) {
            inputs[i].value = playersName[i];
            buttons[i].innerText = 'Готов';
            inputs[i].disabled = true;
            buttons[i].disabled = true;
        }
    }
});

socket.on('getTrump', function (suits, cardsForTrump ) {

    let xStartPercent = 93;

    for (let i = 0; i < 4; i++) {
        let image = new CreateImage(suits[i],xStartPercent,2, 7,64,74);
        suitsImage.push(image);
        xStartPercent -= 7 + 2;
    }
    create_cards(cardsForTrump, cards);
    table.style.display = "none";
    listToClick = suitsImage;
});

socket.on('audioError', function () {
    error_audio.play();
});

socket.on('discard_pile_flag_true', function () {
    discard_pile_flag = true;
});

socket.on('discard_pile_flag_false',function () {
    discard_pile_flag = false;
});

socket.on('giveGameState',function (list, textPlayerName, cardsOfTurn, giveTrump, discardPile){
    trump = giveTrump;
    suitsImage = [];
    let image = new CreateImage(trump,93,2, 5,64,74);
    suitsImage.push(image);
    cards = [];
    nameOfCards = list;
    create_cards(nameOfCards,cards);
    addCardsToTurn(cardsOfTurn);
    table.style.display = "none";
    Resize();
    listToClick = cards;
    discardPile1.addImage(discardPile[0]);
    discardPile2.addImage(discardPile[1]);
});

socket.on('to_clear_move',function (teamDiscardPileTurn) {
    moves = [];
    discardPile1.addImage(teamDiscardPileTurn[0]);
    discardPile2.addImage(teamDiscardPileTurn[1]);
});

socket.on('deleteCardFromPlayerHand', function () {
    cards.splice(card_delete,1);
});

socket.on('addCardOfTurn',function (cardName, cardNumberOfTurn) {
    turn_audio.play();
    output_text();
    create_one_cards(cardName, cardNumberOfTurn);
    Draw();
});

socket.on('get_text', function (text) {
    text_game = text;
});

socket.on('givePlayerNameAll', function (playerName, index) {
    inputs[index].value = playerName;
    //text_player = 'Игрок: ' + playerName;

    inputs[index].disabled = true;
    buttons[index].disabled = true;
    buttons[index].innerText = 'Готов';
    //buttons[index].display = 'none';
    //alert('Yes');
});

socket.on('blockAllButton', function (textPlayerName, index) {

    for (let button of buttons) {
        button.disabled = true;
        text_player = 'Игрок № '+ (index + 1) + ': ' + textPlayerName;
    }
});

Resize(); // При загрузке страницы задаётся размер холста
Start();

function Start() {
    timer = setInterval(Draw, UPDATE_TIME); //Состояние игры будет обновляться 60 раз в секунду — при такой частоте обновление происходящего будет казаться очень плавным
}

function Resize() {

    canvas.width = window.innerWidth;
    scale = (2*canvas.width/20)/187;
    canvas.height = window.innerHeight;

    for(let i = 0; i < cards.length; i++) {
        cards[i].calculateCoordinates();
        //cards[i].Math_cord();
    }

    for(let i = 0; i < moves.length; i++) {
        //moves[i].Math_cord();
        moves[i].calculateCoordinates();
    }

    for(let i = 0; i < suitsImage.length; i++) {
        suitsImage[i].calculateCoordinates();
    }

    for(let i = 0; i < discardPile1.listImages.length; i++) {
        discardPile1.listImages[i].calculateCoordinates();
    }

    for(let i = 0; i < discardPile2.listImages.length; i++) {
        discardPile2.listImages[i].calculateCoordinates();
    }
}

function Draw_image(picture) {
    ctx.drawImage
    (
        picture.image, //Изображение для отрисовки
        0, //Начальное положение по оси X на изображении
        0, //Начальное положение по оси Y на изображении
        picture.image.width, //Ширина изображения
        picture.image.height, //Высота изображения
        picture.x, //Положение по оси X на холсте
        picture.y, //Положение по оси Y на холсте
        picture.image_width, //Ширина изображения на холсте, умноженная на масштаб
        picture.image_height //Высота изображения на холсте, умноженная на масштаб
    );

}

function Draw() {
    //Очистка холста от предыдущего кадра
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < cards.length; i++) {
        Draw_image(cards[i]);
    }

    for(let i = 0; i < moves.length; i++) {
        Draw_image(moves[i]);
    }

    for(let i = 0; i < suitsImage.length; i++) {
        Draw_image(suitsImage[i]);
    }

    // for(let i = 0; i < discardPile1.length; i++) {
    //     Draw_image(discardPile1[i]);
    // }

    for(let i = 0; i < discardPile1.listImages.length; i++) {
        Draw_image(discardPile1.listImages[i]);
    }

    for(let i = 0; i < discardPile2.listImages.length; i++) {
        Draw_image(discardPile2.listImages[i]);
    }

    output_text();
}

function clickImage(event) {

    let index;
    if (discard_pile_flag) {
        socket.emit('discard_pile_click');
        return;
    }
    //listToClick = suitsImage;
    index = getIndexClickedImage(listToClick,event);
    //alert(listToClick[index].card_name);
    if (!trump) {
        trump = listToClick[index].card_name;
        socket.emit('giveTrump', trump);
        //alert(trump);
    }
    else {
        socket.emit('card-click', listToClick[index].card_name);
        card_delete = index;
    }
}

function getIndexClickedImage(listImages,event) {
    //получам кликнутое изображение (список проверяемых изображений)
    let cardsUnderCursor = [];
    let deltaXStartClick = [];

    for (let i = 0; i < listImages.length; i++) {
        if ( listImages[i].x < event.clientX && event.clientX < listImages[i].x_end ) {
            if ( listImages[i].y < event.clientY && event.clientY < listImages[i].y_end ) {
                cardsUnderCursor.push(i);
                let delta = event.clientX - listImages[i].x;
                deltaXStartClick.push(delta);
            }
        }
    }
    if (deltaXStartClick[0] > deltaXStartClick[1]) return  cardsUnderCursor[1];
    else return  cardsUnderCursor[0];
}

function create_cards(name_cards,cards) {
    let xStartPercent = 5;
    for (let i = 0; i < name_cards.length; i++) {
        let card = new CreateImage( name_cards[i], xStartPercent, 10, 15, 187, 261);
        //let card = new Card( name_cards[i], i, 1);
        cards.push(card);
        xStartPercent += 9;
    }

    return cards;
}

function create_one_cards(cardName,cardNumberOfTurn) {
    let card = new CreateImage(cardName, 20 + cardNumberOfTurn * 15, 40, 15, 187, 261);
    //let card = new Card(cardName, 2 + cardNumberOfTurn, 3);
    moves.push(card);
}

function output_text() {
    let factor = 1;
    if (canvas.height > canvas.width) {
        factor = canvas.height/canvas.width*2;
    }
    let size = 48 * factor;
    ctx.font = size * scale + 'px serif';
    ctx.textAlign = "center";
    ctx.fillText(text_player, canvas.width/2, canvas.height*0.05  );
    ctx.fillText(text_game, canvas.width/2, canvas.height*0.05 + size * scale);
}

function addCardsToTurn(cardsOfTurn) {
    let index = 0;
    for (let card of cardsOfTurn) {
        create_one_cards(card, index);
        index ++;
    }
}

function getPlayerName(numberButton){
    //inputs[numberButton].disabled = true;
    //buttons[numberButton].disabled = true;

    let playerName = inputs[numberButton].value;
    socket.emit('givePlayerName',playerName, numberButton)
}