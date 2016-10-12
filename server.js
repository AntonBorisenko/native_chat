'use strict';

var http = require('http'),
    fs = require('fs'),
    chat = require('./chat');

var server = new http.Server(function(req, res) {

  switch(req.url) {

    case '/':
      sendFile('/client/index.html', res);
    break;

    case '/get_messages':
      chat.send_historyMessages(res);
    break;

    case '/subscribe':
      chat.subscribe(req, res);
    break;

    case '/publish':
      var body = "";
      var streamNow;
      req.on('readable', function() {
        if((streamNow = req.read()) != null) { //непонятно откуда берётся null
          body += streamNow;
        }
        //Провяем не слишком ли большое соединение
        if(body.length > 1e4) {
          res.statusCode = 403;
          res.end("Error, very big message!");
        }
      }).on('end', function() {
        //Проверяем корректный ли Json
        try {
          body = JSON.parse(body);
        } catch(e) {
          res.statusCode = 400;
          res.end("Bed request!");
          return;
        }
        chat.publish(body.message);
        res.end("ok"); //Завершаем текущее соединение через которое пришло сообщение
      });
    break;

    default:
      res.statusCode = 404;
      res.end('Page not found.');

  }

}).listen(3000);


function sendFile(fileName, res) {
  var response = "";
  var stream = new fs.ReadStream(__dirname + fileName);

  stream.on('readable', function() {
    var data = stream.read();
    if(data != null) {
      response = response + data;
    }
  }).on('end', function() {
      res.statusCode = 200;
      res.end(response);
  }).on('error', function() {
      res.statusCode = 500;
      res.end('Server error.');
  });


}
