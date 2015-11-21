var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io').listen(server);
var mongoose = require('./api/db');
var settings = mongoose.settings;
var step = require('step-master');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

var TaskApi = require('./api/task');
var Task = new TaskApi();
var TodoApi = require('./api/todo');
var Todo = new TodoApi;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
	secret: settings.cookieSecret,
	key: settings.db, //cookie name
	cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}, //30days
	store: new MongoStore({
		db: settings.db,
		host: settings.host,
		prot: settings.prot
	})
}));
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
server.listen(3000);

//view engine
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// //mongodb connection
// mongoose.connect('mongodb://localhost:27017/teamboard', function(err){
// 	if(err){
// 		console.log(err);
// 	} else{
// 		console.log('Connected to mongodb!');
// 	}
// });

//test
// socket.io
io.sockets.on('connection', function (socket){
	socket.on('create task', function (req, callback) {
		/* create 的參數 req 需要有:
		 * 		proj_id: 	_id of the project
		 */
		Task.create(req, function (data) {
			io.sockets.emit('emit new task', data);
		})
	});
	socket.on('update task name', function (req, callback) {
		/* updateName 的參數 req 需要有:
		 * 		task_id: 	_id of the task
		 * 		name: 		new name of the task
		 */
		Task.updateName(req, function (data) {
			io.sockets.emit('emit task name', data);
		})
	});
	socket.on('update task desc', function (req, callback) {
		/* updateDesc 的參數 req 需要有:
		 * 		task_id: 	_id of the task
		 * 		desc: 		new description of the task
		 */
		Task.updateDesc(req, function (data) {
			io.sockets.emit('emit task desc', data);
		})
	});
	socket.on('create todo', function (req, callback) {
		/* create 的參數 req 需要有:
		 * 		task_id: 	_id of the task
		 * 		desc: 		new description of the task
		 */
		console.log('create todo !!');
		Todo.create(req, function (data) {
			io.sockets.emit('emit new todo', data);
		})
	});
	socket.on('update todo title', function (req, callback) {
		/* updateTitle 的參數 req 需要有:
		 * 		todo_id: 	_id of the task
		 * 		title: 		new description of the task
		 */
		Todo.updateTitle(req, function (data) {
		 	if(data!=0){
		 		io.sockets.emit('emit todo title', data);
		 	}
		})
	});
	socket.on('update todo content', function (req, callback) {
		/* updateContnet 的參數 req 需要有:
		 * 		todo_id: 	_id of the task
		 * 		content: 	new description of the task
		 */
		Todo.updateContent(req, function (data) {
			if(data!=0){
		 		io.sockets.emit('emit todo content', data);
			}
		})
	});
});

/* Task CRUD */
app.get('/createTask', function (req, res) {
	Task.create(req, function (data) {
		res.json(data);
	});
});
app.get('/findAllTask', function (req, res) {
	Task.findAll(req, function (data) {
		function countFinished(data, callback) {
			var allTask = data.length;
			var finishedTask = 0;
			for(var task in data){
				if(task.finished)
					countFinished++;
			}
			callback(allTask, finishedTask, data);
		}
		var combineData = function(allTask, finishedTask) {
			var dataToReturn = {
				totalTask: allTask,
				finishedTask: finishedTask,
				mongoData: data
			}
			res.send(dataToReturn);
		}
		countFinished(data, combineData);
	});
});
// suposed to be app.post(...)
app.get('/updateTask', function (req, res) {
	Task.update(req, function (data) {
		res.json(data);
		console.log(data);
	})
});
app.get('/deleteAllTask', function (req, res) {
	Task.deleteAll(req, function (data) {
		res.status(data).end();
	});
});

/* Todo CRUD */
app.get('/createTodo', function (req, res) {
	Todo.create(req, function (data) {
		res.send(data);
	});
});
app.get('/findAllTodo', function (req, res) {
	Todo.findAll(req, function (data) {
		res.send(data);
	});
});
app.get('/delAllTodo', function (req, res) {
	Todo.deleteAll(req, function (data) {
		res.status(data).end();
	});
});

//test end

//New View
app.get('/home', function (req, res){
	res.render('home', {layout: 'layout'});
});


//global function
function checkLogin(req, res, callback){
	if(!req.session.user)
		res.redirect('/');
	//or Next
	callback();
}

//user
app.get('/', function (req, res) {
 	res.render('index', {layout: 'layout'});
});

var userAPI = require('./api/user');
app.post('/user/signup', function (req, res){
	var user = new userAPI({'name': req.body.name, 'password': req.body.password, 'email': req.body.email});
	user.get(user.email, function (err, data){
		if(data){
			res.send('err: user exist!');
		}else{
			user.save(function(err, data){
				req.flash('success', 'login success!');
				req.session.user = data; // save to session
				res.redirect('/');
			});
		}
	});
});
app.post('/user/login', function (req, res){
	var user = new userAPI({'password': req.body.password, 'email': req.body.email});
	user.get(user.email, function (err, data){
		if(data){
			if(data.password == user.password){
				req.session.user = data;
				res.redirect('/');
			}else{
				res.redirect('/user/login');
			}
		}else{
			res.redirect('user/login');
		}
	});
});
app.get('/user/db', function (req, res){
	var user = new userAPI({});
	user.get('', function (err, data){
		res.json(data);
	});
});
app.get('/user/find/:email', function (req, res){
	var user = new userAPI({});
	user.get(req.params.email, function (err, data){
		res.json(data);
	});
});

//schema
var boxSchema = mongoose.Schema({
	name: String,
	val: String,
	created: {type: Date, default: Date.now}
});

var Box = mongoose.model('Box', boxSchema);

//route
app.get('/signup', function (req, res) {
  res.render('signup', {layout: 'layout'});
});

app.post('/')

app.get('/dashboard', function (req, res) {
  res.render('dashboard', {layout: 'layout'});
});

app.get('/chatroom', function (req, res){
	res.render('chatroomPartial.handlebars', {layout: null});
});

app.get('/task', function (req, res) {
  res.render('task', {layout: 'layout'});
});

app.post('/api/getData', function(req, res) {
	var data = {'attr1':'321'};
	res.json(data);
});

app.get('/db', function (req, res) {
	db_findAll(function(data){
		console.log(data);
		res.render('db', {layout: null, result: data});
	});
});

app.get('/find/:name', function (req, res) {
	console.log('req:',req.params.name);
	Box.find({'name': req.params.name}, function(err, box){
		console.log('res:', box);
		if(box != ''){
			console.log("record fined");
		}else{
			console.log("record not fined");
		}
		res.render('db', {layout: null, result: res.json(box)});
	});
});

app.get('/clrall', function(req, res) {
	Box.remove({}, function(err, box) {
		if (err)
			res.send(err);
	});

	var data = Box.find(function(err, box){
		res.json(box);
	});
  	res.render('db', {layout: null, result: data});
});


//socket.io
io.sockets.on('connection', function(socket){
	console.log('Socket : a user connected');
});


