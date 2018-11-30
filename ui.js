/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tf from '@tensorflow/tfjs';

const CONTROLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

export function init() {
  document.getElementById('cam').style.display = '';
  document.getElementById('saign-logo').style.display = '';
  document.getElementById('controller').classList.add('show');
  statusElement.style.display = 'none';
}

export function numClasses() {
  return CONTROLS.length;
}

let html = '';
CONTROLS.forEach((control) => {
  html += `
  <div class="panel-cell panel-cell-center">
    <div class="thumb-box" id="${control}-box">
      <div class="thumb-box-outer">
        <p>${control}</p>
        <div class="thumb-box-inner" style="background-image: url(./${control}.png); background-size: cover">
          <canvas class="thumb" width=224 height=224 id="${control}-thumb"></canvas>
        </div>
        <button class="record-button" id="${control}"/><span>Add Sample</span></button>
      </div>
      <p>
        <span id="${control}-total">0</span> examples
      </p>
    </div>
  </div>`
});

document.getElementById('button-panel').innerHTML = html;

const trainStatusElement = document.getElementById('train-status');

// Set hyper params from UI values.
const learningRateElement = document.getElementById('learningRate');
export const getLearningRate = () => +learningRateElement.value;

const batchSizeFractionElement = document.getElementById('batchSizeFraction');
export const getBatchSizeFraction = () => +batchSizeFractionElement.value;

const epochsElement = document.getElementById('epochs');
export const getEpochs = () => +epochsElement.value;

const denseUnitsElement = document.getElementById('dense-units');
export const getDenseUnits = () => +denseUnitsElement.value;
const statusElement = document.getElementById('status');

let previousClassId = 0;
let timer;

export function predictClass(classId) {
  if (classId !== previousClassId) {
    const prevbox = document.getElementById(CONTROLS[previousClassId] + '-box');
    prevbox.classList.remove('active');
    const box = document.getElementById(CONTROLS[classId] + '-box');
    box.classList.add('active');
    clearTimeout(timer);
    timer = setTimeout(function () {
      document.getElementById('output').innerHTML = document.getElementById('output').innerHTML + CONTROLS[classId];
    }, 250);
    previousClassId = classId;
  }
  document.body.setAttribute('data-active', CONTROLS[classId]);
}

export function isPredicting() {
  statusElement.style.visibility = 'visible';
}
export function donePredicting() {
  statusElement.style.visibility = 'hidden';
}
export function trainStatus(status) {
  trainStatusElement.innerText = status;
}

export let addExampleHandler;
export function setExampleHandler(handler) {
  addExampleHandler = handler;
}
let mouseDown = false;
// const totals = [0, 0, 0, 0];
const totals = new Array(CONTROLS.length).fill(0);

const thumbDisplayed = {};

async function handler(label) {
  mouseDown = true;
  const className = CONTROLS[label];
  const box = document.getElementById(className + '-box');
  box.classList.add('active');
  const total = document.getElementById(className + '-total');
  while (mouseDown) {
    addExampleHandler(label);
    document.body.setAttribute('data-active', CONTROLS[label]);
    total.innerText = totals[label]++;
    await tf.nextFrame();
  }
  box.classList.remove('active');
  document.body.removeAttribute('data-active');
}


CONTROLS.forEach((control, index) => {
  const ctrl = document.getElementById(control);
  ctrl.addEventListener('mousedown', () => handler(index));
  ctrl.addEventListener('mouseup', () => mouseDown = false);
})
  
export function drawThumb(img, label) {
  if (thumbDisplayed[label] == null) {
    const thumbCanvas = document.getElementById(CONTROLS[label] + '-thumb');
    draw(img, thumbCanvas);
  }
}

export function draw(image, canvas) {
  const [width, height] = [224, 224];
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(width, height);
  const data = image.dataSync();
  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    imageData.data[j + 0] = (data[i * 3 + 0] + 1) * 127;
    imageData.data[j + 1] = (data[i * 3 + 1] + 1) * 127;
    imageData.data[j + 2] = (data[i * 3 + 2] + 1) * 127;
    imageData.data[j + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}
