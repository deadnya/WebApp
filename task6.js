"use strict";

//Network settings DO NOT CHANBGE
const IMG_DIMENSIONS = 50 * 50;
const HIDDEN_LAYER_1 = 240;
const HIDDEN_LAYER_2 = 240;


let index = 0;
let t_index = 0;

let fetched_images = undefined;
let fetched_labels = undefined;
let test_images = undefined
let test_labels = undefined;


class Matrix {

  //матрица x*y заполнена нулями
    constructor(rows, cols) {

      this.rows = rows;
      this.cols = cols;
      this.data = [];

      for (let i = 0; i < rows; i++) {

        this.data.push([]);

        for (let j = 0; j < cols; j++) {
          this.data[i][j] = 0;
        }
      }
    }

  //сложение
    static add(m1, m2) {

      let result = new Matrix(m1.rows, m1.cols);
  
      for (let i = 0; i < result.rows; i++) {
        for (let j = 0; j < result.cols; j++) {

          result.data[i][j] = m1.data[i][j] + m2.data[i][j];

        }
      }

      return result;
    }
  
  //вычитание
    static subtract(m1, m2) {
  
      let result = new Matrix(m1.rows, m1.cols);
  
      for (let i = 0; i < result.rows; i++) {
        for (let j = 0; j < result.cols; j++) {

          result.data[i][j] = m1.data[i][j] - m2.data[i][j];

        }
      }

      return result;
    }
  
  //матричное умножение
    static multiply(m1, m2) {
  
      let result = new Matrix(m1.rows, m2.cols);

      for (let i = 0; i < result.rows; i++) {

        result[i] = [];

        for (let j = 0; j < result.cols; j++) {

          let sum = 0;

          for (let k = 0; k < m2.rows; k++) {

            sum += m1.data[i][k] * m2.data[k][j];

          }

          result.data[i][j] = sum;
        }
      }

      return result;
    }
  
  //транспонирование
    static transpose(m) {

      let result = new Matrix(m.cols, m.rows);

      for (let i = 0; i < result.rows; i++) {

        for (let j = 0; j < result.cols; j++) {

          result.data[i][j] = m.data[j][i];

        }
      }

      return result;
    }
  
  //почленное умножение
    static el_multiply(m1, m2) {
  
      let result = new Matrix(m1.rows, m1.cols);

      for (let i = 0; i < result.rows; i++) {

        for (let j = 0; j < result.cols; j++) {

          result.data[i][j] = m1.data[i][j] * m2.data[i][j];

        }
      }

      return result;
    }
  
  //матрица из массива
    static fromArray(array) {

      let result = new Matrix(array.flat().length, 1);

      for (let i = 0; i < array.flat().flat().length; i++) {

        result.data[i][0] = array.flat().flat()[i];

      }

      return result;
    }
  
  //массив из матрицы
    static toArray(m) {

      let result = m.data.flat();
      return result;

    }
  
  //кастом, применяющий функцию ко всем элементам матрицы
    map(func) {

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {

          let val = this.data[i][j];
          this.data[i][j] = func(val);

        }
      }
    }
  
  //умножение матрицы на число
    scale(num) {

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {

          this.data[i][j] *= num;

        }
      }
    }
  
  //прибавление числа к матрице
    add(num) {

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {

          m1.data[i][j] += num;

        }
      }
    }
  
  //присваивает матрицу
    fill(data) {

      this.data = data;

    }
  
  //обнуляет матрицу
    reset() {

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {

          this.data[i][j] = 0;

        }
      }
    }
  
  //рандомизирует матрицу
    randomize() {

      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {

          this.data[i][j] = Math.random() * 2 - 1;

        }
      }
    }
  
  //выводит матрицу
    print() {
      console.table(this.data);
    }
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}
  
function dsigmoid(y) {
  return y * (1 - y);
}
  
function normalize(x) {
  return x / 255;
}
  
class NeuralNetwork {

