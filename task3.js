const canvas = document.querySelector("canvas");

canvas.height = 1000;
canvas.width = 1000;

const context = canvas.getContext("2d");
context.scale(2, 2);

let points = []; 

canvas.addEventListener('click', handleMouseClick);
document.getElementById("clear").onclick = clearCanvas;
document.getElementById("start").onclick = geneticAlgorithm; 


function handleMouseClick(e) {
    let canvasBounds = e.target.getBoundingClientRect();
    let clientX = e.clientX - canvasBounds.left;
    let clientY = e.clientY - canvasBounds.top;

    context.fillStyle = "white";
    context.beginPath();
    context.arc(clientX, clientY, 15, 0, 2 * Math.PI, false);
    context.fill();

    points.push([clientX, clientY]);

}

function drawPath(bestPath, color) {
    console.log(bestPath.slice());
    const extendedPath = bestPath.slice();
    extendedPath.splice(extendedPath.length - 1, 0, bestPath[0].slice());
    console.log(extendedPath.slice());

    for (let i = 0; i < extendedPath.length - 2; ++i) {
        const delta = [extendedPath[i + 1][0] - extendedPath[i][0], extendedPath[i + 1][1] - extendedPath[i][1]];
        const s = Math.sqrt(delta[0] * delta[0] + delta[1] * delta[1]);

        context.beginPath();
        context.moveTo(extendedPath[i][0] + delta[0] * 10 / s, extendedPath[i][1] + delta[1] * 10 / s);
        context.lineTo(extendedPath[i + 1][0] - delta[0] * 10 / s, extendedPath[i + 1][1] - delta[1] * 10 / s);
        
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
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

function calculateDistance(chromosome) {
    return chromosome.reduce((totalDistance, point, index) => {
        const nextPoint = chromosome[(index + 1) % chromosome.length];
        const deltaX = nextPoint[0] - point[0];
        const deltaY = nextPoint[1] - point[1];
        return totalDistance + Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }, 0);
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

let chromosomeLength;

function crossover(firstParent, secondParent) {
    let child = [];
    let [index1, index2] = twoRandomNumbers(0, firstParent.length);
    child = firstParent.slice(index1, index2 + 1);

    for (let num of secondParent) {
        if (!child.includes(num)) {
            child.push(num);
        }
    }

    if (Math.random() * 100 < 30) {
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

function clearCanvas(){
    location.reload();
}

async function waitAsync(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}


async function geneticAlgorithm(){
    let firstGeneration = [];

    for (let i = 0; i < points.length; ++i){
        firstGeneration.push(points[i]);
    }
    chromosomeLength = firstGeneration.length;

    let population = createInitialPopulation(firstGeneration);
    population.sort((a, b) => a[a.length - 1] - b[b.length - 1]);

    let bestChromosome = population[0].slice();

    let finish = 5;

    for(let i = 0; i < 10000; ++i){

        population = population.slice(0, points.length * points.length);

        for (let j = 0; j < points.length * points.length; ++j) {
            const index1 = randomNumber(0, population.length);
            const index2 = randomNumber(0, population.length);
            const [child1, child2] = breedOffspring(population[index1].slice(0, population[index1].length - 1), population[index2].slice(0, population[index2].length - 1));
            population.push(child1.slice());
            population.push(child2.slice());
        }
        
        population.sort((a, b) => a[a.length - 1] - b[b.length - 1]);

        if (JSON.stringify(bestChromosome) !== JSON.stringify(population[0])){
            bestChromosome = population[0].slice();
            finish = 5;
        }

        if (i % 100 === 0){
            finish -= 1;
        }

        drawStuff(bestChromosome);

        if (finish === 0){
            drawPath(bestChromosome, "rgb(255,255,255)")
            break;
        }

        await waitAsync(0);
    }
}

function drawStuff(currPath) {
    
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawPath(currPath, "rgb(100,100,100)");

    context.fillStyle = "white";

    for (let i = 0; i < points.length; i++) {
        context.beginPath();
        context.arc(points[i][0], points[i][1], 15, 0, 2 * Math.PI, false);
        context.fill();
    }
}