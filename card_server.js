//
module.exports.createDeck = createDeck;
module.exports.possible_moves = getPossibleMoves;
module.exports.max_card = getIndexMaxCard;
module.exports.getScoreOfCards = getScoreOfCards;
module.exports.getTotalGameScore = getTotalGameScore;
module.exports.sortCardsOfPlayers = sortCardsOfPlayers;


function createDeck() {
    const SUITS = ['x', 'p', 'c', 'b'];
    const DENOMINATIONS = ['6', '7', '8', '9', '10', 'v', 'd', 'k', 't'];

    let cardName;
    let listOfCards = [];
    let cardsOfPlayers = [];

    for (let suit of SUITS) {
        for (let denomination of DENOMINATIONS) {
            cardName = denomination + suit;
            listOfCards.push(cardName);
        }
    }
    shuffleDeck(listOfCards);

    for (let i = 0; i < 4; i++) {
        cardsOfPlayers.push(listOfCards.slice(i * 9,i * 9 + 9));
    }
    return cardsOfPlayers;
}

function shuffleDeck(listOfCards) {
    for (let i = listOfCards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // случайный индекс от 0 до i

        // поменять элементы местами
        // мы используем для этого синтаксис "деструктурирующее присваивание"
        // подробнее о нём - в следующих главах
        // то же самое можно записать как:
        // let t = array[i]; array[i] = array[j]; array[j] = t
        [listOfCards[i], listOfCards[j]] = [listOfCards[j], listOfCards[i]];
    }
}

function getPossibleMoves(cardsOfTurn, hand, trump) {
    //возможные хода игрока (карты хода, карты игрока, козер)
    let possibleTurnsOfPlayer = [];
    let firstCardDenominationSuit;
    let firstCardSuit;

    let cardDenominationSuit;
    let cardDenomination;
    let cardSuit;

    //если первая карта в ходе
    if (cardsOfTurn.length == 0) return hand;
    else {
        //если зашли козером
        if (isTrumpCard(cardsOfTurn[0], trump)) {
            for (let card of hand) {
                //если карта козырная
                if (isTrumpCard(card, trump)) {
                    possibleTurnsOfPlayer.push(card);
                }
            }
            //если нету ниодной козырной карты
            if (possibleTurnsOfPlayer.length == 0) return hand;
            else return possibleTurnsOfPlayer;
        }
        //если зашли не козером
        else {
            firstCardDenominationSuit = getDenominationAndSuitCard(cardsOfTurn[0]);
            firstCardSuit = firstCardDenominationSuit[1];
            for (let card of hand) {
                cardDenominationSuit = getDenominationAndSuitCard(card);
                cardDenomination = cardDenominationSuit[0];
                cardSuit = cardDenominationSuit[1];
                if (cardDenomination == 'v') continue;

                if (cardSuit == firstCardSuit) {
                    possibleTurnsOfPlayer.push(card)
                }
            }
            if (possibleTurnsOfPlayer.length == 0) return hand;
            else return possibleTurnsOfPlayer;

        }
    }
}

function isTrumpCard(card, trump) {
    //козырная карта (карта, козер)
    let cardDenominationSuit = getDenominationAndSuitCard(card);
    let cardDenomination = cardDenominationSuit[0];
    let cardSuit = cardDenominationSuit[1];
    if (cardDenomination == 'v' || cardSuit == trump) return true;
    else return false;
}

function getPowersOfList (cardsList, trump) {
    //
    let powerOfCard;
    let listPowerOfCards = [];
    let firstCardOfTurn = cardsList[0];

    for (let card of cardsList) {
        powerOfCard = getPowerOfCard(card,trump,firstCardOfTurn);
        listPowerOfCards.push(powerOfCard);
    }
    return listPowerOfCards;
}

function getIndexMaxCard(cardsOfTurn,trump) {
    //получение индекса максимальной карты (карты хода, козер)
    let indexMaxValue;
    let listPowerOfCards = getPowersOfList(cardsOfTurn, trump)
    console.log('Сила карт' + listPowerOfCards);
    indexMaxValue = max(listPowerOfCards);
    return indexMaxValue;
}

function max(listOfValue) {
    //находим индекс максимального значения (список значений)
    let maxValue = -1;
    let indexMaxValue = 0;
    let index = 0;

    for (let value of listOfValue) {
        if (value > maxValue) {
            maxValue = value;
            indexMaxValue = index;
        }
        index ++;
    }
    return indexMaxValue;
}

