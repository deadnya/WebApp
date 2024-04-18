"use strict";

const canvas = document.getElementById('canvas');

canvas.height = 1000;
canvas.width = 1000;

const ctx = canvas.getContext('2d');
ctx.scale(2, 2);
let canvasDots = [];

var usedColors = [];

let collorCentroid = [
    '#ff0000', '#ff3700', '#ff9100', '#fff200', '#b7ff00',
    '#59ff00', '#00ff1e', '#00ff80', '#00fbff', '#0099ff',
    '#0048ff', '#0400ff', '#6a00ff', '#dd00ff', '#ff0084'
];

let randSeeds = [
    Date.now() * Math.random(),
    Date.now() * Math.random() * 2,
    Date.now() * Math.random() * 3,
    Date.now() * Math.random() * 4,
    Date.now() * Math.random() * 5,
    Date.now() * Math.random() * 6,
    Date.now() * Math.random() * 7,
    Date.now() * Math.random() * 8,
    Date.now() * Math.random() * 9
];

var kMeansCentroids = [];
var cMeansCentroids = [];

var kMeansDistancesToCentroids = [];
var cMeansDistancesToCentroids = [];

var kMeansClusters = [];
var cMeansClusters = [];

shuffleArray(collorCentroid);

let clusterCount = 3;

canvas.onclick = function (event) {

    let x = event.offsetX;
    let y = event.offsetY;

    let dot = {
        dotx: x,
        doty: y,
        dotColor: 'white'
    }

    canvasDots.push(dot);

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, 2*Math.PI);
    ctx.stroke();   
    ctx.fill();

    return canvasDots;
}

function addCentroid(){

    let n = clusterCount;

    if (canvasDots.length < clusterCount){
        alert("Place more dots, min: " + clusterCount);
        return;
    }

    for (let i = 0; i < n; i++){

        let randomdot = Math.floor(splitmix32(randSeeds[i%10]) * canvasDots.length);

        let Centroid = {
            coardX: canvasDots[randomdot].dotx,
            coardY: canvasDots[randomdot].doty,
            collor: collorCentroid[i],
        };

        kMeansCentroids.push(Centroid);
    }

    for (let j = 0; j < n; j++){
        kMeansClusters.push([]);
    }

    return kMeansCentroids;
}

function showClusters(){
    for (let i = 0; i < canvasDots.length; i++) {

        let singleDotArry = [];

        for (let j = 0; j < kMeansCentroids.length; j++){

            let dotCoardX = canvasDots[i].dotx - kMeansCentroids[j].coardX;
            let dotCoardY = canvasDots[i].doty - kMeansCentroids[j].coardY;
            let vector = Math.pow((Math.pow(dotCoardX, 2) + Math.pow(dotCoardY, 2)), 0.5);
            singleDotArry.push(vector)
        }

        kMeansDistancesToCentroids.push(singleDotArry);
    }

    for (let i = 0; i < kMeansDistancesToCentroids.length; i++) {

        let min = kMeansDistancesToCentroids[i][0];
        let indexMin = 0;

        for (let j = 0 ; j < kMeansCentroids.length; j++){

            if (min > kMeansDistancesToCentroids[i][j]){
                min = kMeansDistancesToCentroids[i][j];
                indexMin = j;
            }
        }

        kMeansClusters[indexMin].push(canvasDots[i]);

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(canvasDots[i].dotx, canvasDots[i].doty, 10, 0, 2*Math.PI);
        ctx.fill(); 
        
        ctx.fillStyle = usedColors[indexMin];
        ctx.beginPath();
        ctx.arc(canvasDots[i].dotx, canvasDots[i].doty, 8, 0, 2*Math.PI);
        ctx.fill();
    }

    return kMeansClusters;
}

document.getElementById("step").onclick = main;

let fin = false;

function calcCentroids() {

    for (let i = 0; i < kMeansClusters.length; i++) {

        let sumX = 0;
        let sumY = 0;

        for (let j = 0; j < kMeansClusters[i].length; j++) {

            sumX = kMeansClusters[i][j].dotx + sumX;
            sumY = kMeansClusters[i][j].doty + sumY;
        }

        let sredX = sumX / kMeansClusters[i].length;
        let sredY = sumY / kMeansClusters[i].length;

        if ((sredX != kMeansCentroids[i].coardX || sredY != kMeansCentroids[i].coardY)){
            fin = true;
        }

        if (kMeansClusters[i].length !== 0) {

            kMeansCentroids[i].coardX = sredX;
            kMeansCentroids[i].coardY = sredY;
        }
    }

    kMeansDistancesToCentroids = [];

    for (let i = 0; i < kMeansClusters.length; i++) {
        kMeansClusters[i] = [];
    }
}

