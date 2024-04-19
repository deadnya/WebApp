"use strict";

//наш узелочек
class TreeNode {

    constructor (data, name) {

        this.value;
        this.valuePercentage = undefined;
        this.decisionMaker;
        this.data = data;
        this.name = name;
        this.childNodes = [];
        this.parent;
        this.visited = false;
        this.isleaf = false;
        this.a;
        this.finalA = undefined;

    };
    
    isLeaf() {

        if (this.childNodes === undefined || this.childNodes.length === 0) return true; 
        return false;

    }
}

let optimizeCount = 0;

//мейн функция оптимизации
function optimizeTree(currNode) {

    optimizeCount++;

    let allChildNodesSame = true;
    let curVal = undefined;

    if (currNode.childNodes.length <= 0) {
        return;
    }

    for (let i = 0; i < currNode.childNodes.length; i++) {

        if (currNode.childNodes[i].valuePercentage < 1) {
            allChildNodesSame = false;
            break;
        }
    }

    for (let i = 0; i < currNode.childNodes.length; i++) {

        if (curVal !== undefined) {

            if (currNode.childNodes[i].value !== curVal) {

                allChildNodesSame = false;
                break;
            }

            curVal = currNode.childNodes[i].value;
        }

        else {
            curVal = currNode.childNodes[i].value;
        }
    }
    
    //типа если выбор ничо не значит то и ноды ниче не значат
    if (allChildNodesSame) {

        if (currNode.childNodes.length > 0) {

            currNode.value = currNode.childNodes[0].value;
            currNode.valuePercentage = currNode.childNodes[0].valuePercentage;
            currNode.childNodes = [];
            currNode.isleaf = true;
        }
    }
    
    else {

        for (let i = 0; i < currNode.childNodes.length; i++) {
            optimizeTree(currNode.childNodes[i]);
        }
    }
}

//парсинг даты
function recieveData(csvText, sep = ","){

    let matrix = [];
    let csvLines = csvText.split('\n');

    for(let i = 0; i < csvLines.length - 1; i++){

        let line = csvLines[i];
        let cells = line.split(sep);

        let currRow = [];

        for(let j = 0; j < cells.length; j++){

            cells[j] = cells[j].trim();

            if (cells[j].length === 0 || cells[j] === undefined) {
                alert("Your CSV request has blank spaces!");
                return;
            }

            currRow.push(cells[j]);
        }

        matrix.push(currRow);   
    }

    return matrix;
}

//чисто создание руты
function startTreeBuilding(matrix) {
    
    root = new TreeNode(matrix, "root");

    buildTree(root);
}

//постройение три
function buildTree (node) {

    let splittingParameter = chooseSplittingParameter(node.data);
    node.value = splittingParameter["data"]["value"]["maxValue"];

    node.valuePercentage = splittingParameter["data"]["value"]["sure"];
    node.decisionMaker = splittingParameter["feature"];

    for (let featureVal in splittingParameter["data"]["arrays"]) {

        let treeNode = new TreeNode(splittingParameter["data"]["arrays"][featureVal]["array"], featureVal);
        treeNode.parent = node;

        if (treeNode.data[0].length > 2 && splittingParameter["data"]['entropy'] !== 999) {
            buildTree(treeNode);
        }
        
        else {

            treeNode.isleaf = true;
            treeNode.valuePercentage = 1;
            treeNode.value = treeNode.data[1][treeNode.data[1].length - 1];
        }

        node.childNodes.push(treeNode);
    }
}

//выбираем куда идти дальше (при траверсе)
function makeDecision() {

    let string = document.getElementById('inputData').value;
    let array = string.split(",");

    for (let i = 0; i < array.length; i++) {
        array[i] = array[i].trim();
    }

    let currentNode = rootMemory;
    let counter = root.data[0].length;

    while (currentNode !== undefined) {

        if (!currentNode.visited) {

            setColor('rgb(40, 40, 40)', currentNode);

            if (currentNode.finalA !== undefined) {
				setColorForLeaf('rgb(40, 40, 40)', currentNode.finalA);
			}
        }

        if (doubleDecision(currentNode, array) !== -1) {
            currentNode = currentNode.childNodes[doubleDecision(currentNode, array)];
        }
        
        else if (currentNode !== undefined) {

            for (let j = 0; j < currentNode.childNodes.length; j++) {

                if (array.includes(currentNode.childNodes[j].name) ||
                    currentNode.decisionMaker === root.data[0][root.data[0].length - 1] ||
                    currentNode.decisionMaker === root.data[0][root.data]) {
                    
                    currentNode = currentNode.childNodes[j];
                    break;
                }
            } 
        }

        if (currentNode !== undefined &&
            currentNode.name !== "root" &&
            currentNode.parent.decisionMaker === root.data[0][root.data[0].length-1] &&
            !currentNode.visited) {

            currentNode.visited = true;

            setColor('rgb(40, 40, 40)', currentNode);
            break;
        }

        counter--;

        if (counter < 0) {
            alert("Inappropriate request!");
            break;
        }
    }
}