  constructor(inputLength, HD1_length, HD2_length, outputLength, data = null) {

    this.inputLength = inputLength;
    this.HD1_length = HD1_length;
    this.HD2_length = HD2_length;
    this.outputLength = outputLength;
  
    // веса
    this.weights_IN_HD1 = new Matrix(HD1_length, inputLength);
    this.weights_HD1_HD2 = new Matrix(HD2_length, HD1_length);
    this.weights_HD2_OUT = new Matrix(outputLength, HD2_length);
  
    // сдвиги
    this.bias_HD1 = new Matrix(HD1_length, 1);
    this.bias_HD2 = new Matrix(HD2_length, 1);
    this.bias_OUT = new Matrix(outputLength, 1);
  
  if (data === null) {

    // изначальные веса генерируются случайно
    this.weights_IN_HD1.randomize();
    this.weights_HD1_HD2.randomize();
    this.weights_HD2_OUT.randomize();
    this.bias_HD1.randomize();
    this.bias_HD2.randomize();
    this.bias_OUT.randomize();

  } else {

    // посчитанные веса берутся из данных
    this.weights_IN_HD1.fill(data[0][0]);
    this.weights_HD1_HD2.fill(data[0][1]);
    this.weights_HD2_OUT.fill(data[0][2]);
    this.bias_HD1.fill(data[1][0]);
    this.bias_HD2.fill(data[1][1]);
    this.bias_OUT.fill(data[1][2]);
        
  }
  
    //скорость обучения
    this.lr = 0.01;
  }

  feedForward(inputsArray) {

    // на вход нейронка получает массив пикселей
  
    // перевод из массива в матрицу
    let inputs = Matrix.fromArray(inputsArray);

    // перевод в яркость от 0 до 1
    inputs.map(normalize);
  
    // вычисление первого скр. слоя
    let HD1 = Matrix.multiply(this.weights_IN_HD1, inputs);
    HD1 = Matrix.add(HD1, this.bias_HD1);
    HD1.map(sigmoid);
  
    // вычисление второго скр. слоя
    let HD2 = Matrix.multiply(this.weights_HD1_HD2, HD1);
    HD2 = Matrix.add(HD2, this.bias_HD2);
    HD2.map(sigmoid);
  
    // вычисление выходных нейронов
    let outputs = Matrix.multiply(this.weights_HD2_OUT, HD2);
    outputs = Matrix.add(outputs, this.bias_OUT);
    outputs.map(sigmoid);
  
    //перевод обратно в массив
    let outputs_array = Matrix.toArray(outputs);
  
    return outputs_array;
  }
  