function kMeans(){

    if (addCentroid() == undefined) {
        return;
    }

    while (!fin){
        calcCentroids();
    }

    showClusters();
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(splitmix32(randSeeds[i%10]) * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function getRandomValues(size){
    let vals = [];
    let remains = 1;

    for (let i = 0; i < size - 1; i++){

        let value = splitmix32(randSeeds[i%10]) * remains;
        remains -= value;

        vals[i] = value;
    }

    vals[size - 1] = remains;

    shuffleArray(vals);

    return vals;
}

function cMeans(){

    cMeansClusters = [];

    for (let i = 0; i < clusterCount; i++){
        cMeansClusters.push([]);
    }

    for (let i = 0; i < canvasDots.length; i++){

        let vals = getRandomValues(clusterCount);

        for (let j = 0; j < clusterCount; j++){

            cMeansClusters[j].push(vals[j]);
        }
    }

    let clusterCentroids = [];

    for (let i = 0; i < clusterCount; i++){

        let sumX = 0;
        let sumY = 0;

        let div = 0;

        for (let j = 0; j < canvasDots.length; j++){

            sumX += canvasDots[j].dotx * Math.pow(cMeansClusters[i][j], 2);
            sumY += canvasDots[j].doty * Math.pow(cMeansClusters[i][j], 2);

            div += Math.pow(cMeansClusters[i][j], 2);
        }

        clusterCentroids.push({
            coardX: sumX / div, 
            coardY: sumY / div
        });
    }

    let changed = true;
    const LENIENCY = 0.01;

    while (changed){

        changed = false;

        cMeansDistancesToCentroids = [];

        for (let dotInd = 0; dotInd < canvasDots.length; dotInd++){

            cMeansDistancesToCentroids.push([]);

            for (let clusterInd = 0; clusterInd < cMeansClusters.length; clusterInd++){

                let dotCoardX = canvasDots[dotInd].dotx - clusterCentroids[clusterInd].coardX;
                let dotCoardY = canvasDots[dotInd].doty - clusterCentroids[clusterInd].coardY;
                let dist = Math.pow((Math.pow(dotCoardX, 2) + Math.pow(dotCoardY, 2)), 0.5);

                cMeansDistancesToCentroids[dotInd].push(dist);
            }
        }

        for (let dotInd = 0; dotInd < canvasDots.length; dotInd++){

            let newCoeffs = [];

            for (let clusterInd = 0; clusterInd < cMeansClusters.length; clusterInd++){

                let mainValue = cMeansDistancesToCentroids[dotInd][clusterInd];
                let newCoeff = 0;

                for (let valInd = 0; valInd < cMeansDistancesToCentroids[dotInd].length; valInd++){

                    newCoeff += Math.pow(mainValue / cMeansDistancesToCentroids[dotInd][valInd], 2);
                }

                newCoeff = Math.pow(Math.pow(newCoeff, 1 / cMeansClusters.length), -1);

                newCoeffs.push(newCoeff);
            }

            for (let clusterInd = 0; clusterInd < cMeansClusters.length; clusterInd++){

                if (Math.abs(cMeansClusters[clusterInd][dotInd] - newCoeffs[clusterInd]) >= LENIENCY){
                    changed = true;
                }

                cMeansClusters[clusterInd][dotInd] = newCoeffs[clusterInd];
            }
        }
    }

    for (let i = 0; i < canvasDots.length; i++) {

        let mn = cMeansClusters[0][i];
        let mnInd = 0;

        for (let j = 1; j < cMeansClusters.length; j++) {
            
            if (cMeansClusters[j][i] < mn){
                mn = cMeansClusters[j][i];
                mnInd = j;
            }
        }

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(canvasDots[i].dotx, canvasDots[i].doty, 20, 0, 2*Math.PI);
        ctx.fill(); 

        ctx.fillStyle = usedColors[mnInd];
        ctx.beginPath();
        ctx.arc(canvasDots[i].dotx, canvasDots[i].doty, 18, 0, 2*Math.PI);
        ctx.fill(); 
    }
}

function affinityPropagation() {

	let similarityMatrix = [];
	let responsibilityMatrix = [];
	let availabilityMatrix = [];
	let maxIterations = 600;
	let dempFactor = 0.95;
	let gamma = 1;
	let menDempFactor = 1 - dempFactor;

	start(similarityMatrix, availabilityMatrix, responsibilityMatrix, gamma);
	
	for (let m = 0; m < maxIterations; m++) {

		//update responsibility
		for (let i = 0; i < canvasDots.length; i++) {

			for (let k = 0; k < canvasDots.length; k++) {

				let maX ;
				let values =[];

				for (let kk = 0; kk < k; kk++) {
					values.push(similarityMatrix[i][kk] + availabilityMatrix[i][kk]);
				}

				for (let kk = k + 1; kk < canvasDots.length; kk++) {
					values.push(similarityMatrix[i][kk] + availabilityMatrix[i][kk]);
				}

				responsibilityMatrix[i][k] = (menDempFactor * (similarityMatrix[i][k] - Math.max(...values)) + dempFactor * responsibilityMatrix[i][k]);
			}
		}

		//update availability
		for (let i = 0; i < canvasDots.length; i++) {

			for (let k = 0; k < canvasDots.length; k++) {

				let sum = 0;

				if (i === k) {

					for (let ii = 0; ii < i; ii++) {
						sum += Math.max(0, responsibilityMatrix[ii][k]);
					}

					for (let ii = i + 1; ii < canvasDots.length; ii++) {
						sum += Math.max(0, responsibilityMatrix[ii][k]);
					}

					availabilityMatrix[i][k] = (menDempFactor * sum + dempFactor * availabilityMatrix[i][k]);

				}

                else {

                    let maxik, minik;
					
					if (i > k) {
						maxik = i;
						minik = k;
					}

                    else {
						maxik = k;
						minik = i;
					}

					for (let ii = 0; ii < minik; ii++) {
						sum += Math.max(0, responsibilityMatrix[ii][k]);
					}

					for (let ii = minik + 1; ii < maxik; ii++) {
						sum += Math.max(0, responsibilityMatrix[ii][k]);
					}

					for (let ii = maxik + 1; ii < canvasDots.length; ii++) {
						sum += Math.max(0, responsibilityMatrix[ii][k]);
					}

					availabilityMatrix[i][k] = (menDempFactor * Math.min(0, responsibilityMatrix[k][k]+sum) + dempFactor * availabilityMatrix[i][k]);

				}
			}
		}
	}

	for (let i = 0; i < canvasDots.length; i++) {
		console.log('r['+i+']['+i+'] =', responsibilityMatrix[i][i],'a['+i+']['+i+'] =', availabilityMatrix[i][i]);
	}

	//find the exemplar on the diagonal sum
	let exemplars = [];
	let center = [];

	for (let i = 0; i < canvasDots.length; i++) {

		exemplars[i] = (responsibilityMatrix[i][i] + availabilityMatrix[i][i]);

		if (exemplars[i] > 0) {
			center.push(i);
		}
	}

	//data point assignment, assignements[i] is the exemplar for data point i
	let assignements = [];
	
	for (let i = 0; i < canvasDots.length; i++) {

		let values = [];
		let index  = {};

		for (let j = 0; j < center.length; j++) {

			let c = center[j];

			values[j] = similarityMatrix[i][c];
			index[similarityMatrix[i][c]] = c;
		}

		assignements[i] = index[Math.max(...values)];
	}

    let likes = [];

    for (let i = 0; i < canvasDots.length; i++){
        likes.push(0);
    }

    for (let i = 0; i < assignements.length; i++){
        likes[assignements[i]]++;
    }

    let currColor = 0;
    let colors = [];

    for (let i = 0; i < likes.length; i++){
        if (likes[i] > 0) {

            colors.push({
                id: i,
                color: collorCentroid[currColor]
            });

            currColor++;
        }
    }

    for (let i = 0; i < assignements.length; i++){

        for (let j = 0; j < colors.length; j++){

            if (colors[j].id == assignements[i]){

                usedColors.push(colors[j].color);

                ctx.fillStyle = colors[j].color;
                ctx.beginPath();
                ctx.arc(canvasDots[i].dotx, canvasDots[i].doty, 30, 0, 2*Math.PI);
                ctx.fill(); 

                
            }
        }
    }
}

function eucDist(pos1, pos2) {

	console.log(pos1, pos2, 'cazzo');

	let d = Math.pow(pos1.dotx - pos2.dotx, 2) + Math.pow(pos1.doty - pos2.doty, 2);

	if (d === 0) {
		return 0;
	}
	
  	return d / (1 + d);
}

function start(similarityMatrix, availabilityMatrix, responsibilityMatrix, gamma) {
	//read data distances defining s inizializing it 
	//and set Availibility and Responsability to 0

	
	for (let i = 0; i < canvasDots.length; i++) {

		let pos1 = canvasDots[i];

		console.log(canvasDots[i])

		similarityMatrix[i] = [];
		availabilityMatrix[i] = [];
		responsibilityMatrix[i] = [];

		for (let j = 0; j < canvasDots.length; j++) {

			let pos2 = canvasDots[j];

			similarityMatrix[i][j] = -eucDist(pos1, pos2);
			availabilityMatrix[i][j] = 0;
			responsibilityMatrix[i][j] = 0;

		}
	}

	for (let k = 0; k < canvasDots.length; k++) {

		let avg = 0;

		for (var r = 0; r < canvasDots.length; r++) {
			avg += similarityMatrix[r][k];
		}

		similarityMatrix[k][k] = gamma * (avg / (canvasDots.length - 1));
	}
}

function main(){

    if (canvasDots.length < MIN_DOTS){
        alert("Min dots: 3");
        return;
    }

    usedColors = [];

    kMeansCentroids = [];
    cMeansCentroids = [];

    kMeansDistancesToCentroids = [];
    cMeansDistancesToCentroids = [];

    kMeansClusters = [];
    cMeansClusters = [];

    affinityPropagation();

    clusterCount = usedColors.length;

    cMeans();

    kMeans();
}

function splitmix32(a) {
    a |= 0;
    a = a + 0x9e3779b9 | 0;
    let t = a ^ a >>> 16;
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
}

const MIN_DOTS = 3;

document.getElementById("resetButt").onclick = function() {
    canvasDots = [];

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 1000, 1000);
};