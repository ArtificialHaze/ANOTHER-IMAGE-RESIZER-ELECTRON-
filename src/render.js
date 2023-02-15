const { ipcRenderer } = require("electron");
const Toastify = require("toastify-js");
const path = require("path");
const os = require("os");

const formElement = document.querySelector("form");
const img = document.getElementById("img");
const output = document.getElementById("output");
const fileName = document.getElementById("filename");
const heightInputElement = document.getElementById("height");
const widthInputElement = document.getElementById("width");

formElement.addEventListener("submit", resizeImage);

function resizeImage(e) {
  e.preventDefault();

  if (!img.files[0]) {
    errorMessage("Please select and image and upload.");
    return;
  }

  if (widthInputElement.value === "" || heightInputElement.value === "") {
    errorMessage("Please enter height and width value fields.");
    return;
  }

  const imgPath = img.files[0].path;
  const width = widthInputElement.value;
  const height = heightInputElement.value;

  ipcRenderer.send("resize-image", { imgPath, width, height });
}

function successMessage(text) {
  Toastify({
    text: text,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

ipcRenderer.on("image-done", () => {
  successMessage(
    `Image resized to ${heightInputElement.value} x ${widthInputElement.value}`
  );
});

function errorMessage(text) {
  Toastify({
    text: text,
    duration: 5000,
    close: false,
    style: {
      background: "crimson",
      color: "white",
      textAlign: "center",
    },
  });
}

function isFileImage(file) {
  const acceptedImageTypes = ["image/gif", "image/jpeg", "image/png"];
  return file && acceptedImageTypes.includes(file["type"]);
}

img.addEventListener("change", loadImage);

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError("Please select an image");
    return;
  }

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInputElement.value = this.width;
    heightInputElement.value = this.height;
  };

  formElement.style.display = "block";
  fileName.innerHTML = img.files[0].name;
  output.innerText = path.join(os.homedir(), "imageresizer");
}