  train(inputsArray, desiredArray) {

    // при обучении необходимо скормить нейронке картинку
    // и подсказать на сколько выходные данные отличаются от нужных
  
    let inputs = Matrix.fromArray(inputsArray);
    inputs.map(normalize);
  
    let HD1 = Matrix.multiply(this.weights_IN_HD1, inputs);
    HD1 = Matrix.add(HD1, this.bias_HD1);
    HD1.map(sigmoid);
  
    let HD2 = Matrix.multiply(this.weights_HD1_HD2, HD1);
    HD2 = Matrix.add(HD2, this.bias_HD2);
    HD2.map(sigmoid);
  
    let outputs = Matrix.multiply(this.weights_HD2_OUT, HD2);
    outputs = Matrix.add(outputs, this.bias_OUT);
    outputs.map(sigmoid);
  
    // обратное распространение ошибки
  
    // посчитать ошибку ERROR = DESIRED - OUTPUT
    let desired = Matrix.fromArray(desiredArray);
    let outputErrors = Matrix.subtract(desired, outputs);
  
    let weights_HD2_OUT_T = Matrix.transpose(this.weights_HD2_OUT);
    let HD2_errors = Matrix.multiply(weights_HD2_OUT_T, outputErrors);
  
    let weights_HD1_HD2_T = Matrix.transpose(this.weights_HD1_HD2);
    let HD1_errors = Matrix.multiply(weights_HD1_HD2_T, HD2_errors);
  
    // градиентный спуск

    outputs.map(dsigmoid);

    let weights_HD2_OUT_gradient = Matrix.el_multiply(outputErrors, outputs);
    weights_HD2_OUT_gradient.scale(this.lr);
    this.bias_OUT = Matrix.add(this.bias_OUT, weights_HD2_OUT_gradient);

    let HD2_T = Matrix.transpose(HD2);
    let weights_HD2_OUT_deltas = Matrix.multiply(weights_HD2_OUT_gradient, HD2_T);
    this.weights_HD2_OUT = Matrix.add(this.weights_HD2_OUT, weights_HD2_OUT_deltas);
  

    HD2.map(dsigmoid);

    let weights_HD1_HD2_gradient = Matrix.el_multiply(HD2_errors, HD2);
    weights_HD1_HD2_gradient.scale(this.lr);
    this.bias_HD2 = Matrix.add(this.bias_HD2, weights_HD1_HD2_gradient);

    let HD1_T = Matrix.transpose(HD1);
    let weights_HD1_HD2_deltas = Matrix.multiply(weights_HD1_HD2_gradient, HD1_T);
    this.weights_HD1_HD2 = Matrix.add(this.weights_HD1_HD2, weights_HD1_HD2_deltas);
  

    HD1.map(dsigmoid);

    let weights_IN_HD1_gradient = Matrix.el_multiply(HD1_errors, HD1);
    weights_IN_HD1_gradient.scale(this.lr);
    this.bias_HD1 = Matrix.add(this.bias_HD1, weights_IN_HD1_gradient);

    let inputs_T = Matrix.transpose(inputs);
    let weights_IN_HD1_deltas = Matrix.multiply(weights_IN_HD1_gradient, inputs_T);
    this.weights_IN_HD1 = Matrix.add(this.weights_IN_HD1, weights_IN_HD1_deltas);
  }

  get data() {
    let weights = [];
    weights.push(
      this.weights_IN_HD1.data,
      this.weights_HD1_HD2.data,
      this.weights_HD2_OUT.data
    );

    let biases = [];
    biases.push(this.bias_HD1.data, this.bias_HD2.data, this.bias_OUT.data);
  
    let data = [];
    data.push(weights, biases);
  
    return JSON.stringify(data);
  }
}

function request(req){
  if (req === 'reset'){
    index = 0;
    t_index = 0;
    return;
  }

  if (req === 'train'){
    let val = JSON.stringify([fetched_images[index], fetched_labels[index]]);
    index++;
    return val;
  }

  if (req === 'test'){
    let val = JSON.stringify([test_images[t_index], test_labels[t_index]]);
    t_index++;
    return val;
  }
}

function resize(image){

  let newImage = [];

  for (let i = 0; i < 50; i++){

    let row = [];

    for (let j = 0; j < 50; j++){

      let srcI = Math.round(28 / 50 * i);
      let srcJ = Math.round(28 / 50 * j);

      row.push(image[srcI][srcJ]);

    }

    newImage.push(row);
  }

  return newImage;
}

