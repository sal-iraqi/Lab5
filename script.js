// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

const imageInput = document.getElementById('image-input');  // used to listen to image input

const canvas = document.querySelector('canvas');  // get the canvas
const ctx = canvas.getContext("2d");  // get the canvas context

const form = document.getElementById('generate-meme');  // used to listen to submit button
const reset = document.getElementById('button-group').querySelector("[type='reset']");  // the clear button
const read = document.getElementById('button-group').querySelector("[type='button']");  // the read text button
const voiceSelect = document.getElementById('voice-selection');  // the voices dropdown

var topText, bottomText;  // keep track of the inputted texts

const vol = document.getElementById('volume-group');  // used to listen to the volume slider
var volumeLevel = 100;  // used to keep track of the volume level at which the text should be read at


// loads the img object with a new image
imageInput.addEventListener('change', () =>{

  // get the uploaded file
  let uploadFile = document.getElementById('image-input').files[0];

  // don't load in anything if no file was inputted
  if(!uploadFile) { return; }  

  // Loads selected image into img src attribute by creating a DOMString
  img.src = URL.createObjectURL(uploadFile);

  // extracts image file name into the img alt attribute
  img.alt = uploadFile.name;

  console.log(img.alt);

});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {

  // clear the canvas context
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // fill canvas context with black to add borders on non-square images
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // draw the uploaded image onto the canvas
  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

// generates the meme with the inputted text and image
form.addEventListener('submit', () => {

  // prevent the page from reloading when hitting submit
  event.preventDefault();

  // get the inputted texts
  topText = document.getElementById('text-top').value;
  bottomText = document.getElementById('text-bottom').value;

  // set up the text properties to fill the canvas with
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';


  // fill the canvas with the top text and bottom text, centered in the middle and height/11 away from the borders
  ctx.fillText(topText, canvas.width/2, canvas.height/11);
  ctx.fillText(bottomText, canvas.width/2, canvas.height - canvas.height/11);

  // toggle the clear and read text elements on
  reset.disabled = false;
  read.disabled = false;
});

// clears the generated image and/or text present
reset.addEventListener('click', () => {

  event.preventDefault();

  // clear the canvas context
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // toggle the clear and read text elements off
  reset.disabled = true;
  read.disabled = true;

});

//Handles the change in volume
vol.addEventListener('input', () => {
  
  //Get the volume level
  let sliderValue = document.getElementById('volume-group').querySelector("[type='range']").value;
  
  //Update volume value for at which the text should be read in
  volumeLevel = sliderValue;

  //If the volume level is between 67 and 100, then display the volume level 3
  if (sliderValue >= 67){
    document.getElementById("volume-group").querySelector("img").src = "icons/volume-level-3.svg";
  }
  //If the volume level is between 34 and 66, then display the volume level 2
  else if(sliderValue >= 34){
    document.getElementById('volume-group').querySelector('img').src = "icons/volume-level-2.svg";
  }
  //If the volume level is between 1 and 33, then display the volume level 1
  else if(sliderValue >= 1 ){
    document.getElementById('volume-group').querySelector('img').src = "icons/volume-level-1.svg";
  }
  //Otherwise the volume level is 0, so display the volume level 0
  else {
    document.getElementById('volume-group').querySelector('img').src = "icons/volume-level-0.svg";
  }
});


// Read out the inputted texts (taken from SpeechSynthesis Documentation)
read.addEventListener('click', () => {

  // Create new utterance with the inputted texts
  var utterTop = new SpeechSynthesisUtterance(topText);
  var utterBottom = new SpeechSynthesisUtterance(bottomText);

  // Get the selected voice from the voice select dropdown
  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  
  // Seach through the available voice list to match the selected voice
  for(var i = 1; i < voiceSelect.length ; i++) {
    if(availableVoices[i-1].name === selectedOption) {
      utterTop.voice = availableVoices[i-1];
      utterBottom.voice = availableVoices[i-1];
    }
  }

  // adjust volume to be spoken at
  utterTop.volume = volumeLevel / 100.0;
  utterBottom.volume = volumeLevel / 100.0;

  // speak the texts, if any were inputted
  if(!(topText === ""))
    synth.speak(utterTop);
  if(!(bottomText === ""))
    synth.speak(utterBottom);

});


/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}





var synth = window.speechSynthesis;
var availableVoices = [];
voiceSelect.disabled = false;

// Populates drop down with voices (taken from SpeechSynthesis Documentation)
function populateVoiceList() {
  availableVoices = synth.getVoices();

  console.log(availableVoices.length);

  for(var i = 0; i < availableVoices.length ; i++) {
    let option = document.createElement('option');
    option.textContent = availableVoices[i].name + ' (' + availableVoices[i].lang + ')';

    if(availableVoices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', availableVoices[i].lang);
    option.setAttribute('data-name', availableVoices[i].name);
    voiceSelect.appendChild(option);
  }
  
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// sets up the voices drop down
voiceSelect.selectedIndex = "1";
voiceSelect.querySelector("[value='none']").textContent = "Choose voice";
voiceSelect.querySelector("[value='none']").disabled = true;

