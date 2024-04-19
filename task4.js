"use strict";

const dirs = [
    {x:-1, y:0},
    {x:-1, y:-1},
    {x:0, y:-1},
    {x:1, y:-1},
    {x:1, y:0},
    {x:1, y:1},
    {x:0, y:1},
    {x:-1,y:1}
];

const sampleLocs = [
    {x:-5, y:0},
    {x:-3, y:-3},
    {x:0, y:-5},
    {x:3, y:-3},
    {x:5, y:0},
    {x:3, y:3},
    {x:0, y:5},
    {x:-3, y:3}
];

class Ant {

    x = 0;
    y = 0;
    hasFood = false;
    direction = 0;
    markerStrength = ANT_MARKER_STRENGTH;

    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.direction = direction;
    }

    //определение куда дальше двигаться
    update() {

        if (this.hasFood) {
    
            let possibles = this.sample(negMarkers, -1);
            possibles = getWrapppingNeighbors(possibles, this.direction, 1);
    
            let largestIndex = smallest(possibles);
            if (possibles[largestIndex] < -MARKER_FOLLOW_THRESHOLD) {
    
                this.direction = largestIndex + this.direction-1;
                this.direction = wrap(this.direction, 0, dirs.length);
            }
    
            this.mark(posMarkers, 1);
    
            this.wander();
    
            if (dist(this.x, this.y, homeX, homeY) < 20)
                this.track(homeX, homeY);
    
            this.move();
    
            if (dist(this.x, this.y, homeX, homeY) < 5) {
    
                this.direction = wrap(this.direction + 4, 0, dirs.length);
                this.hasFood = false;
                foodDelivered++;

            }
        }
    
        else {
    
            let possibles = this.sample(posMarkers, 1);
    
            possibles = getWrapppingNeighbors(possibles, this.direction, 1);
    
            let largestIndex = largest(possibles);
            if (possibles[largestIndex] > MARKER_FOLLOW_THRESHOLD) {
    
                this.direction = largestIndex + this.direction-1;
                this.direction = wrap(this.direction, 0, dirs.length);
            }
    
            this.mark(negMarkers, -1);
    
            this.wander();
    
            let foodX = -1, foodY = -1;
            for (let i = -FOOD_SMELL; i <= FOOD_SMELL ; i++) {
                for (let j = -FOOD_SMELL; j <= FOOD_SMELL ; j++) {
    
                    if (food?.[i+this.x]?.[j+this.y] > 0) {
                        foodX = i + this.x;
                        foodY = j + this.y;
                        break;
                    }
                }
    
                if (foodX !== -1) break;
            }
    
            this.track(foodX, foodY);
    
            this.move();
    
            if (food[this.x][this.y] > 0) {
    
                food[this.x][this.y] -= 1;
                this.direction = wrap(this.direction + 4, 0, dirs.length);
                this.hasFood = true;
            }
        }
    }

    //куда можно пойти
    sample(map, scalar) {

        let possibles = [];

        for (let i = 0 ; i < dirs.length ; i++) {

            let current = map?.[this.x + (sampleLocs[i].x)]?.[this.y + (sampleLocs[i].y)]
                * Math.pow(dist(homeX, homeY, this.x, this.y), 2) * CANVAS_WIDTH * 1000;

            if (wall?.[this.x + (sampleLocs[i].x)]?.[this.y + (sampleLocs[i].y)] === 1)
                current = 0;

            if (wall?.[this.x + (dirs[i].x)]?.[this.y + (dirs[i].y)] === 1)
                current = 100000 * -scalar;

            possibles.push(current ?? 0);
        }

        return possibles;
    }

    //следоватб
    track(trackingX, trackingY) {

        if (trackingX !== -1) {

            let dirX = 0, dirY = 0;

            if (trackingX > this.x) dirX = 1;
            if (trackingX < this.x) dirX = -1;
            if (trackingY > this.y) dirY = 1;
            if (trackingY < this.y) dirY = -1;

            if (wall[this.x + dirX][this.y + dirY] === 0)
                this.direction = getDirectionIndex(dirX, dirY);
        }
    }

    //случайное движение
    wander() {

        if (Math.floor(randomRange(0, ANT_RANDOM_MOVE_CHANCE)) === 0) {

            this.direction += Math.floor(randomRange(-1, 2));   
            this.direction = wrap(this.direction, 0, dirs.length);
        }
    }

    //покакать феромоном
    mark(map, scalar) {

        map[this.x][this.y] += this.markerStrength * scalar;
        map[this.x][this.y] = clamp(map[this.x][this.y], MIN_MARKER_STRENGTH, MAX_MARKER_STRENGTH);
    }

    //двигаться
    move() {

        this.x += dirs[this.direction].x;
        this.y += dirs[this.direction].y;

        if (this.x >= GRID_WIDTH){

            this.direction = wrap(this.direction + 4, 0, dirs.length);
            this.x += dirs[this.direction].x;
        }

        else if (this.x < 0){

            this.direction = wrap(this.direction + 4, 0, dirs.length);
            this.x += dirs[this.direction].x;
        }

        else if (this.y >= GRID_WIDTH){

            this.direction = wrap(this.direction + 4, 0, dirs.length);
            this.y += dirs[this.direction].y;
        }

        else if (this.y < 0){

            this.direction = wrap(this.direction + 4, 0, dirs.length);
            this.y += dirs[this.direction].y;
        }

        if (wall[this.x][this.y]) {

            this.x -= dirs[this.direction].x;
            this.y -= dirs[this.direction].y;

            this.x = clamp(this.x, 0, GRID_WIDTH-1);
            this.y = clamp(this.y, 0, GRID_WIDTH-1);
            this.direction = wrap(this.direction + 4, 0, dirs.length);
        }
    }

    draw() {

        context.fillStyle = this.hasFood ? "#ff00b7" : "white";
        context.fillRect(this.x * GRID_SIZE, this.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
}

function fillFood(map, x, y, width, height, value) {

    for (let i = x; i <= x+width; i++) {
        for (let j = y; j <= y+height; j++) {
            map[i][j] = value;
        }
    }
}

function cloneMap(map) {

    let newMap = [];

    for (let i = 0; i < map.length; i++) {

        newMap.push([]);

        for (let j = 0; j < map[i].length; j++) {
            newMap[i].push(map[i][j]);
        }
    }

    return newMap;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function lerp(scalar, one, two) {
    return (two - one) * scalar + one;
}

function blurMap(map, bias) {

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {

            let avg = map[i][j]*bias;
            let total = bias;

            for (let k = -1; k <= 1; k++) {
                for (let l = -1; l <= 1; l++) {

                    let cur = map?.[i+k]?.[j+l];

                    if (cur) {
                        avg += cur;
                        total++;
                    }
                    else {
                        total++;
                    }
                }
            }

            avg /= total;
            map[i][j] = avg * MARKER_DISSIPATION_RESISTANCE;
        }
    }

    return map;
}

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function getWrapppingNeighbors(arr, index, neighbourDistance) {

    let neighborHood = [];

    for (let i = index - neighbourDistance; i <= index + neighbourDistance; i++) {

        let curIndex = i % arr.length;

        if (curIndex < 0) 
            curIndex = arr.length + curIndex;

        neighborHood.push(arr[curIndex]);
    }

    return neighborHood;
}

function createMap(size, min, max) {

    let map = [];

    for (let i = 0 ; i < size; i++) {

        map.push([]);

        for (let j = 0; j < size; j++) {
            map[i].push(randomRange(min,max));
        }
    }

    return map;
}

function mapSumAtIndex(map1, map2, x, y) {
    return map1[x][y] + map2[x][y];
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((y2 - y1) ** 2 + (x1 - x2) ** 2);
}

function wrap(value, min, max) {

    value %= max;

    if (value < min)
        value = max+value;

    return value;
}

function getDirectionIndex(x, y) {

    for (let i = 0; i < dirs.length; i++) {

        if (dirs[i].x === x && dirs[i].y === y)
            return i;
    }

    return -1;
}

function largest(arr) {

    let max = -Infinity;
    let index = -1;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
            index = i;
        }
    }

    return index;
}

