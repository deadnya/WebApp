"use strict";

var n = 31;
const wall = 1;
const hole = 0;
const start = 2;
const end = 3;

var pathStartX = 1;
var pathStartY = 1;
var pathEndX = n - 2;
var pathEndY = n - 2;

var cancelExecution = false;

var startExists = true;
var endExists = true;

var area = [];

n = undefined;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function getIndex(arr, obj) {
    
    for (let i = 0; i < arr.length; i++){
        if (arr[i].x == obj.x && arr[i].y == obj.y){
            return i;
        }
    }

    return -1;
}

function makeMaze(){

    for (let i = 0; i < n; i++){

        area[i] = [];
    
        for (let j = 0; j < n; j++){
    
            area[i][j] = wall;
        }
    }

    let startX = Math.min(Math.floor(Math.random() * (n - 1) / 2) * 2 + 1, n - 2);
    let startY = Math.min(Math.floor(Math.random() * (n - 1) / 2) * 2 + 1, n - 2);

    recursiveBacktracking(startX, startY);
}

function recursiveBacktracking(x, y){

    let directions = ['up', 'down', 'right', 'left'];

    shuffleArray(directions);

    for (let i = 0; i < 4; i++){
        
        if (directions[i] == 'up'){
            
            if ((y > 2) && (area[y - 2][x] == wall)){


                for (let j = 0; j < 3; j++) {
                    area[y - 2 + j][x] = hole;
                }

                recursiveBacktracking(x, y - 2);
            }
        }
        
        else if (directions[i] == 'down'){
            
            if ((y + 2 < n - 1) && (area[y + 2][x] == wall)){

                for (let j = 0; j < 3; j++) {
                    area[y + j][x] = hole;
                }

                recursiveBacktracking(x, y + 2);
            }

        }

        else if (directions[i] == 'left'){
            
            if ((x > 2) && (area[y][x - 2] == wall)){

                for (let j = 0; j < 3; j++) {
                    area[y][x - 2 + j] = hole;
                }

                recursiveBacktracking(x - 2, y);
            }

        }

        else if (directions[i] == 'right'){
            
            if ((x + 2 < n - 1) && (area[y][x + 2] == wall)){

                for (let j = 0; j < 3; j++) {
                    area[y][x + j] = hole;
                }

                recursiveBacktracking(x + 2, y);
            }
        }
    }
}

function getHeuristic(currX, currY, endX, endY){
    return Math.abs(currX - endX) + Math.abs(currY - endY);
}

function getDist(currX, currY, endX, endY, dist){
    return {
        'g': dist,
        'h': getHeuristic(currX, currY, endX, endY),
        'f': dist + getHeuristic(currX, currY, endX, endY)
    };
}

function getCell(x, y, fromX, fromY){
    return {
        'x': x,
        'y': y,
        'fromX': fromX,
        'fromY': fromY
    };
}

