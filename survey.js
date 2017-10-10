/**
 * Loading of the various modules used in this js program
 **/
const fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

/**
 * setting of the various modules and middleware for user in this js program
 **/
var app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({secret: '1234567890QWERTY'}));
app.use( express.static( "public" ) );

/**
 * Global variables
 * userAnswers and tempAnswers are needed as persisting arrays for global usage, multiple referencing
 * timeVar is the attempt at the 2 minute survey timeout, global due to multiple function referencing
 * lastUser is a variable to hold the lastUser name, so that the username is populated as long as the server is up, even if browser is closed
 * timeOut is a persisting boolean value to inform if there has been a timeout due to survey inactivity
 * ----I thought perhaps these variables could be implemented into the session, but I was not able to delve that much into the reaserch for that----
 **/
var userAnswers = [];
var tempAnswers = [];
var lastUser;
var timeVar;
var timeOut = false;

/**
 * express get route for the landing page
 **/
app.get('/', function (req, res) {
  var message;
  var image = '/images/headerImage.jpg';
  var style = 'max-width: 100%; height:150px;';
  if(timeOut){
      message = '<h2>Logged out of survey due to inactivity</h2>' +
      '<h2>Survey results have not been recorded</h2>';
      timeOut = false;
  }else{
      message = "";
  }
  if(lastUser){
    var response = '<img src=' + image + ' style=' + style + '>' +
    '<h1>Welcome to the Survey Landing Page</h1>' +
  		  '<form method="POST">' +
          'UserName: <input type="text" name="username" value="' + lastUser +'"><br>' +
          'Password: <input type="text" name="password"><br>' +
          '<input type="submit" value="Submit"></form>' +
          '<form action="/quit">' +
          '<input type="submit" value="Quit"></form>';
    }else{
    var response = '<img src=' + image + ' style=' + style + '>' +
    '<h1>Welcome to the Survey Landing Page</h1>' +
        '<form method="POST">' +
          'UserName: <input type="text" name="username"><br>' +
          'Password: <input type="text" name="password"><br>' +
          '<input type="submit" value="Submit"></form><br>' +
          '<form action="/quit">' +
          '<input type="submit" value="Quit"></form>';
    }
  
  res.send(message + response);
});

/**
 * express post route for the landing page
 **/
app.post('/', function(req, res){
var authenticated = authenticateUser(req.body.username, req.body.password, req);
if(authenticated){	
  		res.redirect('/login');
    }
  else{
    res.redirect('/');
  }

});

/**
 * express get route for the login action
 **/
app.get('/login', function (req, res) {
var found = false;
console.log(req.session.role);
if(req.session.role == "user"){
	    var data = fs.readFileSync('results.json');
        var usersJSON = JSON.parse(data);
        var users = usersJSON;
        for (var user in users) {
            var theUser = users[user];
            if (theUser.username == req.session.user) {
               found = true;
            }
        }
    lastUser = req.session.user;
    }
    
if(found){
  console.log("User found");
	 res.redirect('/matches');
}else if(req.session.role == "admin"){
   res.redirect('/tools');
}else{
   console.log("User not found");
   req.session.lastPage = '/login';
   userAnswers = [];
   timeVar = setInterval(timeLimit, 20000, res);
	 res.redirect('/survey/1');
  }
});

/**
 * express post route for the login action
 **/
app.post('/login', function (req, res) {

});

/**
 * express get route for the tools page
 **/
app.get('/tools', function (req, res) {
var role = req.session.role;
  if(role == 'admin'){
    var counter = 0;
    var userCount = 0;
    var usersArray = [];
    var data = fs.readFileSync('results.json');
      var users = JSON.parse(data);
      for (var i in users) {
        userCount++;
        usersArray.push(users[i].username);
      }

    res.render("adminPage", { pretty: true , userCount: userCount, usersArray: usersArray});
  }else{
    res.render('unauthAccess');
  }
});

/**
 * express post route for the tools page
 **/
app.post('/tools', function (req, res) {

});

/**
 * express get route for the tools/user page
 * which is the page for viewing a particular user's last survey
 **/