function smallest(arr) {

    let min = Infinity;
    let index = -1;

    for (let i = 0; i < arr.length; i++) {

        if (arr[i] < min) {
            min = arr[i];
            index = i;
        }
    }

    return index;
}

function fillWall(wall, intensity){
    for (let i = 0; i < GRID_WIDTH; i += GRID_SIZE){
        for (let j = 0; j < GRID_WIDTH; j += GRID_SIZE){

            if (!(i < GRID_SIZE * 2 && j < GRID_SIZE * 2)){

                if (Math.random() < intensity){
                    for (let y = i; y < i + GRID_SIZE; y++){
                        for (let x = j; x < j + GRID_SIZE; x++){
                            wall[y][x] = 1;
                        }
                    }
                }
            }
        }
    }
}

let INIT_ANT_COLONY_SIZE = 200;
const SIM_SPEED = 60;
const MARKER_DISSIPATION_RESISTANCE = 0.997;
const ANT_RANDOM_MOVE_CHANCE = 10;
const MARKER_FOLLOW_THRESHOLD = 0.1;
const MIN_MARKER_STRENGTH = -1;
const MAX_MARKER_STRENGTH = 1;
const ANT_MARKER_STRENGTH = 0.4;
const BLUR_STRENGTH = 80;
const CANVAS_WIDTH = 1000;
const GRID_WIDTH = 100;
const GRID_SIZE = CANVAS_WIDTH / GRID_WIDTH;
let homeX = GRID_SIZE;
let homeY = GRID_SIZE;
const WALL_INTENSITY = 0.2;
const FOOD_SMELL = 4;

