import TextMessage from '../src/js/app';

describe('TextMessage', () => {
  let textMessageApp;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="timeline"></div>
      <input id="postInput" />
    `;
    textMessageApp = new TextMessage();
  });

  test('должен корректно распознать координаты с пробелом', () => {
    const input = textMessageApp.createCoordinatesForm('').querySelector('#coordinates');
    input.value = '51.50851, -0.12572';
    const expected = [51.50851, -0.12572];
    expect(TextMessage.validateCoordinates(input.value)).toEqual(expected);
  });

  test('должен корректно распознать координаты без пробела', () => {
    const input = textMessageApp.createCoordinatesForm('').querySelector('#coordinates');
    input.value = '51.50851,-0.12572';
    const expected = [51.50851, -0.12572];
    expect(TextMessage.validateCoordinates(input.value)).toEqual(expected);
  });

  test('должен корректно распознать координаты в квадратных скобках', () => {
    const input = textMessageApp.createCoordinatesForm('').querySelector('#coordinates');
    input.value = '[51.50851, -0.12572]';
    const expected = [51.50851, -0.12572];
    expect(TextMessage.validateCoordinates(input.value)).toEqual(expected);
  });

  test('должен показать предупреждение о неверном вводе координат', () => {
    window.alert = jest.fn();

    const form = textMessageApp.createCoordinatesForm('');
    document.body.appendChild(form);

    const input = document.querySelector('#coordinates');
    input.value = '[51.50851, -0.12572';
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    expect(window.alert).toHaveBeenCalledWith('Введите координаты в одном из следующих форматов: 51.50851, -0.12572; 51.50851,-0.12572 или [51.50851, -0.12572].');
  });
});