/*
function readFile(path) {

  return new Promise(function (resolve, reject) {

    fs.readFile(path, { encoding: "utf-8" }, (err, data) => {

      if (err) reject(err);
      else resolve(data);

    });
  });
}

function inputIntoJson(path, data) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(path, data, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function trainModel(){

  var startTime = process.hrtime();
  var precision = 3;
  var elapsed = process.hrtime(startTime)[1] / 1000000;

  let images_path = "C:\\Users\\deadnya\\Desktop\\WebApp\\samples\\json\\train-images.json";
  let labels_path = "C:\\Users\\deadnya\\Desktop\\WebApp\\samples\\json\\train-labels.json";
  let test_images_path = "C:\\Users\\deadnya\\Desktop\\WebApp\\samples\\json\\test-images.json";
  let test_labels_path = "C:\\Users\\deadnya\\Desktop\\WebApp\\samples\\json\\test-labels.json";
  
  fetched_images = await readFile(images_path);
  fetched_labels = await readFile(labels_path);
  test_images = await readFile(test_images_path);
  test_labels = await readFile(test_labels_path);
  fetched_images = JSON.parse(fetched_images);
  fetched_labels = JSON.parse(fetched_labels);
  test_images = JSON.parse(test_images);
  test_labels = JSON.parse(test_labels);
  
  let nn = new NeuralNetwork(IMG_DIMENSIONS, HIDDEN_LAYER_1, HIDDEN_LAYER_2, 10);

  for (let i = 0; i < 60000; i++) {
  
    let data = JSON.parse(request('train'));
    let input = data[0];
    let desired = Array(10).fill(0);
    desired[data[1]] = 1;

    input = resize(input);

    nn.train(input, desired);

    if (true) {
      console.log("Epoch: " + (i + 1) + ", " + process.hrtime(startTime)[0] + "s elapsed");
    }

  }

  let correct = 0;
  for (let i = 0; i < 10000; i++) {
      
    let data = JSON.parse(request('test'));
    let inputs = data[0];
    let desired = Array(10).fill(0);
    desired[data[1]] = 1;

    inputs = resize(inputs);

    let outputs = nn.feedForward(inputs);

    let temp = outputs[0];
    let guess = 0;

    for (let j = 0; j < outputs.length; j++) {

      if (outputs[j] > temp) {
        temp = outputs[j];
        guess = j;
      }
    }

    let target = desired.indexOf(1);

    if (guess === target) {
      correct++;
    }

    if (true) {
      console.log("Test: " + (i + 1) + ", " + process.hrtime(startTime)[0] + "s elapsed");
    }
  }

  let accuracy = correct / 10000;

  console.log(`Accuracy: ${accuracy * 100}%`);

  await inputIntoJson(
    "C:\\Users\\deadnya\\Desktop\\WebApp\\samples\\json\\model.json",
    JSON.stringify(nn.data)
  );
}

trainModel();

*/

let modelData = neuroNetModel;

const canvas = document.getElementById("canvas");
const resetButton = document.getElementById("reset");
const CELL_COUNT = 50;
const CELL_SIZE = 10;
const width = CELL_SIZE * CELL_COUNT;
const height = CELL_SIZE * CELL_COUNT;
const PEN_SIZE = 20;

const context = canvas.getContext("2d", {willReadFrequently: true});
context.imageSmoothingEnabled = true;
context.imageSmoothingQuality = "high";

canvas.height = height;
canvas.width = width;

let drawing = false;

function startDrawing(elem){
  drawing = true;
  draw(elem);
}

function endDrawing(){
  drawing = false;
  scale();
  main();
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

    for (let currX = x - PEN_SIZE; currX <= x + PEN_SIZE; currX += CELL_SIZE){
      for (let currY = y - PEN_SIZE; currY <= y + PEN_SIZE; currY += CELL_SIZE){
        
        let cellX = currX + CELL_SIZE / 2;
        let cellY = currY + CELL_SIZE / 2;
        
        const calcX = x + CELL_SIZE / 2;
        const calcY = y + CELL_SIZE / 2;

        const dist = Math.sqrt(Math.pow(cellX - calcX, 2) + Math.pow(cellY - calcY, 2));

        if (dist < PEN_SIZE){

          let p = context.getImageData(cellX - CELL_SIZE / 2, cellY - CELL_SIZE / 2, 1, 1);

          let color = rgbToHex(
            Math.max(Math.min(Math.floor(255 - (Math.sqrt(dist / PEN_SIZE) * 255)) + p.data[0], 255), p.data[0]),
            Math.max(Math.min(Math.floor(255 - (Math.sqrt(dist / PEN_SIZE) * 255)) + p.data[1], 255), p.data[1]),
            Math.max(Math.min(Math.floor(255 - (Math.sqrt(dist / PEN_SIZE) * 255)) + p.data[2], 255), p.data[2])
          );

          
          cellX = Math.min(Math.max(Math.floor(currX / CELL_SIZE), 0), width);
          cellY = Math.min(Math.max(Math.floor(currY / CELL_SIZE), 0), height);

          fillCell(cellX, cellY, color);

        }
      }
    }
  }
}