app.get('/tools/:user', function (req, res) {
  var username = req.params.user;
  var data = fs.readFileSync('questions.json');
  var questionsJSON = JSON.parse(data);
  var questions = questionsJSON.questions;
  var userAnswers = answersArray(username);
  res.render("adminLastSurvey", { pretty: true, username: username, question1: questions[0].question, answer1: userAnswers[0], question2: questions[1].question, answer2: userAnswers[1], question3: questions[2].question, answer3: userAnswers[2], question4: questions[3].question, answer4: userAnswers[3] });
});

/**
 * express post route for the tools/user page
 **/
app.post('/tools/:user', function (req, res) {

});

/**
 * express get route for the adminDeleteSurvey/user action
 **/
app.get('/adminDeleteSurvey/:user', function (req, res) {
  var username = req.params.user;
  removeUser(username);
  res.redirect('/tools');
});

/**
 * express post route for the adminDeleteSurvey/user action
 **/
app.post('/adminDeleteSurvey/:user', function (req, res) {

});

/**
 * express get route for the matches page
 **/
app.get('/matches', function (req, res) {
	var userScores = getScores(req, res);
	console.log(userScores);
    var currentUser = req.session.user;
    res.render('matchesPage', { userScores: userScores, currentUser: currentUser});
});

/**
 * express post route for the matches page
 **/
app.post('/matches', function (req, res) {

});

/**
 * express get route for the back action
 **/
app.get('/back', function (req, res) {
	res.redirect('/');
});

/**
 * express post route for the back action
 **/
app.post('/back', function (req, res) {

});

/**
 * express get route for the backAdmin action
 **/
app.get('/backAdmin', function (req, res) {
  res.redirect('/tools');
});

/**
 * express post route for the backAdmin action
 **/
app.post('/backAdmin', function (req, res) {

});

/**
 * express get route for the repeat action
 **/
app.get('/repeat', function (req, res) {
  var currentUser = req.session.user;
  userAnswers = [];
  userAnswers = answersArray(currentUser);
  console.log(userAnswers);
  req.session.lastPage = '/repeat';
  timeVar = setInterval(timeLimit, 20000, res);
  res.redirect('/survey/1');
});

/**
 * express post route for the repeat action
 **/
app.post('/repeat', function (req, res) {

});

/**
 * express get route for the lastSurvey page
 **/
app.get('/lastSurvey', function (req, res) {
  var questions;
  var data = fs.readFileSync('questions.json');
  var questionsJSON = JSON.parse(data);
  questions = questionsJSON.questions;
  var currentUser = req.session.user;
  userAnswers = answersArray(currentUser);

  res.render('lastSurvey', { question1: questions[0].question, answer1: userAnswers[0], question2: questions[1].question, answer2: userAnswers[1], question3: questions[2].question, answer3: userAnswers[2], question4: questions[3].question, answer4: userAnswers[3] });
});

/**
 * express post route for the lastSurvey page
 **/
app.post('/lastSurvey', function (req, res) {

});

/**
 * express get route for the backMatches action
 **/
app.get('/backMatches', function (req, res) {
  res.redirect('/matches');
});

/**
 * express post route for the backMatches action
 **/
app.post('/backMatches', function (req, res) {

});

/**
 * express get route for the logout action
 **/
app.get('/logout', function (req, res) {
  lastUser = req.session.user;
  req.session.user = "";
  res.redirect('/');
});

/**
 * express post route for the logout action
 **/
app.post('/logout', function (req, res) {

});

/**
 * express get route for the quit action
 **/
app.get('/quit', function (req, res) {
  process.exit();
});

/**
 * express post route for the quit action
 **/
app.post('/quit', function (req, res) {

});
/**
 * express get route for the deleteSurvey action
 **/
app.get('/deleteSurvey', function (req, res) {
  removeUser(req.session.user);
  res.redirect('/');
});

/**
 * express post route for the deleteSurvey action
 **/
app.post('/deleteSurvey', function (req, res) {

});

/**
 * express get route for the survey pages
 * the number is a variable denoting the current question number
 **/
