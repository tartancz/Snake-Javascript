document.addEventListener('keydown', function(event) {
    if([37,38,39,40].includes(event.keyCode)) {
        if(event.keyCode === 38 && game.snake.previos_direction === 'ArrowDown'){
            return
        } else if (event.keyCode === 39 && game.snake.previos_direction === 'ArrowLeft') {
            return
        }   else if (event.keyCode === 37 && game.snake.previos_direction === 'ArrowRight') {
            return
        }   else if (event.keyCode === 40 && game.snake.previos_direction === 'ArrowUp') {
            return
        }
        game.snake.direction = event.key
    }
});

class Snake{
    constructor(game, lengt=4, position=2) {
        this.game = game
        this.#create_snake(lengt, position)
        this.move()
    }

    snakePosList = [];
    moves = new Map([
        ['ArrowUp', [0,-1]],
        ['ArrowDown', [0,1]],
        ['ArrowLeft', [-1,0]],
        ['ArrowRight', [1,0]]
    ])
    direction='ArrowRight';

    #nextPosition(xWay, yWay) {
        let [x, y] = [this.snakePosList[0].x, this.snakePosList[0].y]
        if (x + xWay > this.game.size - 1)
            return this.game.map[y][0]
        if (y + yWay > this.game.size - 1)
            return this.game.map[0][x]
        if (x + xWay === -1 )
            return this.game.map[y][this.game.size - 1]
        if (y + yWay === -1)
            return this.game.map[this.game.size - 1][x]
        return this.game.map[y + yWay][x + xWay]
    }

    move() {
        //pixel which snake go
        let nextPos = this.#nextPosition(...this.moves.get(this.direction))
        //check for collision
        for (const pos of this.snakePosList) {
            if(pos === nextPos){
                console.log('asd')
                game.gameOver()
                return
            }
        }
        //if eat food dont delete last block else delete
        if (nextPos.food){
            nextPos.food = false
            this.game.food.generate()
        }else {
            this.snakePosList.pop().snake = false
        }
        //add head pos to list
        this.snakePosList.unshift(nextPos)
        //make pixel black
        nextPos.snake = true
        //set actual direction to previos
        this.previos_direction = this.direction
    }

    #create_snake(lengt=4, position=2) {
        let starting_row_number = Math.floor((this.game.map.length - 1) / 2)
        for (let x = position; x < lengt + position; x += 1) {
            let pixel = this.game.map[starting_row_number][x]
            pixel.snake = true
            this.snakePosList.unshift(this.game.map[starting_row_number][x])
        }
    }


}


class Pixel{
    constructor(x,y, element) {
        this.x = x
        this.y = y
        this.element = element
    }

    _food;
    _snake;

    set food(value){
        if(value){
            this.changeColor('red')
            this._food = value
        } else{
            this.changeColor('white')
            this._food = value
        }
    }
    get food(){
        return this._food
    }

    set snake(value){
        if(value){
            this.changeColor('black')
            this._snake = value
        } else{
            this.changeColor('white')
            this._snake = value
        }
    }
    get snake() {
        return this._snake
    }

    changeColor(color) {
        this.element.style.background = color;
    }

}

class Food{
    constructor(game) {
        this.game = game;
    }
    generate() {
        let tempList = [];
        for (const row of this.game.map) {
            row.filter(x => !x.snake).forEach(x => tempList.push(x))
            var pixel = tempList[Math.floor(Math.random()*tempList.length)]

        }
        pixel.food = true
    }

}

class Game {
    generateMap() {
        this.map = []
        for (let y=0; y<this.size; y+=1){
            this.map.push(this.#createRow(y))
        }
        document.getElementById('map').style.display = 'inline-flex';
    }

    #createRow(row_id) {
        let row = document.createElement('div',)
        let row_array = []
        row.setAttribute('class', 'row')
        row.setAttribute('id', `row-${row_id}`)
        for (let x=0; x<this.size; x+=1) {
            let element = document.createElement('div')
            element.setAttribute('id', `pixel-y${x}-x${row_id}`)
            element.setAttribute('class', 'pixel')
            row.appendChild(element)
            row_array.push(new Pixel(x, row_id, element))
        }
        document.getElementById('map').appendChild(row)
        return row_array
    }
    
    start(size, interval) {
        website.hideFlash()
        this.size = size
        this.generateMap()
        let snake = new Snake(game, 5, 1)
        this.snake = snake
        this.food = new Food(game)
        this.food.generate()
        function round(){
            snake.move()
        }
        this.repeater = setInterval(round, interval)
    }

    gameOver(){
        website.flash('GAME OVER')
        clearInterval(this.repeater)
    }


}

class website{

    static setting = document.getElementById('game-off')
    static STOP = document.getElementById('game-on');
    static map = document.getElementById('map')

    static getOption(input){
        let option
        input.forEach(x => {if (x.checked) option = x.value})
        return option
    }
    static hide(element) {
        element.style.display = 'none'
    }
    static show(element, display='flex'){
        element.style.display = display
    }
    static deleteAllSubElement(element){

    }

    static flash(message){
        let messageEle = document.getElementById('message')
        messageEle.innerText=message
        messageEle.style.display = 'block'
    }

    static hideFlash(){
        let messageEle = document.getElementById('message')
        messageEle.style.display = 'none'
    }

}

let game = new Game()

function buttonStart(){
    let difficulty = website.getOption(document.getElementsByName('difficulty'))
    let size = website.getOption(document.getElementsByName('map'))
    if (difficulty && size){
        game.start(size, difficulty)
        website.hide(website.setting)
        website.show(website.STOP)
    }
    else{
        website.flash('Pick both option')
    }
}


function stop(){
    clearInterval(game.repeater)
    website.map.innerHTML=''
    website.hide(website.map)
    website.hide(website.STOP)
    website.show(website.setting)
}