async function findPath(startX, startY, endX, endY){

    let openQueue = [];
    let closed = [];

    openQueue.push(getCell(startX, startY, undefined, undefined));
    let distances = [];

    for (let y = 0; y < n; y++){
        distances[y] = [];

        for (let x = 0; x < n; x++){
            distances[y][x] = {'g': Infinity, 'h': Infinity, 'f': Infinity};
        }
    }

    distances[startY][startX] = getDist(startX, startY, endX, endY, 0);

    while (openQueue.length > 0){

        if (cancelExecution){
            document.getElementById('newMazeButton').disabled = false;
            document.getElementById('solveButton').disabled = false;
            return;
        }

        openQueue.sort(function(a, b){
            return distances[a.y][a.x].f - distances[b.y][b.x].f;
        });

        let element = openQueue.shift();

        let delay = document.getElementById('solveDelay').value;
        await new Promise(r => setTimeout(r, delay));
        
        closed.push(element);
        document.getElementById((element.y + ' ') + (element.x + '')).style.background = 'red';

        if (element.x == endX && element.y == endY){
            
            document.getElementById((element.y + ' ') + (element.x + '')).style.background = 'lightgreen';

            let tempX = element.fromX;
            let tempY = element.fromY;

            closed.reverse();

            closed.forEach(function (elem){
                console.log(elem.x, elem.y);

                if (elem.x == tempX && elem.y == tempY){
                    console.log(1);
                    document.getElementById((elem.y + ' ') + (elem.x + '')).style.background = '#817aff';
                    tempX = elem.fromX;
                    tempY = elem.fromY;

                    if (elem.x == startX && elem.y == startY){
                        document.getElementById((elem.y + ' ') + (elem.x + '')).style.background = 'pink';
                    }
                }
            });
            
            document.getElementById('newMazeButton').disabled = false;
            document.getElementById('solveButton').disabled = false;
            return;
        }

        let gScore = distances[element.y][element.x].g + 1;
        let gScoreIsBest = false;

        if (element.y > 0 && area[element.y - 1][element.x] != wall){

            let currX = element.x;
            let currY = element.y - 1;
            
            let neighbour = getCell(currX, currY, element.x, element.y);

            if (getIndex(closed, neighbour) == -1 && area[currY][currX] != wall ){

                let ind = getIndex(openQueue, neighbour);

                if (ind == -1){

                    distances[currY][currX] = getDist(currX, currY, endX, endY, gScore);
                    gScoreIsBest = true;

                    openQueue.push(neighbour);
                }
                    
                else if (distances[currY][currX].g > gScore){

                    distances[currY][currX] = getDist(currX, currY, endX, endY, gScore);
                    gScoreIsBest = true;
                }

                if (gScoreIsBest && !cancelExecution){
                    document.getElementById((currY + ' ') + (currX + '')).style.background = 'yellow';
                }
            }
        }

        if (element.y < n - 1 && area[element.y + 1][element.x] != wall){

            let currX = element.x;
            let currY = element.y + 1;
            
            let neighbour = getCell(currX, currY, element.x, element.y);

            if (getIndex(closed, neighbour) == -1 && area[currY][currX] != wall ){

                let ind = getIndex(openQueue, neighbour);

                if (ind == -1){

                    distances[currY][currX] = getDist(currX, currY, endX, endY, gScore);
                    gScoreIsBest = true;

                    openQueue.push(neighbour);
                }
                    
                else if (distances[currY][currX].g > gScore){

                    distances[currY][currX] = getDist(currX, currY, endX, endY, gScore);
                    gScoreIsBest = true;
                }

                if (gScoreIsBest && !cancelExecution){
                    document.getElementById((currY + ' ') + (currX + '')).style.background = 'yellow';
                }
            }
        }

        if (element.x > 0 && area[element.y][element.x - 1] != wall){

            let currX = element.x - 1;
            let currY = element.y;
            
            let neighbour = getCell(currX, currY, element.x, element.y);

            if (getIndex(closed, neighbour) == -1 && area[currY][currX] != wall ){

                let ind = getIndex(openQueue, neighbour);

                if (ind == -1){

                    distances[currY][currX] = getDist(currX, currY, endX, endY, gScore);
                    gScoreIsBest = true;

                    openQueue.push(neighbour);
                }
                    
                else if (distances[currY][currX].g > gScore){

                    distances[currY][currX] = getDist(currX, currY, endX, endY, gScore);
                    gScoreIsBest = true;
                }

                if (gScoreIsBest && !cancelExecution){
                    document.getElementById((currY + ' ') + (currX + '')).style.background = 'yellow';
                }
            }
        }

        if (element.x < n - 1 && area[element.y][element.x + 1] != wall){

            let currX = element.x + 1;
            let currY = element.y;
            
            let neighbour = getCell(currX, currY, element.x, element.y);

            if (getIndex(closed, neighbour) == -1 && area[currY][currX] != wall ){

                let ind = getIndex(openQueue, neighbour);

                if (ind == -1){

                    distances[currY][currX] = getDist(currX, currY, endX, endY, gScore);
                    gScoreIsBest = true;

                    openQueue.push(neighbour);
                }
                    
                else if (distances[currY][currX].g > gScore){

                    distances[currY][currX] = getDist(currX, currY, endX, endY, gScore);
                    gScoreIsBest = true;
                }

                if (gScoreIsBest && !cancelExecution){
                    document.getElementById((currY + ' ') + (currX + '')).style.background = 'yellow';
                }
            }
        }
    }

    alert("No path1");

    closed.forEach(function (elem){
        document.getElementById((elem.y + ' ') + (elem.x + '')).style.background = 'white';
    });

    document.getElementById('newMazeButton').disabled = false;
    document.getElementById('solveButton').disabled = false;

    return;
}

function changeState(elem){

    let y = parseInt(elem.id.split(' ')[0]);
    let x = parseInt(elem.id.split(' ')[1]);

    if (document.getElementById('walls').checked){

        if (area[y][x] == hole){

            elem.style.background = 'black';
            area[y][x] = wall;

        } 
        
        else if (area[y][x] == wall){

            elem.style.background = 'white';
            area[y][x] = hole;

        }
    }

    if (document.getElementById('start').checked){

        if (area[y][x] == hole){

            if (startExists){
                let start = document.getElementById((pathStartY + ' ') + (pathStartX + ''));
                start.style.background = 'white';
                area[pathStartY][pathStartX] = hole;
            }

            elem.style.background = 'pink';
            area[y][x] = start;

            pathStartX = x;
            pathStartY = y;

            startExists = true;
        } 
        
        else if (area[y][x] == start){

            elem.style.background = 'white';
            area[y][x] = hole;
            startExists = false;

        }
    }

    if (document.getElementById('end').checked){

        if (area[y][x] == hole){

            if (endExists){
                let end = document.getElementById((pathEndY + ' ') + (pathEndX + ''));
                end.style.background = 'white';
                area[pathEndY][pathEndX] = hole;
            }

            elem.style.background = 'lightgreen';
            area[y][x] = end;

            pathEndX = x;
            pathEndY = y;

            endExists = true;
        } 
        
        else if (area[y][x] == end){

            elem.style.background = 'white';
            area[y][x] = hole;
            endExists = false;

        }
    }
}