app.get('/survey/:number', checkTime, function (req, res) {
	var allowed = false;
	var number = req.params.number;
    allowed = checkAccess(number, req);
    if(allowed){
		var questions;
    	var data = fs.readFileSync('questions.json');
    	var questionsJSON = JSON.parse(data);
        	questions = questionsJSON.questions;
            
            var answers = questions[number - 1].answers;
            var question = questions[number - 1].question;
     	if(userAnswers != "" || typeof(userAnswers[0]) != 'undefined'){
      var tempArray =  [];
          for(var i = 0; i < 4; i++){
            if(answers[i] != userAnswers[number - 1]){
                tempArray.push(answers[i]);
            }
          }
          console.log("Answers Array: " + tempArray);
          if(number < 4){
        	   res.render("surveyDisplaySelected", { question: question, answer1: tempArray[0], answer2: tempArray[1], answer3: tempArray[3], answer0: userAnswers[number - 1]});
          }else{
             res.render("lastSurveySelected", { question: question, answer0: userAnswers[number - 1]});
          }
     	}else{
        	res.render("surveyDisplay", { question: question, answers: answers});
      	}
  
  }else{
    res.render('unauthAccess');
  }

});

/**
 * express post route for the survey pages
 * the number is a variable denoting the current question number
 **/
app.post('/survey/:number', function (req, res) {
	var number = req.params.number;
  	if(typeof(req.body.answer) == 'undefined'){
    	res.redirect('/survey/' + number);
  	}else{
		tempAnswers[number - 1] = req.body.answer;
  		req.session.lastPage = '/survey/' + number;
  		number++;
  		if(number <= 4)
  		{
  			res.redirect('/survey/' + number);
  		}else if(number > 4){
          if(timeOut){
            res.redirect('/');
          }else{
  			    writeAnswers(req, res);
  			    res.redirect('/matches');
          }
  		}
  }
});

/**
 * express get route for the * page (404 access error page)
 * any direct URL page that is not available will route here
 **/
app.get('*', function (req, res) {
   res.send("This is not the page you are looking for.");
});

/**
 * express listener for port 3000
 **/
app.listen(3000, function() {
 console.log("Server listening at localhost:3000");
});

/**
 * function to check if there has been a survey timeout, and wither redirect home or proceed to next
 * likely not truly meeting requirements, as it does not cause automatic
 * redirect to the landing page.  Instead it redirects on the last submit action
 * @ param req (request variable)
 * @ param res (response variable)
 * @ param next (next function callback)
 *
 * @ return boolean
 **/
function checkTime(req, res, next){
  if(timeOut){
    res.redirect('/');
  }else{
    next();
  }
}

/**
 * function to authenticate the username and pass of a login attempt
 * @ param username (attemtped login username variable)
 * @ param password (attemtped login password variable)
 * @ param req (request variable)
 *
 * @ return boolean
 **/
function authenticateUser(username, password, req){
	if(username == "tjjohn1" && password == "password"){
    req.session.user = username;
    console.log("username set");
    req.session.role = "admin";
    console.log("admin authenticated");
		return "admin";
  }
  else if(username == "Thomas" && password == "password"){
    req.session.user = username;
    console.log("username set");
    req.session.role = "user";
    console.log("user authenticated");
    return "user";
	}else if(username == "Michael" && password == "password"){
    req.session.user = username;
    console.log("username set");
    req.session.role = "user";
    console.log("user authenticated");
    return "user";
	}else if(username == "Jessica" && password == "password"){
    req.session.user = username;
    console.log("username set");
    req.session.role = "user";
    console.log("user authenticated");
    return "user";
	}
	else{
		console.log("Incorrect username or password");
		return false
	}
}

/**
 * function to write the user survey answers to the results file
 * @ param req (request variable)
 * @ param res (response variable)
 **/
function writeAnswers(req, res){
  var currentUser = req.session.user;
  removeUser(currentUser);
	clearTimeout(timeVar);
	var resultsJSON = {
              username: req.session.user,
              answers: [
              tempAnswers[0],
              tempAnswers[1],
              tempAnswers[2],
              tempAnswers[3]
          ]
       };
        var data = fs.readFileSync('results.json');
        var json = JSON.parse(data);
        var users = json;
        users.push(resultsJSON);
        
        fs.writeFileSync('results.json', JSON.stringify(json, null, 2));
}

