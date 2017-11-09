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
    var docMenu = function() {
      return 'Выберите категорию регистрации, отправив команду: \n1️⃣ - Государственная регистрация прав и ограничений на недвижимое имущество'+
      '\n2️⃣ - Государственная регистрация прав на недвижимое имущество на основании договора отчуждения недвижимого имущества, не требующего обязательного нотариального удостоверения'+
      '\n3️⃣ - Предоставление данных о зарегистрированных правах на недвижимое имущество'+
      '\n4️⃣ - Оформление землеустроительных дел и выдача правоудостоверяющих документов на земельный участок '
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
          } else if (content == '2') {
            db.User.update({state:1},{where: {userId: userId}}).then(user => {
              sms(docMenu(),chatId,ip)
            })
          } else if (content == '3') {
              db.Price.findById(1).then(data => {
                sms(data.price,chatId,ip,function() {
                  setTimeout(function() {
                    sms(mainMenu(), chatId, ip);
                  }, 3000);
                })
              })
          } else {
        		sms(errMessage, chatId, ip);
          }
        } else if (state == 1) {
            let errMessage = "Неверная команда. Выбете категорию регистрации.";
            let correctAnswer = ["1","2","3","4"];
            if (correctAnswer.indexOf(content)>= 0) {
              let id = Number(content);
              db.Document.findById(id).then(document=> {
                db.User.update({state:0},{where:{userId:userId}}).then(user=> {
                  sms(document.document, chatId, ip, function(){
                    sms(mainMenu(),chatId,ip)
                  })
                })
              })
            } else {
              sms(errMessage,chatId,ip)
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
