const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

let points = []; 
let chromosomeLength; 
let generationCount = 100000; 
let mutationChance = 30; 


canvas.addEventListener('click', handleMouseClick);
document.getElementById("clear").onclick = clearCanvas;
document.getElementById("start").onclick = geneticAlgorithm; 




function clearCanvas(){
    location.reload();
}

function handleMouseClick(event){
    const mouseX = event.pageX - event.target.offsetLeft;
    const mouseY = event.pageY - event.target.offsetTop;

    context.beginPath();
    points.forEach(point => {
        const [pointX, pointY] = point;
        const deltaX = mouseX - pointX;
        const deltaY = mouseY - pointY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const scaledX = pointX + deltaX * 10 / distance;
        const scaledY = pointY + deltaY * 10 / distance;

        context.moveTo(scaledX, scaledY);
        context.lineTo(mouseX, mouseY);
        context.strokeStyle = "rgba(243,243,243,0.34)";
        context.stroke();
    });

    context.beginPath();
    context.arc(mouseX, mouseY, 10, 0, 2*Math.PI, false);
    context.fillStyle = '#a8a1a1';
    context.fill();

    points.push([mouseX, mouseY]);
    redrawVertices();
}




function drawConnections(source, destination){
    const drawSegment = (start, end, color, lineWidth) => {
        context.beginPath();
        context.moveTo(start[0], start[1]);
        context.lineTo(end[0], end[1]);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();
    };

    const extendPoint = (point, nextPoint) => {
        const vectorX = nextPoint[0] - point[0];
        const vectorY = nextPoint[1] - point[1];
        const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        return [point[0] + vectorX * 10 / distance, point[1] + vectorY * 10 / distance];
    };

    source.push(source[0].slice()); 
    destination.push(destination[0].slice()); 

    source.forEach((point, i) => {
        if (i < source.length - 1) {
            const nextPoint = source[i + 1];
            const extendedStart = extendPoint(point, nextPoint);
            const extendedEnd = extendPoint(nextPoint, point);
            drawSegment(extendedStart, extendedEnd, "rgb(255,255,255)", 2);
            drawSegment(extendedStart, extendedEnd, "rgba(243,243,243,0.34)", 1);
        }
    });

    destination.forEach((point, i) => {
        if (i < destination.length - 1) {
            const nextPoint = destination[i + 1];
            const extendedStart = extendPoint(point, nextPoint);
            const extendedEnd = extendPoint(nextPoint, point);
            drawSegment(extendedStart, extendedEnd, "rgb(250,142,142)", 1);
        }
    });
}



function drawFinishPath(source, destination){
    const drawSegment = (start, end, color, lineWidth) => {
        context.beginPath();
        context.moveTo(start[0], start[1]);
        context.lineTo(end[0], end[1]);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();
    };

    const extendPoint = (point, nextPoint) => {
        const vectorX = nextPoint[0] - point[0];
        const vectorY = nextPoint[1] - point[1];
        const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        return [point[0] + vectorX * 10 / distance, point[1] + vectorY * 10 / distance];
    };

    destination.splice(destination.length - 1, 0, destination[0].slice());

    const drawPath = (points, color, lineWidth) => {
        points.push(points[0].slice());
        points.forEach((point, i) => {
            if (i < points.length - 1) {
                const nextPoint = points[i + 1];
                const extendedStart = extendPoint(point, nextPoint);
                const extendedEnd = extendPoint(nextPoint, point);
                drawSegment(extendedStart, extendedEnd, color, lineWidth);
            }
        });
    };

    drawPath(source, "rgb(255,255,255)", 2);
    drawPath(source, "rgba(243,243,243,0.34)", 1);
    drawPath(destination, "rgb(250,142,142)", 1);
}



function drawPath(bestPath, lineColor){
    const drawSegment = (start, end, color, lineWidth) => {
        context.beginPath();
        context.moveTo(start[0], start[1]);
        context.lineTo(end[0], end[1]);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();
    };

    const extendPoint = (point, nextPoint) => {
        const vectorX = nextPoint[0] - point[0];
        const vectorY = nextPoint[1] - point[1];
        const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
        return [point[0] + vectorX * 10 / distance, point[1] + vectorY * 10 / distance];
    };

    console.log(bestPath.slice());
    bestPath.push(bestPath[0].slice()); 
    console.log(bestPath.slice());

    for (let i = 0; i < bestPath.length - 1; ++i){
        const currentPoint = bestPath[i];
        const nextPoint = bestPath[i + 1];
        const extendedStart = extendPoint(currentPoint, nextPoint);
        const extendedEnd = extendPoint(nextPoint, currentPoint);
        drawSegment(extendedStart, extendedEnd, "rgb(255,255,255)", 2);
        drawSegment(extendedStart, extendedEnd, lineColor, 1);
    }
}



