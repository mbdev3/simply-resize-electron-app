const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

const loadImage = (e) => {
  const file = e.target.files[0];

  if (!checkFileIsImage(file)) {
    console.log('please selected image');
    alertError('please provide a valid image format');
    return;
  }

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  console.log(file);
  console.log(image.onload);
  form.style.display = 'block';
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), 'output');
};

const sendImage = (e) => {
  e.preventDefault();

  const imgPath = img.files[0].path;

  if (!img.files[0]) {
    alertError('please upload an image');
    return;
  }

  if (!widthInput.value || !heightInput.value) {
    alertError('please provide width and height');
    return;
  }
};

const checkFileIsImage = (file) => {
  const acceptedFormats = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return file && acceptedFormats.includes(file.type);
};

const alertError = (message) => {
  toastify.show({
    text: message,
    duration: 2000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },
  });
};
const alertSuccess = (message) => {
  toastify.show({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'lime',
      color: 'white',
      textAlign: 'center',
    },
  });
};

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);