const PEN_SIZE = 10;

const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

context.fillStyle = "black";
context.fillRect(0, 0, canvas.width, canvas.height);

context.scale(0.5, 0.5);

let foodDelivered = 0;

let ants = [];
let posMarkers = [];
let negMarkers = [];
let food = [];
let wall = [];

function init() {

    foodDelivered = 0;
    ants = [];
    posMarkers = [];
    negMarkers = [];
    food = [];
    wall = [];

    for (let i = 0; i < GRID_WIDTH ; i++) {

        food.push([]);

        for (let j = 0; j < GRID_WIDTH ; j++) {
            food[i].push(0);
        }
    }

    for (let i = 0; i < GRID_WIDTH; i++) {

        wall.push([]);

        for (let j = 0; j < GRID_WIDTH ; j++) {
            wall[i].push(0);
        }
    }

    fillWall(wall, WALL_INTENSITY);

    for (let i = 0; i < GRID_WIDTH ; i++) {

        posMarkers.push([]);
        negMarkers.push([]);

        for (let j = 0; j < GRID_WIDTH ; j++) {
            posMarkers[i].push(0);
            negMarkers[i].push(0);
        }
    }
        
    for (let i = 0 ; i < GRID_WIDTH; i++) {
        for (let j = 0 ; j < GRID_WIDTH; j++) {
    
            if (wall[i][j] > 0) {
                context.fillStyle = "#292929";
                context.fillRect(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
        }
    }
        
    context.fillStyle = "white";
    context.ellipse(homeX * GRID_SIZE, homeY * GRID_SIZE, 50, 50, Math.PI / 4, 0, 2 * Math.PI);
    context.fill();
}

init();

let drawing = false;

function startDrawing(elem){
    drawing = true;
    draw(elem);
}

function endDrawing(){
    drawing = false;
}

function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function draw(elem){

    if (drawing){
  
        if (elem.button !== 0){
            return;
        }
  
        const canvasBounding = canvas.getBoundingClientRect();
        const x = elem.clientX - canvasBounding.left;
        const y = elem.clientY - canvasBounding.top;
  
        for (let currX = x - PEN_SIZE; currX <= x + PEN_SIZE; currX++) {

            for (let currY = y - PEN_SIZE; currY <= y + PEN_SIZE; currY++) {
          
                let cellX = currX;
                let cellY = currY;
            
                const calcX = x;
                const calcY = y;
    
                const dist = Math.sqrt(Math.pow(cellX - calcX, 2) + Math.pow(cellY - calcY, 2));
    
                if (dist < PEN_SIZE){
    
                    let p = context.getImageData(cellX, cellY, 1, 1);

                    let red = Math.max(Math.min(Math.floor(255 - (Math.pow(dist / PEN_SIZE, 2) * 255)) + p.data[0], 255), p.data[0]);
                    let green = Math.max(Math.min(Math.floor(77 - (Math.pow(dist / PEN_SIZE, 2) * 77)) + p.data[1], 77), p.data[1]);
                    let blue = Math.max(Math.min(Math.floor(210 - (Math.pow(dist / PEN_SIZE, 2) * 210)) + p.data[2], 210), p.data[2]);

                    let indexX = Math.max(0, Math.min(99, Math.floor(currX / 5)));
                    let indexY = Math.max(0, Math.min(99, Math.floor(currY / 5)));

                    if (document.getElementById("food").checked){

                        if (wall[indexX][indexY] === 0){

                            food[indexX][indexY] = clamp(
                                food[indexX][indexY] +
                                Math.floor(PEN_SIZE / dist), food[indexX][indexY], 10);
                            
                            context.fillStyle = "#a6ff4d";
                            context.fillRect(Math.floor(currX / 5) * GRID_SIZE, Math.floor(currY / 5) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                        }
                    }

                    if (document.getElementById("wall").checked){
                        
                        wall[indexX][indexY] = clamp(
                            wall[indexX][indexY] +
                            Math.floor(PEN_SIZE / dist), wall[indexX][indexY], 1);

                        food[indexX][indexY] = 0;
                    
                        context.fillStyle = "#292929";
                        context.fillRect(Math.floor(currX / 5) * GRID_SIZE, Math.floor(currY / 5) * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                    }

                    if (document.getElementById("erase").checked) {
                        
                        wall[indexX][indexY] = 0;
                        food[indexX][indexY] = 0;

                        context.fillStyle = "black"
                        context.fillRect(Math.floor(currX / 5) * GRID_SIZE, Math.floor(currY / 5) * GRID_SIZE, GRID_SIZE, GRID_SIZE);

                        context.beginPath();
                        context.fillStyle = "black";
                        context.ellipse(homeX * GRID_SIZE, homeY * GRID_SIZE, 50, 50, Math.PI / 4, 0, 2 * Math.PI);
                        context.fill();

                        context.beginPath();
                        context.fillStyle = "white";
                        context.ellipse(homeX * GRID_SIZE, homeY * GRID_SIZE, 50, 50, Math.PI / 4, 0, 2 * Math.PI);
                        context.fill();
                    }
                }
            }
        }
    }
}

canvas.addEventListener("click", function (event) {

    if (document.getElementById("home").checked ){

        if (wall[Math.floor(event.offsetX / 5)][Math.floor(event.offsetY / 5)] === 0){

            homeX = Math.floor(event.offsetX / 5);
            homeY = Math.floor(event.offsetY / 5);

            context.fillStyle = "black";
            context.fillRect(0, 0, canvas.width, canvas.height);
            drawStuff();

            context.beginPath();
            context.fillStyle = "white";
            context.ellipse(homeX * GRID_SIZE, homeY * GRID_SIZE, 50, 50, Math.PI / 4, 0, 2 * Math.PI);
            context.fill();
        }
    }
});

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", endDrawing);
canvas.addEventListener("mousemove", draw);

let slider = document.getElementById("myinput");
let antCounter = document.getElementById("antCounter");
antCounter.innerHTML = "Ants count: " + slider.value;

slider.oninput = function() {
    antCounter.innerHTML = "Ants count: " + this.value;
}

let startButton = document.getElementById("startButton");
startButton.onclick = function() {

    INIT_ANT_COLONY_SIZE = slider.value;

    for (let i = 0; i < INIT_ANT_COLONY_SIZE ; i++) {
        ants.push(new Ant(homeX, homeY, Math.floor(randomRange(0, dirs.length))));
    }

    main();
}

let mainLoopID;
let isOnline = false;

function main(){

    if (!isOnline){

        isOnline = true;

        mainLoopID = setInterval(()=>{

            //сброс изображения
            context.fillStyle = "black";
            context.fillRect(0, 0, canvas.width, canvas.height);
        
            //рассеивание феромонов
            blurMap(posMarkers, BLUR_STRENGTH);
            blurMap(negMarkers, BLUR_STRENGTH);
            
            //отрисовка всего
            drawStuff();
        
        }, 1000 / SIM_SPEED);

    }
}

let resetButton = document.getElementById("resetButton");
resetButton.onclick = function(){
    clearInterval(mainLoopID);
}

let pauseButton = document.getElementById("pauseButton");
pauseButton.onclick = function(){

    if (isOnline){

        isOnline = false;
        
        clearInterval(mainLoopID);
    }
}

let playButton = document.getElementById("playButton");
playButton.onclick = function(){
    main();
}

function drawStuff() {

    for (let i = 0 ; i < GRID_WIDTH; i++) {
        for (let j = 0 ; j < GRID_WIDTH; j++) {

            posMarkers[i][j] = clamp(posMarkers[i][j], -1, 1);
            negMarkers[i][j] = clamp(negMarkers[i][j], -1, 1);

            let green = clamp(lerp(Math.abs(posMarkers[i][j]), 0, 255), 0, 255);
            let red = clamp(lerp(Math.abs(negMarkers[i][j]), 0, 255), 0, 255);

            context.fillStyle = `rgb(${red},${green},0)`;
            context.fillRect(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE);

            if (food[i][j] > 0) {
                context.fillStyle = "#a6ff4d";
                context.fillRect(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }

            if (wall[i][j] > 0) {
                context.fillStyle = "#292929";
                context.fillRect(i * GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            }
        }
    }

    context.beginPath();
    context.fillStyle = "white";
    context.ellipse(homeX * GRID_SIZE, homeY * GRID_SIZE, 50, 50, Math.PI / 4, 0, 2 * Math.PI);
    context.fill();

    ants.forEach((ant)=>{
        ant.update();
        ant.draw();
    });
}

document.getElementById("resetButton").addEventListener("click", function (){
    clearInterval(mainLoopID);
    init();
    main();

    isOnline = false;

    homeX = GRID_SIZE;
    homeY = GRID_SIZE;

    drawStuff();
});