function redrawVertices() {
    for (let i = 0; i < points.length; ++i) {
        context.beginPath();
        context.arc(points[i][0], points[i][1], 10, 0, 2 * Math.PI, false);
        context.fillStyle = '#00ffff';
        context.fill();
    }
}

function shuffleArray(array) {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }
    return shuffled;
}


function createInitialPopulation(firstGeneration) {
    const population = [];
    const size = points.length * points.length;

    const generateIndividual = () => {
        const individual = firstGeneration.slice();
        shuffleArray(individual);
        individual.push(calculateDistance(individual));
        return individual;
    };

    population.push(firstGeneration.concat(calculateDistance(firstGeneration)));

    for (let i = 0; i < size; ++i) {
        population.push(generateIndividual());
    }

    return population;
}


function addToPopulation(population, chromosome) {
    const index = population.findIndex(individual => chromosome[chromosome.length - 1] < individual[individual.length - 1]);
    if (index !== -1) {
        population.splice(index, 0, chromosome.slice());
    } else {
        population.push(chromosome.slice());
    }
}

function calculateDistance(chromosome) {
    return chromosome.reduce((totalDistance, point, index) => {
        const nextPoint = chromosome[(index + 1) % chromosome.length];
        const deltaX = nextPoint[0] - point[0];
        const deltaY = nextPoint[1] - point[1];
        return totalDistance + Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }, 0);
}


function twoRandomNumbers(min, max){
    let a = Math.floor(Math.random() * (max - min) + min);
    let b = Math.floor(Math.random() * (max - min) + min);
    while (a === b){
        a = Math.floor(Math.random() * (max - min) + min);
    }
    return [a, b];
}

function randomNumber(min, max) {
    const range = max - min;
    const randomFraction = Math.random();
    return min + Math.floor(randomFraction * range);
}


function crossover(firstParent, secondParent) {
    let child = [];
    let [index1, index2] = twoRandomNumbers(0, firstParent.length);
    child = firstParent.slice(index1, index2 + 1);

    for (let num of secondParent) {
        if (!child.includes(num)) {
            child.push(num);
        }
    }

    if (Math.random() * 100 < mutationChance) {
        const [i, j] = twoRandomNumbers(1, chromosomeLength);
        [child[i], child[j]] = [child[j], child[i]];
    }

    return child;
}

function breedOffspring(firstParent, secondParent) {
    let firstChild = crossover(firstParent, secondParent);
    let secondChild = crossover(firstParent, secondParent);

    const calculateAndPushDistance = (child) => {
        const distance = calculateDistance(child);
        child.push(distance);
        return child;
    };

    return [calculateAndPushDistance(firstChild.slice()), calculateAndPushDistance(secondChild.slice())];
}


async function waitAsync(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


async function geneticAlgorithm(){
    let population = createInitialPopulation(points);
    let end = 500;

    population.sort((a, b) => a[a.length - 1] - b[b.length - 1]);

    let bestChromosome = population[0].slice();
    drawPath(bestChromosome, "rgb(250,142,142)");

    for(let i = 0; i < generationCount; ++i){
        if (end === 0){
            drawPath(bestChromosome, "rgb(142,250,142)");
            break;
        }

        population = population.slice(0, points.length * points.length);

        let newGeneration = [];
        for (let j = 0; j < points.length * points.length; ++j){
            let index1 = randomNumber(0, population.length);
            let index2 = randomNumber(0, population.length);
            let firstParent = population[index1].slice(0, population[index1].length - 1);
            let secondParent = population[index2].slice(0, population[index2].length - 1);

            let child = breedOffspring(firstParent, secondParent);
            newGeneration.push(child[0].slice());
            newGeneration.push(child[1].slice());
        }

        population = population.concat(newGeneration);

        population.sort((a, b) => a[a.length - 1] - b[b.length - 1]);

        if (JSON.stringify(bestChromosome) !== JSON.stringify(population[0])){
            drawFinishPath(bestChromosome, population[0]);
            bestChromosome = population[0].slice();
            end = 500;
        }

        if (i % 100 === 0){
            console.log(i);
            end -= 100;
        }

        redrawVertices();
        await waitAsync(0);
    }
} 