function getPowerOfCard(card, trump, firstCardOfTurn) {
    //сила карты (карта, козер, первая карта хода)
    const POWERS = {'6': 0, '7': 1, '8': 2, '9': 3, '10': 6, 'v': 0, 'd': 4, 'k': 5, 't': 7};
    let cardDenominationSuit = getDenominationAndSuitCard(card);
    let cardDenomination = cardDenominationSuit[0];
    let cardSuit = cardDenominationSuit[1];

    let firstCardDenominationSuit = getDenominationAndSuitCard(firstCardOfTurn);
    let firstCardDenomination = firstCardDenominationSuit[0];
    let firstCardSuit = firstCardDenominationSuit[1];

    let suitMove = firstCardSuit;

    if (cardDenomination == 'v') {
        if (cardSuit == 'x') return 19;
        else if (cardSuit == 'p') return 18;
        else if (cardSuit == 'c') return 17;
        else if (cardSuit == 'b') return 16;
    }
    else if (cardSuit == trump) {
        if (cardDenomination == '6') return 20;
        else return POWERS[cardDenomination] + 8;
    }
    else if (cardSuit == suitMove) return POWERS[cardDenomination];
    // когда просто скидаються
    else return POWERS[cardDenomination] - 8;
}

function getDenominationAndSuitCard(card) {
    //Определяет масть и достоинство карты (карта)
    let denomination = card.slice(0,-1);
    let suit = card.slice(-1);

    return [denomination, suit];
}

function getScoreOfCards(cards) {
    //подсчет очков (карты)
    const SCORES = {'6': 0, '7': 0, '8': 0, '9': 0, '10': 10, 'v': 2, 'd': 3, 'k': 4, 't': 11};
    let cardDenominationSuit;
    let cardDenomination;
    let score = 0;

    for (let card of cards) {
        cardDenominationSuit  = getDenominationAndSuitCard(card);
        cardDenomination = cardDenominationSuit[0];
        score += SCORES[cardDenomination];
    }
    return score;
}

function getTotalGameScore(roundScore, totalGameScore) {
    //
    let minScoreIndex;

    if (roundScore[0] < roundScore[1]) minScoreIndex = 0;
    else if (roundScore[0] > roundScore[1]) minScoreIndex = 1;
    else return totalGameScore;

    if (roundScore[minScoreIndex] == 0) totalGameScore[minScoreIndex] +=3;
    else if (roundScore[minScoreIndex] < 30) totalGameScore[minScoreIndex] +=2;
    else totalGameScore[minScoreIndex] +=1;
    return totalGameScore;
}

function sortHand(hand,trump) {
    //console.log('hand ' + hand);
    let result = [];
    let trumpCard = [];
    let clubs = [];
    let spades = [];
    let hearts = [];
    let diamonds = [];

    for (let card of hand) {
        let denominationAndSuit = getDenominationAndSuitCard(card);
        //console.log(denominationAndSuit);
        //console.log(denominationAndSuit[1]);
        if (isTrumpCard(card, trump)) trumpCard.push(card);
        else if (denominationAndSuit[1] == 'x') clubs.push(card);
        else if (denominationAndSuit[1] == 'p') spades.push(card);
        else if (denominationAndSuit[1] == 'c') hearts.push(card);
        else if (denominationAndSuit[1] == 'b') diamonds.push(card);
    }
    //console.log('kozer ' + trumpCard);
    //console.log('x ' + clubs);
    ///console.log('p ' + spades);
   // console.log('c ' + hearts);
    //console.log('b ' +diamonds);
    trumpCard = sortMaxMinCard(trumpCard.slice(), trump);
    clubs = sortMaxMinCard(clubs.slice(), trump);
    spades = sortMaxMinCard(spades.slice(), trump);
    hearts = sortMaxMinCard(hearts.slice(), trump);
    diamonds = sortMaxMinCard(diamonds.slice(), trump);

    result = trumpCard.concat(clubs, spades, hearts, diamonds);
    //console.log('result ' + result);
    //console.log('=====');
    return result;
}

function sortCardsOfPlayers (cardsOfPlayers, trump) {
    let result = [];
    for (let hand of cardsOfPlayers) {
        result.push(sortHand(hand, trump))
    }
    return result;
}

function sortMaxMinCard(sortList, trump) {
    //
    let result = [];
    let sortListPower = getPowersOfList(sortList, trump);
    //console.log(sortList);
    //console.log(sortListPower);

    for (let i = 0; i < sortList.length; i++) {
        let indexMax = max(sortListPower);
        result.push(sortList[indexMax]);
        sortListPower[indexMax] = -1;
        console.log(sortListPower);
    }
    console.log(result);
    return result;
}

