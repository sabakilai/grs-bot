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
    var mainMenu = function(language) {
      if(language == 1) {
        return "Пришлите мне одну из команд:\n1️⃣Информация \n2️⃣Перечень документов \n3️⃣Прейскурант \n4️⃣Контакты \n5️⃣Кыргыз тили";
      } else {
        return "Бир команданы жазып жибериниз:\n1️⃣Маалымат \n2️⃣Документтердин тизмеси \n3️⃣Прейскурант \n4️⃣Байланыш маалыматы \n5️⃣Русский язык";
      }
    }
    var docMenu = function(language) {
      if(language==1){
        return 'Выберите категорию регистрации, отправив команду: '+
        '\n1️⃣ - Государственная регистрация прав и ограничений на недвижимое имущество'+
        '\n2️⃣ - Государственная регистрация прав на недвижимое имущество на основании договора отчуждения недвижимого имущества, не требующего обязательного нотариального удостоверения'+
        '\n3️⃣ - Предоставление данных о зарегистрированных правах на недвижимое имущество'+
        '\n4️⃣ - Оформление землеустроительных дел и выдача правоудостоверяющих документов на земельный участок'
      } else {
        return 'Каттоо категориясын танданыз: '+
        '\n1️⃣ - Жерге жайгаштыруу иштерин тариздөө жана жер тилкесине карата укук тастыктоочу документтерди берүү'+
        '\n2️⃣ - Кыймылсыз мүлккө карата каттоодон өткөрүлгөн укуктар жөнүндө маалыматтарды берүү'+
        '\n3️⃣ - Милдеттүү нотариалдык күбөлөндүрүүнү талап кылбаган кыймылсыз мүлктү ээликтен ажыратуунун негизинде кыймылсыз мүлккө карата укуктарды мамлекеттик каттоо'+
        '\n4️⃣ - Кыймылсыз мүлккө карата укуктарды жана чектөөлөрдү мамлекеттик каттоо'
      }
    }
    var contactMenu = function(language) {
      if(language==1) {
        return 'Выберете департамент: ' +
        '\n1️⃣ - Департамент кадастра и регистрации прав на недвижимое имущество при Государственной регистрационной службе при Правительстве КР' + 
        '\n2️⃣ - Бишкекское городское управление' 
      } else {
        return 'Выберете департамент: ' +
        '\n1️⃣ - Кыргыз Республикасынын Өкмөтүнө каратуу Мамлекеттик каттоо кызматынын алдынданы Кадастар жана кыймылсыз мүлктөргү карата укуктарды катто департаменти' + 
        '\n2️⃣ - Бишкек шаары'
      }
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
          var message = "Здравствуйте!" + mainMenu(1);
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
        var language = user.subscribed;
        var state = user.state;
        
      	if(req.body.data.type != 'text/plain') {
      		sms("Неверная команда." , chatId, ip);
      		return;
        }
        if (state == 0){ 
          let errMessage =  (language==1 ? "Неверная команда. " : "Туура эмес команда. ") + mainMenu(language);
          if (content == '1') {
            db.Info.findAll({where:{id:language}}).then(data => {
              sms(data[0].data_all, chatId, ip, function() {
                setTimeout(function() {
                  sms(mainMenu(language), chatId, ip);
                }, 3000);
              })
            })
          } else if (content == '2') {
            db.User.update({state:1},{where: {userId: userId}}).then(user => {
              sms(docMenu(language),chatId,ip)
            })
          } else if (content == '3') {
              db.Price.findById(language).then(data => {
                sms(data.price,chatId,ip,function() {
                  setTimeout(function() {
                    sms(mainMenu(language), chatId, ip);
                  }, 3000);
                })
              })
          } else if (content == '4') {
            db.User.update({state:2},{where: {userId: userId}}).then(user => {
              sms(contactMenu(language),chatId,ip)
            })
          } else if (content == '5') {
            if (language == 1) {
              db.User.update({subscribed:2}, {where:{userId:userId}}).then(user => {
                let message = "Сиз кыргыз тилин тандадыныз. " + mainMenu(2);
                sms(message,chatId,ip);
              })
            } else {
              db.User.update({subscribed:1}, {where:{userId:userId}}).then(user=> {
                let message = "Вы выбрали русский язык. " + mainMenu(1);
                sms(message,chatId,ip);
              })
            }
          } else {
        		sms(errMessage, chatId, ip);
          }
        } else if (state == 1) {
            let errMessage =  (language==1 ? "Неверная команда. Выберете категорию регистрации." : "Туура эмес команда. Каттоонун категориясын танданыз.")
            let correctAnswer = ["1","2","3","4"];
            if (correctAnswer.indexOf(content)>= 0) {
              let id;
              if (language==1) {
                id = Number(content)
              } else {
                id = Number(content) + 4;
              }
              db.Document.findById(id).then(document=> {
                db.User.update({state:0},{where:{userId:userId}}).then(user=> {
                  sms(document.document, chatId, ip, function(){
                    setTimeout(function() {
                      sms(mainMenu(language), chatId, ip);
                    }, 3000);
                  })
                })
              })
            } else {
              sms(errMessage,chatId,ip)
            }
        } else if (state == 1) {
          let errMessage =  (language==1 ? "Неверная команда. Выберете категорию регистрации." : "Туура эмес команда. Департаментти танданыз.")
          let correctAnswer = ["1","2"];
          if (correctAnswer.indexOf(content)>=0) {
            let id;
            if (language==1) {
              id = Number(content)
            } else {
              id = Number(content) + 2;
            }
            db.Address.findById(id).then(address => {
              db.User.update({state:0},{where:{userId:userId}}).then(user => {
                sms(address.address, chatId, ip, function() {
                  setTimeout(function() {
                    sms(mainMenu(language), chatId, ip);
                  }, 3000);
                })
              })
            })
          } else {
            sms(errMessage, chatId, ip)
          } 
        }
     })
    }
  res.end();
});



module.exports = router;
