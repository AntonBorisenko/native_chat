'use strict';

var clients = [];
var messages = [];

exports.subscribe = function(req, res) {
  clients.push(res);
  //Если соединение прервётся - удаляем его из массива
  res.on('close', function() {
    clients.splice(clients.indexOf(res), 1);
  });
}

exports.publish = function(message) {
  messages.push(message);
  clients.forEach(function(res) {
    res.end(message);
  });
  clients = [];
}

exports.send_historyMessages = function(res) {
  if(messages.length > 0) {
    messages = messages.join("###");
    res.end(messages);
    messages = messages.split("###");
  }
}

//Проверяем удаление закрытых соединений
// setInterval(function() {
//   console.log(clients.length);
// }, 2000);
