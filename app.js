// Обновленный путь для модуля sync-mysql
const Mysql = require('sync-mysql');
const connection = new Mysql({
    host: 'localhost',
    user: 'root',
    password: '2001',
    database: 'ElectricBank'
});

// Путь к файлу select.html
const path = require('path');
const fs = require('fs');
const qs = require('querystring');
const http = require('http');

function reqPost(request, response) {
    if (request.method == 'POST') {
        let body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            const post = qs.parse(body);
            const sInsert = `INSERT INTO Individuals (borrowerId, firstName, lastName, middleName, passport, inn, snils, driversLicense, additionalDocuments, notes) 
                            VALUES (1, "${post['col1']}", "${post['col2']}", "${post['col3']}", "", "", "", "", "", "")`;
            const results = connection.query(sInsert);
            console.log('Done. Hint: ' + sInsert);
        });
    }
}

function ViewSelect(res) {
    // Запрос для получения всех колонок таблицы Individuals
    const results = connection.query('SHOW COLUMNS FROM Individuals');
    res.write('<tr>');
    for (let i = 0; i < results.length; i++) {
        res.write('<td>' + results[i].Field + '</td>');
    }
    res.write('</tr>');

    // Запрос для получения всех записей из таблицы Individuals
    const data = connection.query('SELECT * FROM Individuals ORDER BY id DESC');
    for (let i = 0; i < data.length; i++) {
        res.write('<tr>');
        for (let field in data[i]) {
            res.write('<td>' + (data[i][field] || '') + '</td>');
        }
        res.write('</tr>');
    }
}

function ViewVer(res) {
    const results = connection.query('SELECT VERSION() AS ver');
    res.write(results[0].ver);
}

const server = http.createServer((req, res) => {
    reqPost(req, res);
    console.log('Loading...');

    res.statusCode = 200;

    // Чтение шаблона в каталоге со скриптом
    const filePath = path.join(__dirname, 'select.html');
    const array = fs.readFileSync(filePath).toString().split("\n");
    console.log(filePath);
    for (let i in array) {
        if ((array[i].trim() != '@tr') && (array[i].trim() != '@ver')) res.write(array[i]);
        if (array[i].trim() == '@tr') ViewSelect(res);
        if (array[i].trim() == '@ver') ViewVer(res);
    }
    res.end();
    console.log('1 User Done.');
});

const hostname = '127.0.0.1';
const port = 3000;
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});