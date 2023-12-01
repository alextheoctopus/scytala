const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*' //делаем разрешение на все кроссдоменные запросы
    },
});

const cors = require("cors");
const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
const fs = require("fs");

let variants = [];

io.on("connection", (socket) => {
    socket.on("getVariants", (data) => {
        variants = data.uniqueArray;
        fs.readFile("russian_nouns.txt", function (error, data) {
            if (error) {  // если возникла ошибка
                return console.log(error);
            }
            let arrOfCoincidents = [];
            async function find() {
                for (let j = 0; j < variants.length; j++) {// исключить повторяющиеся значения
                    let phrase = variants[j].toLowerCase().split(' ');// phrase=['это','шифр','спарты']
                    arrOfCoincidents.push(0);
                    for (let word = 0; word < phrase.length; word++) {
                        if (data.toString().includes("'" + phrase[word].toString() + "'")) {
                            arrOfCoincidents[j] += 1;
                        }
                    }
                }
            }
            find().then(() => {
                let indexOfMaxElement = arrOfCoincidents.indexOf(Math.max.apply(null, arrOfCoincidents));
                if (indexOfMaxElement != -1) {
                    let response=variants[indexOfMaxElement];
                    socket.emit("rightVariant", ({response}));
                }
            });

        });
    });
});


server.listen(3000, () => console.log('сервер работает'));