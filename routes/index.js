"use stricts";
var express = require('express');
var router = express.Router();

var db = require("../db");
var sms = require("../models/sms.js");
var newChat = require("../models/newchat.js");


/* GET home page. */
router.get('/', function(req, res, next) { 
  res.render('index', { title: 'Express' });
});

router.post("/", function(req, res, next) {
  var ip = req.connection.remoteAddress;
    var event = req.body.event;
    var mainMenu = function() {
      return "Пришлите мне одну из команд:\n1️⃣Информация \n2️⃣Перечень документов \n3️⃣Прейскурант \n4️⃣Контакты";
    }
    var allComands = function (subscribed) {
      return "" + (subscribed ? "" : "\n'Сегодня', чтобы получить гороскоп на сегодня")
    }

    if(event == "user/unfollow") {
    	var userId = req.body.data.id;
    	db.User.destroy({where:{userId: userId}}).then(function(err) {
        console.log("db destroyed");
      });
    }
    if(event == "user/follow") {
      var userId = req.body.data.id;
      db.User.create({userId: userId, ip: ip}).then(function(user) {
        console.log("user follows");
        newChat(userId, ip, function(err, res, body) {
          var chatId = body.data.id;
          var message = "Здравствуйте!" + mainMenu();
          sms(message, chatId, ip);
        })
      });
    }
    if(event == "message/new") {
      var userId = req.body.data.sender_id;
      db.User.find({where: {userId: userId}})
      .then(function(user) {  
      	var content = req.body.data.content;
      	var chatId = req.body.data.chat_id;
        var subscribed = user.subscribed;
        var state = user.state;
        
      	if(req.body.data.type != 'text/plain') {
      		sms(errMessage, chatId, ip);
      		return;
        }
        if (state == 0){
          let errMessage = "Неверная команда. " + mainMenu();
          if (content == '1') {
            db.Info.findAll().then(data => {
              sms(data[0].data_all, chatId, ip, function() {
                setTimeout(function() {
                  sms(mainMenu(), chatId, ip);
                }, 3000);
              })
            })
          }
          else {
        		sms(errMessage, chatId, ip);
          }
        } else {
          var errMessage = "Неверная команда.";
          if(content == "Сменить"){
            
          } else {
      		  sms(errMessage, chatId, ip);
          }
        }
     })
    }
  res.end();
});



module.exports = router;