function setColor(RGB, node) {

    let rgb = getRGB(RGB);

    if (node.a !== undefined) {
        node.a.style.backgroundColor = 'rgb('+ rgb[0] +','+ rgb[1] +','+ rgb[2] +')';
    }
}

function setColorForLeaf(RGB, finalA) {

    let rgb = getRGB(RGB);
    finalA.style.backgroundColor = 'rgb('+ rgb[0] +','+ rgb[1] +','+ rgb[2] +')';
}

function getRGB(str){

    let regex = /\d{1,3}/;
    let rgb = [];

    for (let i = 0; i < 3; i++) {

        rgb[i] = parseFloat(regex.exec(str));
        str = str.replace(regex, "")
    }

    return rgb;
}

function doubleDecision(currentNode, array) {

    if (currentNode !== undefined && currentNode.childNodes[0] !== undefined) {

        if (currentNode.childNodes[0].name[0] === "<") {

            let num = currentNode.childNodes[0].name;
            num = num.replace('<', '');

            for (let j = 0; j < array.length; j++) {

                if (!isNaN(parseFloat(array[j]))) {

                    if (parseFloat(array[j]) < parseFloat(num))  {
                        return 0;
                    }
                    
                    else {
                        return 1;
                    }
                }
            }
        }
        
        else {
            return -1;
        }
    }
    
    return;
}


