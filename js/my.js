
class Card
{
    constructor(image, number_x, number_y)
    {
        
        this.number_x = number_x;
        this.number_y = number_y;        

        this.image = new Image();        
        this.image.src = image;
        this.Math_cord();
        
        
    }

    Update_cord()
    {
        
        var delta_y = -20;
        this.y = this.y + delta_y;
        this.y_end = this.y + this.image_height + delta_y;



    }

    Math_cord()
    {
        var delta_y_card_cord = (canvas.height - (canvas.height * 0.13 + 2 * 261 * scale)) / 3;
        if (delta_y_card_cord < 10)
        {
            delta_y_card_cord = 25;
        }

        this.x = canvas.width*0.05 + 187*scale*this.number_x;
        this.x_end = this.x + this.image_width;

        this.y = canvas.height*0.05 + delta_y_card_cord*this.number_y;
        this.y_end = this.y + this.image_height;

        this.image_width = this.image.width * scale, //Ширина изображения на холсте, умноженная на масштаб
        this.image_height = this.image.height * scale //Высота изображения на холсте, умноженная на масштаб
    }
}

class Road
{
    constructor(image, y)
    {
        this.x = 0;
        this.y = y;
 
        this.image = new Image();
        
        this.image.src = image;
    }
 
    Update(road) 
    {
        this.y += speed; //При обновлении изображение смещается вниз
 
        if(this.y > canvas.height) //Если изображение ушло за край холста, то меняем положение
        {
            this.y =  road.y - canvas.width + speed; //Новое положение указывается с учётом второго фона
        }
    }
}

const UPDATE_TIME = 1000 / 25;

var timer = null;



var canvas = document.getElementById("canvas"); //Получение холста из DOM
var ctx = canvas.getContext("2d"); //Получение контекста — через него можно работать с холстом
var a = canvas.width;
var scale; //Масштаб обьектов
var Flag = false; 
Resize(); // При загрузке страницы задаётся размер холста
 
window.addEventListener("resize", Resize); //При изменении размеров окна будут меняться размеры холста

canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; });

window.addEventListener("click", function (e) { card_click (e)}); 
 
window.addEventListener("keydown", function (e) { KeyDown(e); }); //Получение нажатий с клавиатуры

var suits = ['x', 'p', 'c', 'b'];
var ranks = ['6', '7', '8', '9', '10', 'v', 'd', 'k', 't'];

var cards = [];
var test = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35];
shuffle(test);
alert(test);




for (var i = 0; i < suits.length; i++)
{	
	for (var j = 0; j < ranks.length; j++)
	{
		var name = "images/" + ranks[j] + suits[i] + ".png"
		
		var card = new Card( name, j, i)
		
		cards.push(card)
	}
}

shuffle(cards);
var n_x = 0;
var n_y = 0;
for (var i = 0; i < cards.length; i++)
{
    
    cards[i].number_x = n_x;
    cards[i].number_y = n_y;

    n_x += 1;
    if (n_x == ranks.length)
    {
        n_y += 1;
        n_x = 0;
        
    } 
    
     
}
//cards[11].number_x = 0;
//cards[11].number_y = 0;
//cards[11].Math_cord();

 
Resize(); // При загрузке страницы задаётся размер холста
var roads = [
			new Road("images/road.jpg", 0),
			new Road("images/road.jpg", canvas.width)
			]; //Массив с фонами 
              

var speed = 1;

Start();


function card_click(e)
{ 

    for(var i = 0; i < cards.length; i++)
    {
        if ( cards[i].x < e.clientX && e.clientX < cards[i].x_end )
        {
            
            if ( cards[i].y < e.clientY && e.clientY < cards[i].y_end )
            {
                cards[i].Update_cord();

                Update();    
            }
        }
    } 

}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // случайный индекс от 0 до i

    // поменять элементы местами
    // мы используем для этого синтаксис "деструктурирующее присваивание"
    // подробнее о нём - в следующих главах
    // то же самое можно записать как:
    // let t = array[i]; array[i] = array[j]; array[j] = t
    [array[i], array[j]] = [array[j], array[i]];
  }
}
 
function Start()
{
    timer = setInterval(Update, UPDATE_TIME); //Состояние игры будет обновляться 60 раз в секунду — при такой частоте обновление происходящего будет казаться очень плавным
}
 
function Stop()
{
    clearInterval(timer); //Остановка обновления
}
 
function Update() //Обновление игры
{
    roads[0].Update(roads[1]);
    roads[1].Update(roads[0]);
 
    Draw();
}
 
function Draw() //Работа с графикой
{
    ctx.clearRect(0, 0, canvas.width, canvas.height); //Очистка холста от предыдущего кадра
    
    

    for(var i = 0; i < roads.length; i++)
    {
        ctx.drawImage
        (
            roads[i].image, //Изображение для отрисовки
            0, //Начальное положение по оси X на изображении
            0, //Начальное положение по оси Y на изображении
            roads[i].image.width, //Ширина изображения
            roads[i].image.height, //Высота изображения
            roads[i].x, //Положение по оси X на холсте
            roads[i].y, //Положение по оси Y на холсте
            canvas.width, //Ширина изображения на холсте
            canvas.width //Так как ширина и высота фона одинаковые, в качестве высоты указывается ширина
        );
    }

    for(var i = 0; i < cards.length; i++)
    {
    	ctx.drawImage
    (
        cards[i].image, //Изображение для отрисовки
        0, //Начальное положение по оси X на изображении
        0, //Начальное положение по оси Y на изображении
        cards[i].image.width, //Ширина изображения
        cards[i].image.height, //Высота изображения
        cards[i].x, //Положение по оси X на холсте
        cards[i].y, //Положение по оси Y на холсте
        cards[i].image_width, //Ширина изображения на холсте, умноженная на масштаб
        cards[i].image_height //Высота изображения на холсте, умноженная на масштаб
    );
    }  
}
 
function KeyDown(e)
{
    switch(e.keyCode)
    {
        case 37: //Влево
            player.Move("x", -speed);
            break;
 
        case 39: //Вправо
            player.Move("x", speed);
            break;
 
        case 38: //Вверх
            player.Move("y", -speed);
            break;
 
        case 40: //Вниз
            player.Move("y", speed);
            break;
 
        case 27: //Esc
            break;
    }
}
 
function Resize()
{
    //alert("yes");
    canvas.width = window.innerWidth;
    scale = (2*canvas.width/20)/187;
    canvas.height = window.innerHeight;
    //Update();
    if (Flag)
    {
        for(var i = 0; i < cards.length; i++)
        {
            cards[i].Math_cord();
        }

    }
    Flag = true;
    

}