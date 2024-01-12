/* eslint-disable no-alert */
export default class TextMessage {
  constructor() {
    this.timeline = document.getElementById('timeline');
    this.postInput = document.getElementById('postInput');
    this.setupEventListeners();
  }

  static createInput(id, labelText) {
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.id = id;

    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.innerText = `${labelText}: `;
    return {
      label: labelElement,
      input: inputElement,
    };
  }

  addPostToTimeline(text, coordinates) {
    const currentTime = new Date();
    const formattedDate = currentTime.toLocaleDateString('ru-RU');
    const formattedTime = currentTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const postDateTimeElement = document.createElement('div');
    postDateTimeElement.classList.add('post-datetime');
    postDateTimeElement.textContent = `${formattedDate} ${formattedTime}`;

    const postTextElement = document.createElement('div');
    postTextElement.classList.add('post-text');
    postTextElement.textContent = text;

    const postCoordinatesElement = document.createElement('div');
    postCoordinatesElement.classList.add('post-coordinates');
    postCoordinatesElement.textContent = `[${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}]`;
    postElement.appendChild(postDateTimeElement);
    postElement.appendChild(postTextElement);
    postElement.appendChild(postCoordinatesElement);
    this.timeline.prepend(postElement);
  }

  createCoordinatesForm(text) {
    const formElement = document.createElement('form');
    formElement.id = 'coordinates-form';
    const labelHTML = `
    <div class="coordinates-form">
      Что-то пошло не так<br/> <br/>
      К сожалению, нам не удалось определить Ваше местоположение,<br/>
      пожалуйста, дайте разрешение на использование геолокации,<br/>
      либо введите координаты вручную.<br/> <br/> 
      Широта и долгота через запятую.<br/>
    </div>
  `;

    const coordinateInputLabel = document.createElement('label');
    coordinateInputLabel.innerHTML = labelHTML;

    const coordinateInput = TextMessage.createInput('coordinates', '');
    coordinateInput.label.innerHTML = labelHTML;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = 'button-box';

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.innerText = 'OK';

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.innerText = 'Отмена';
    cancelButton.addEventListener('click', () => {
      formElement.remove();
    });

    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(submitButton);

    formElement.appendChild(coordinateInputLabel);
    formElement.appendChild(coordinateInput.input);
    formElement.appendChild(document.createElement('br'));
    formElement.appendChild(buttonsContainer);
    formElement.addEventListener('submit', (event) => {
      event.preventDefault();
      try {
        const coordinateValues = TextMessage.validateCoordinates(coordinateInput.input.value);
        const [latitude, longitude] = coordinateValues;
        this.addPostToTimeline(text, {
          latitude,
          longitude,
        });
        formElement.reset();
        formElement.remove();
      } catch (error) {
        alert(error.message);
      }
    });
    return formElement;
  }

  static validateCoordinates(input) {
    const coordinatePattern = /^(\[)?(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)(\])?$/;
    const match = input.trim().match(coordinatePattern);
    if (!match || (match[1] === '[' && match[6] !== ']') || (match[1] !== '[' && match[6] === ']')) {
      throw new Error('Введите координаты в одном из следующих форматов: 51.50851, -0.12572; 51.50851,-0.12572 или [51.50851, -0.12572].');
    }
    const latitude = parseFloat(match[2]);
    const longitude = parseFloat(match[4]);
    return [latitude, longitude];
  }

  static async getUserCoordinates() {
    return new Promise((resolve, reject) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          () => {
            reject(new Error('Не удалось получить координаты.'));
          },
        );
      } else {
        reject(new Error('Geolocation API не поддерживается.'));
      }
    });
  }

  setupEventListeners() {
    this.postInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        const postText = this.postInput.value.trim();
        event.preventDefault();
        if (!postText) {
          alert('Пожалуйста, введите текст поста.');
          return;
        }
        try {
          const coordinates = await TextMessage.getUserCoordinates();
          this.addPostToTimeline(postText, coordinates);
          this.postInput.value = '';
        } catch (error) {
          alert(error.message);
          const coordinatesForm = this.createCoordinatesForm(postText);
          document.body.appendChild(coordinatesForm);
          this.postInput.value = '';
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-unused-vars
  const textMessageApp = new TextMessage();
});
