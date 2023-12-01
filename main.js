window.onload = () => {

  const inputText = document.getElementById("inputText");
  const button = document.getElementById("cypherButton");
  const decipher = document.getElementById("decypherButton");
  const breakButton = document.getElementById("breakButton");
  document.getElementById("brokenText").innerHTML = '';
  document.getElementById("text").innerHTML = '';
  document.getElementById("cipheredText").innerHTML = '';
  document.getElementById("decipheredText").innerHTML = '';
  breakButton.disabled = true;

  const socket = io('http://localhost:3000');

  const scytaleEncrypt = (message, diameter) => {
    message = message.toUpperCase();
    const numRows = Math.trunc((message.length - 1) / diameter) + 1;// округляем до большего

    const grid = Array.from({ length: numRows }, () => Array(diameter).fill(' '));//создали пустую таблицу и заполнили ****

    let rowIndex = 0;
    let colIndex = 0;
    for (let i = 0; i < message.length; i++) {
      grid[rowIndex][colIndex] = message[i];
      rowIndex = (rowIndex + 1) % numRows;
      if (rowIndex === 0) {
        colIndex++;
      }
    }
    console.log(grid)
    //заполнили таблицу символами
    //  ['Э', 'Ф', 'В', 'П']
    //  ['Т', 'Р', 'Н', 'А']
    //  ['О', ' ', 'Е', 'Р']
    //  [' ', 'Д', 'Й', 'Т']
    //  ['Ш', 'Р', ' ', 'Ы']
    //  ['И', 'Е', 'С', '*']

    let encryptedMessage = '';
    grid.forEach((value) => {
      encryptedMessage += value.join('');//соединяем в предложение по строкам ['Э', 'Ф', 'В', 'П']+['Т', 'Р', 'Н', 'А']
    })

    return encryptedMessage;
  }
  const scytaleDecrypt = (ciphertext, diameter) => {

    let decryptedMessage = '';

    for (let i = 0; i < diameter; i++) {
      for (let j = i; j < ciphertext.length; j += diameter) {
        decryptedMessage += ciphertext[j];
      }
    }

    return decryptedMessage.trim();
  }

  const diameter = 4;

  let encryptedMessage, decryptedMessage, brokenMessage;
  button.addEventListener('click', () => {
    encryptedMessage = scytaleEncrypt(inputText.value, diameter);
    //вывод исходного текста
    document.getElementById("text").innerHTML = inputText.value;
    //вывод зашифрованного значения
    document.getElementById("cipheredText").innerHTML = encryptedMessage;
  });

  const variants = [];
  decipher.addEventListener('click', () => {
    decryptedMessage = scytaleDecrypt(encryptedMessage, diameter);
    //вывод расшифрованного значения
    document.getElementById("decipheredText").innerHTML = decryptedMessage;
    breakButton.disabled = false;
  });

  breakButton.addEventListener('click', () => {
    crackScytale(encryptedMessage);
    breakButton.disabled = true;
  });

  function crackScytale(ciphertext) {
    const messageLength = ciphertext.length;

    // Try different diameters
    for (let diameter = 2; diameter < messageLength; diameter++) {
      const decryptedMessage2 = scytaleDecrypt(ciphertext, diameter);
      variants.push(decryptedMessage2);
    }

    if (variants.length != 0) {
      uniqueArray = variants.filter(function (item, pos) {
        return variants.indexOf(item) == pos;
      });
      uniqueArray ? socket.emit("getVariants", ({ uniqueArray })) : ''
      variants.splice(0, variants.length);

    }

    socket.on("rightVariant", (data) => {//не выводит че то
      if (data) document.getElementById("brokenText").innerHTML = data.response;
    });
  }


}