/**
 * function to obtain the matches/scores for all current survey usres, compared to the current user
 * @ param req (request variable)
 * @ param res (response variable)
 *
 * @ return userScores (json format array)
 **/
function getScores(req, res) {
var flag;
var counter = 0;
var found = false;
var currentUser;
var data = fs.readFileSync('results.json');
    var resultsJSON = JSON.parse(data);
        var results = resultsJSON;
         
            for (var i in results) {
                var tempName = results[i].username;
                if(tempName == req.session.user){
                    flag = i;
                    found = true;
                }
                
                
            }
            if(found){
                currentUser = results[flag];
                console.log(currentUser);
            }


    var data = fs.readFileSync('results.json');
    var usersJSON = JSON.parse(data);
    var users = usersJSON;
    var score;
    var userScores;
    for (var user in users) {
        var theUser = users[user];
        if (theUser.username != req.session.user) {
          score = 0;
            for (var i = 0; i < 4; i++) {
                if (theUser.answers[i] == currentUser.answers[i]) {
                    score++;
                    console.log(theUser.username + ":" + score)
                }
            }
            if(counter == 0){
            	userScores = [{username: theUser.username, score: score}];
            	JSON.stringify(userScores, null, 2);
              counter++;
        	}else{
        		userScores.push({username: theUser.username, score: score});
        	}
        }
    }

userScores.sort( predicatBy("score") );
return userScores;
}

/**
 * Array sort helper function, predicating by a particular element as the dominat for descending order
 * @ param prop (element to sort in descending order by)
 **/
function predicatBy(prop){
   return function(a,b){
      if( a[prop] < b[prop]){
          return 1;
      }else if( a[prop] > b[prop] ){
          return -1;
      }
      return 0;
   }
}

/**
 * function to obtain all survey answers for a particular user
 * @ param user (target username)
 *
 * @ return answers (array of answer elements)
 **/
function answersArray(user){
  currentUser = user;
  var answers;
    var data = fs.readFileSync('results.json');
    var usersJSON = JSON.parse(data);
    var users = usersJSON;
for (var i in users) {
        var theUser = users[i];
        if (theUser.username == currentUser) {
            answers = theUser.answers;
        }
    }
return answers;
}

/**
 * function to remove a particular user and all answers from the master results JSON file
 * @ param user (target username)
 **/
function removeUser(user){
    var removeUser = user;
    var data = fs.readFileSync('results.json');
    var usersJSON = JSON.parse(data);
    var users = usersJSON;
    usersJSON = users.filter((user) => { 
        return user.username !== removeUser 
    });
    fs.writeFileSync('results.json', JSON.stringify(usersJSON, null, 2));
}

/**
 * attempted fucntion to handle 2 minute survey limit
 * likely not truly meeting requirements, as it does not cause automatic
 * redirect to the landing page.  Instead it redirects on the last submit action
 * @ param res (response variable)
 **/
function timeLimit(res) {
  
    timeOut = true;
    console.log("2 Minute Survey Timeout")
    clearTimeout(timeVar);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
}

/**
 * fucntion to check the access for a particular user
 * when they attempt to access the survey via a direct URL
 * @ param number (survey question number variable)
 * @ param req (request variable)
 * @ param allowed (boolean variable)
 **/
function checkAccess(number, req){
	console.log("Number :" + number);
	console.log("Last Page :" + req.session.lastPage);
	if(number == 1){
  		if(req.session.lastPage == '/login' || req.session.lastPage == '/repeat'){
  			allowed = true;
  		}else{
  			allowed = false;
  		}
  	}else if(number == 2){
  		if(req.session.lastPage == '/survey/1'){
  			allowed = true;
  		}else{
  			allowed = false;
  		}
  	}else if(number == 3){
  		if(req.session.lastPage == '/survey/2'){
  			allowed = true;
  		}else{
  			allowed = false;
  		}
	}else if(number == 4){
  		if(req.session.lastPage == '/survey/3'){
  			allowed = true;
  		}else{
  			allowed = false;
  		}
  	}
return allowed; 
}