function chooseSplittingParameter(matrix) {

    let featuresList = {};

    for (let i = 1; i < matrix.length; i++){
        celSet.add(matrix[i][matrix[i].length - 1]);
    }

    let currValue = decisionValue();

    for (let j = 0; j < matrix[0].length - 1; j++) {

        let featureDict = {};

        featureDict["isDouble"] = (isDouble(j));
        featureDict["entropy"] = undefined;
        featureDict["value"] = currValue;

        if (featureDict["isDouble"] === true) {

            let doubleResult = doubleData(j);

            featureDict["entropy"] = doubleResult["entropy"];

            if (featureDict["entropy"] !== 999) {

                let leftName = "<" + doubleResult["splittingParameter"], rightName = ">=" + doubleResult["splittingParameter"];

                featureDict["arrays"] = [];
                featureDict["arrays"][leftName] = {"array" : []};
                featureDict["arrays"][rightName] = {"array" : []};

                let il = 0, ir = 0;

                for (let i = 1; i < matrix.length; i++) {

                    if (i === doubleResult["indexes"]["leftIndexes"][il] + 1) {
                        featureDict["arrays"][leftName]["array"].push(matrix[i]);
                        il++;
                    }
                    
                    else {
                        featureDict["arrays"][rightName]["array"].push(matrix[i]);
                        ir ++;
                    }
                }

                if (featureDict["arrays"][leftName]["array"].length < 2) {
                    featureDict["arrays"].splice(leftName, 1);
                }

                if (featureDict["arrays"][rightName]["array"].length < 2) {
                    featureDict["arrays"].splice(rightName, 1);
                }

                featureDict["arrays"][leftName]["array"].splice(0, 0, matrix[0]);
                featureDict["arrays"][rightName]["array"].splice(0, 0, matrix[0]);
            }
        }
        
        else {

            featureDict["entropy"] = 0;
            featureDict["arrays"] = [];

            for (let i = 1; i < matrix.length; i++) {
            
                let featureVal = matrix[i][j];
                let celVal = matrix[i][matrix[0].length - 1];

                if (featureDict["arrays"][featureVal] === undefined) {

                    let celDict = {};

                    for (let val of celSet){
                        celDict[val] = 0;
                    }

                    celDict["array"] = [];
                    featureDict["arrays"][featureVal] = celDict;
                }

                featureDict["arrays"][featureVal][celVal] += 1;
                let neededArray = new Array(matrix[i].length);

                for (let k = 0; k < matrix[i].length; k++) {
                    neededArray[k] = matrix[i][k];
                }

                neededArray.splice(j, 1);
                
                featureDict["arrays"][featureVal]["array"].push(neededArray);
            }

            let neededArray = new Array(matrix[0].length);

            for (let k = 0; k < matrix[0].length; k ++) {
                neededArray[k] = matrix[0][k];
            }

            neededArray.splice(j, 1);

            for (let featureVal in featureDict["arrays"]) {
                featureDict["arrays"][featureVal]["array"].splice(0, 0, neededArray);
            }

            featureDict["entropy"] += stringEntropy(j, featureDict);
        }

        featuresList[ matrix[0][j]] = { "data" : featureDict, "feature" : matrix[0][j]};
    }

    let finalEntropy = 1000;
    let finalDecisionMaker = undefined;

    for (let feature in featuresList) {

        if (featuresList[feature]["data"]["entropy"] < finalEntropy) {
            finalEntropy = featuresList[feature]["data"]["entropy"];
            finalDecisionMaker = featuresList[feature];
        }

    }

    return finalDecisionMaker;

    function getBaseLog(base, num) {

        if (num === 0 || base === 0) return 0;
        return Math.log(num) / Math.log(base);
    }

    function doubleData(columnIngex) {

        class NumElem {

            constructor(value, celElem) {
                this.value = parseFloat(value);
                this.celElem = celElem;
            }

        };

        let numsSorted = [];
        let nums = []

        for (let i = 1; i < matrix.length; i++) {
            
            nums.push(new NumElem(
                matrix[i][columnIngex],
                matrix[i][matrix[0].length - 1]
            ));

            numsSorted.push(new NumElem(
                matrix[i][columnIngex],
                matrix[i][matrix[0].length - 1]
            ));
        }
        
        numsSorted.sort((a,b) => a.value -b.value);

        deleteCopies(numsSorted);
        
        let part1 = [], part2 = [];

        for (let i = 1; i < numsSorted.length; i++) {
            part2.push(numsSorted[i]);
        }

        part1.push(numsSorted[0]);

        let finalEntropy = 999;
        let borderIndex = undefined;

        for (let i = 1; i < numsSorted.length; i++) {

            if (numsSorted[i].celElem !== numsSorted[i-1].celElem) {

                let currEntropy =
                    part1.length / numsSorted.length * doubleEntropy(part1) +
                    part2.length / numsSorted.length * doubleEntropy(part2);

                if (currEntropy < finalEntropy) {
                    finalEntropy = currEntropy;
                    borderIndex = i;
                }
            }

            part2.splice(0, 1);
            part1.push(numsSorted[i]);
        }

        let result = {};

        result["entropy"] = finalEntropy;
        result["indexes"] = {"rightIndexes" : [], "leftIndexes" : []};

        if (borderIndex === undefined) {
            borderIndex = 1;
        }

        if (numsSorted.length < 2) {
            return result;
        }

        result["splittingParameter"] = (numsSorted[borderIndex].value + numsSorted[borderIndex - 1].value) / 2;

        for (let i = 0; i < nums.length; ++i) {

            if (nums[i].value < result["splittingParameter"]) {
                result["indexes"]["leftIndexes"].push(i);
            }
            
            else {
                result["indexes"]["rightIndexes"].push(i);
            }
        }

        return(result);
    }

    //удаляем копеи
    function deleteCopies(numsSorted) {

        for (let i = 1; i < numsSorted.length; ++i) {

            if (numsSorted[i - 1].value === numsSorted[i].value) {

                if (numsSorted[i - 1].celVal === numsSorted[i].celVal) {
                    numsSorted.splice(i, 1);
                    i--;
                }
            }
        }
    }

    //энтропи
    function stringEntropy(featureNum, featureDict) {

        let finalEntropy = 0;
        
        let size = 0;
        
        for (let val in featureDict["arrays"]) {
            size += featureDict["arrays"][val]["array"].length;
        }
        
        for (let val in featureDict["arrays"]) {

            for (let celVal of celSet){

                finalEntropy -=
                    (featureDict["arrays"][val][celVal] / size) *
                    getBaseLog(2, featureDict["arrays"][val][celVal] / size) *
                    featureDict["arrays"][val]["array"].length / size;
            }
        }

        return finalEntropy;
    }

    //лабл энтропи
    function doubleEntropy (nums) {

        let cels = {};

        for (let val of celSet){
            cels[val] = 0;
        }

        for (let i = 0; i < nums.length; i++) {
            cels[nums[i].celElem] += 1;
        }

        let localEntropy = 0;

        for (let val of celSet){
            localEntropy -= (cels[val] / nums.length) * getBaseLog(2, cels[val] / nums.length);
        }

        return localEntropy;
    }

    //по чему выбираем
    function decisionValue() {

        let celDict = {};
        let maxCount = -1;
        let maxVal = undefined;

        for (let val of celSet){
            celDict[val] = 0;
        }

        for (let i = 1; i < matrix.length; i++) {
            celDict[matrix[i][matrix[0].length - 1]]++;
        }
        
        let sure = 0;

        for (let val of celSet) {

            if (celDict[val] > maxCount) {
                maxVal = val;
                maxCount = celDict[val];
                sure = celDict[val] / (matrix.length - 1);
            }
        }

        let value = {"maxValue": maxVal, "sure": sure};
        return value;
    }

    function isDouble(columnIngex) {

        for (let i = 1; i < matrix.length; ++ i) {

            if (isNaN(parseFloat(matrix[i][columnIngex]))) {
                return false;
            }
        }

        return true;
    }
}