function showMaze(oldN) {

    let tableSize = 0.31 * window.innerWidth;

    let div = document.getElementById('maze');

    if (oldN != n){

        if (document.getElementById("mazeTable") != undefined){
            document.getElementById("mazeTable").remove();
        }

        let tbl = document.createElement('table');
        tbl.style.width = tableSize + 'px';
        tbl.style.marginLeft = 'auto';
        tbl.style.marginRight = 'auto';
        tbl.id = 'mazeTable';
        let tbdy = document.createElement('tbody');

        for (let i = 0; i < n; i++) {

        let tr = document.createElement('tr');

            for (let j = 0; j < n; j++) {

                let td = document.createElement('td');
                tr.appendChild(td);

                let sq = document.createElement('div');

                if (area[i][j] == wall){
                    sq.className = 'square-wall';
                    sq.style.background = 'black';
                } 

                if (area[i][j] == hole) {
                    sq.className = 'square-hole';
                    sq.style.background = 'white';
                }

                if (area[i][j] == start) {
                    sq.className = 'square-start';
                    sq.style.background = 'pink';
                }

                if (area[i][j] == end) {
                    sq.className = 'square-end';
                    sq.style.background = 'lightgreen';
                }

                sq.style.margin = '0px';
                sq.id = (i + ' ') + (j + '');

                sq.style.width = (tableSize / n) + "px";
                sq.style.height = (tableSize / n) + "px";

                sq.addEventListener("click", function () { changeState(sq) });

                td.appendChild(sq);
            }

            tbdy.appendChild(tr);
        }

        tbl.appendChild(tbdy);
        div.appendChild(tbl);
    }

    else {

        for (let i = 0; i < n; i++){
            for (let j = 0; j < n; j++){
                
                let sq = document.getElementById((i + ' ') + (j + ''));
                

                if (area[i][j] == wall){
                    sq.className = 'square-wall';
                    sq.style.background = 'black';
                } 

                if (area[i][j] == hole) {
                    sq.className = 'square-hole';
                    sq.style.background = 'white';
                }

                if (area[i][j] == start) {
                    sq.className = 'square-start';
                    sq.style.background = 'pink';
                }

                if (area[i][j] == end) {
                    sq.className = 'square-end';
                    sq.style.background = 'lightgreen';
                }
            }
        }
    }
}

function resetMaze(){
    for (let y = 0; y < n; y++){
        for (let x = 0; x < n; x++){

            if (area[y][x] != wall) {
                document.getElementById((y + ' ') + (x + '')).style.background = 'white';
            }

            if (area[y][x] == start) {
                document.getElementById((y + ' ') + (x + '')).style.background = 'pink';
            }

            if (area[y][x] == end) {
                document.getElementById((y + ' ') + (x + '')).style.background = 'lightgreen';
            }

        }
    }
}

document.getElementById('solveButton').addEventListener("click", function(){

    cancelExecution = false;

    if (!startExists){
        alert('Start is not set!');
        document.getElementById('newMazeButton').disabled = false;
        return;
    }

    if (!endExists){
        alert('End is not set!');
        document.getElementById('newMazeButton').disabled = false;
        return;
    }

    document.getElementById('newMazeButton').disabled = true;
    document.getElementById('solveButton').disabled = true;

    resetMaze();
    findPath(pathStartX, pathStartY, pathEndX, pathEndY);

});

document.getElementById('resetButton').addEventListener("click", function(){
    cancelExecution = true;
    resetMaze();
});

document.getElementById('newMazeButton').addEventListener("click", function(){
    getNewMaze();
});

function getNewMaze() {

    document.getElementById('newMazeButton').disabled = true;

    let oldN = n;
    n = document.getElementById('mazeSizeInput').value;

    area = [];
    pathStartX = 1;
    pathStartY = 1;
    pathEndX = n - 2;
    pathEndY = n - 2;

    if (n % 2 == 0){
        pathEndX -= 1;
        pathEndY -= 1;
    }

    if (n < 5){
        alert('Maze size should be at least 5');
        document.getElementById('newMazeButton').disabled = false;
        return;
    }

    makeMaze();

    area[pathStartY][pathStartX] = start;
    area[pathEndY][pathEndX] = end;

    showMaze(oldN);

    document.getElementById('newMazeButton').disabled = false;
    document.getElementById('solveButton').disabled = false;

}

let sliderSize = document.getElementById("mazeSizeInput");
let sizeP = document.getElementById("mazeSize");
sizeP.innerHTML = "Size: " + sliderSize.value;

sliderSize.oninput = function() {
    sizeP.innerHTML = "Size: " + this.value;
}

let delay = document.getElementById("solveDelay");
let delayP = document.getElementById("delay");
delayP.innerHTML = "Delay: " + delay.value;

delay.oninput = function() {
    delayP.innerHTML = "Delay: " + this.value;
}

getNewMaze();   