function fillCell(cellX, cellY, color){
  const startX = cellX * CELL_SIZE;
  const startY = cellY * CELL_SIZE;

  context.fillStyle = color;
  context.fillRect(startX, startY, CELL_SIZE, CELL_SIZE);
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", endDrawing);
canvas.addEventListener("mousemove", draw);

const s_canvas = document.getElementById("scaled_canvas");
s_canvas.width = 50;
s_canvas.height = 50;
const scaledContext = s_canvas.getContext("2d");

function scale() {
  scaledContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 50, 50);
}

function getImageData() {
  return scaledContext.getImageData(0, 0, s_canvas.width, s_canvas.height);
}

document.getElementById("reset").addEventListener("click", () => {
  reset_canvas();
});

function main() {

  let { data } = getImageData();
  let image = [];

  for (let i = 0; i < data.length; i += 4) {
    let value = data[i];
    image.push(value);
  };

  let inputs = convertTo2D(image, 50);

  let inp = getResizedImage(inputs);

  let nn = new NeuralNetwork(IMG_DIMENSIONS, HIDDEN_LAYER_1, HIDDEN_LAYER_2, 10, modelData);
  let outputs = nn.feedForward(inp);

  for (let i = 0; i < outputs.length; i++) {

    let div = document.getElementById("digval_" + i.toString());
    div.style.width = 400 * outputs[i] + 'px';
  }
}

main();

function convertTo2D(input, size) {

  let result = [];

  for (let i = 0; i < size; i++){
    result[i] = [];

    for (let j = 0; j < size; j++){
      result[i][j] = input[i * size + j];
    }
  }

  return result;
}


function closerImage(input, flag) {

  let result = {startX: input[0].length, endX: -1, startY: input.length, endY: -1};

  for (let i = 0; i < input.length; ++i) {
      for (let j = 0; j < input[0].length; ++j) {
          if (input[i][j] > flag) {
            result.startX = Math.min(result.startX, j);
            result.startY = Math.min(result.startY, i);
            result.endX = Math.max(result.endX, j);
            result.endY = Math.max(result.endY, i);
          }
      }
  }
  return result;
}

function findCenterMass(input) {

  let result = {x: 0, y: 0};
  let sumX = 0;
  let sumY = 0;
  let sumPixels = 0;

  for (let i = 0; i < input.length; ++i) {
    for (let j = 0; j < input[0].length; ++j) {

      let pixel = input[i][j];

      sumPixels += pixel;
      sumY += i * pixel;
      sumX += j * pixel;
    }
  }

  result.y = Math.round(sumY/sumPixels);
  result.x = Math.round(sumX/sumPixels);

  return result;
}

function getResizedImage(input) {

  let imageEdges = closerImage(input, 0.01);
  let massCenter = findCenterMass(input);

  let canvasCopy = document.createElement("canvas");
  canvasCopy.width = input[0].length;
  canvasCopy.height = input.length;

  let copyContext = canvasCopy.getContext("2d");
  let scaling = 40 / Math.max(imageEdges.endX + 1 - imageEdges.startX, imageEdges.endY + 1 - imageEdges.startY);

  copyContext.translate(s_canvas.width / 2, s_canvas.height / 2);
  copyContext.scale(scaling, scaling);
  copyContext.translate(-s_canvas.width / 2, -s_canvas.height / 2);
  copyContext.translate((25 - massCenter.x), (25 - massCenter.y));
  copyContext.drawImage(s_canvas, 0, 0);
  let { data } = copyContext.getImageData(0, 0, s_canvas.width, s_canvas.height);

  scaledContext.fillStyle = "black";
  scaledContext.fillRect(0, 0, 50, 50);
  scaledContext.drawImage(canvasCopy, 0, 0);

  let image = [];

  for (let i = 0; i < data.length; i += 4) {
    let value = data[i];
    image.push(value);
  };

  canvasCopy.remove();
  return image;
}

function reset_canvas() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);
  main();
}