//чото
startButton.addEventListener('click', start);
resetButton.addEventListener('click', reset);
getFileButton.addEventListener('click', createTree);
optimizeButton.addEventListener('click', optimize);
const FILE = document.getElementById('fileInput');

let flag = true;
let root;
let rootMemory;
let celSet = new Set();

let treeRoot = document.getElementById("root");

//создать дерево
function createTree() {

    treeRoot = removeTree();

    if (FILE.value === '') {
        alert("CSV file is not added!");
        return;
    }

    else {

        let dataBase = FILE.files[0];

        let reader = new FileReader();
        reader.readAsText(dataBase);

        reader.onload = function () {
            dataBase = recieveData(reader.result);
            startTreeBuilding(dataBase);
            drawTree(root, treeRoot);
        }
    }

    flag = true;
} 

function start() {
    if (flag) makeDecision();
}

function reset() {
    treeRoot = removeTree(treeRoot);
}

//рисовать дерево
function drawTree(currentNode, treeElement) {

    rootMemory = root;

    let li = document.createElement("li");
    let a = document.createElement("a");
    currentNode.a = a;

    let nodeName = currentNode.name;

    if (nodeName === "root") {
        a.textContent = nodeName;
    }

    else {
        let feature = currentNode.parent.decisionMaker;
        a.textContent = feature + " - " + nodeName;
    }
    
    li.appendChild(a);
    treeElement.appendChild(li);

    if (currentNode.isleaf || currentNode.isLeaf()) { 

        let finalUl = document.createElement("ul");
        let finalLi = document.createElement("li");
        let finalA = document.createElement("a");

        finalA.textContent = currentNode.value;
        currentNode.finalA = finalA;

        finalLi.appendChild(finalA);
        finalUl.appendChild(finalLi);

        li.appendChild(finalUl);

        return;
    }

    let ul = document.createElement("ul");
    li.appendChild(ul);

    for (let i = 0; i < currentNode.childNodes.length; i++) {
        drawTree(currentNode.childNodes[i], ul);
    }
}

//начало оптимизации
function optimize() {

    if (flag) {

        if (FILE.value === '') {
            alert("CSV file is not added!");
            return;
        }
        
        else {

            let data = FILE.files[0];
            let reader = new FileReader();
            reader.readAsText(data);

            reader.onload = function () {
                data = recieveData(reader.result);
                root = new TreeNode(data, 'root');
            }
        }

        buildTree(root);
        optimizeTree(root);
        document.getElementById("root").innerHTML = "";
        drawTree(root, treeRoot);
    }
}

//удаление дерева
function removeTree() {

    let divTree = document.getElementById("tree");
    treeRoot.remove();

    let ul = document.createElement("ul");
    ul.setAttribute('id', 'root')
    divTree.appendChild(ul);
    return ul;
}

//двигать дерево
const scrollContainer = document.getElementById('tree');
let isScrolling = false;
let startX, startY, scrollLeft, scrollTop;

scrollContainer.addEventListener('mousedown', (e) => {
    isScrolling = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    startY = e.pageY - scrollContainer.offsetTop;
    scrollLeft = scrollContainer.scrollLeft;
    scrollTop = scrollContainer.scrollTop;
});

scrollContainer.addEventListener('mouseleave', () => {
    isScrolling = false;
});

scrollContainer.addEventListener('mouseup', () => {
    isScrolling = false;
});

scrollContainer.addEventListener('mousemove', (e) => {
    if (!isScrolling) return;

    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const y = e.pageY - scrollContainer.offsetTop;
    const moveX = (x - startX) * 2;
    const moveY = (y - startY) * 2;
    scrollContainer.scrollLeft = scrollLeft - moveX;
    scrollContainer.scrollTop = scrollTop - moveY;
});