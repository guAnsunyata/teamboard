var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io').listen(server);
var mongoose = require('./api/db');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

var ProjApi = require('./api/project');
var Proj = new ProjApi();
var TaskApi = require('./api/task');
var Task = new TaskApi();
var TodoApi = require('./api/todo');
var Todo = new TodoApi;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
server.listen(3000);

//view engine
var handlebars = require('express3-handlebars').create({defaultLayout: 'main'});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Configuring Passport
var passport = require('passport');
require('./passport/passport')(passport);
var expressSession = require('express-session');
// TODO - Why Do we need this key ?
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

// include routes
require('./routes/index')(app, passport);

//test
// socket.io
/* 冠德：socket.emit傳req為錯誤作法，無法確認更新是否成功。 */
io.sockets.on('connection', function (socket){
	socket.on('create task', function (req, callback) {
		/* create 的參數 req 需要有:
		 * 		proj_id: 	_id of the project
		 *		name: 			String,
		 *		desc: 			String,
		 *		finisheddate: 	Date,
		 *		startdate:		Date,
		 *		duedate:		Date,
		 *		leader:			Schema.Types.ObjectId,
		 *		collabs:		[Schema.Types.ObjectId],
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
		 */
		Todo.create(req, function (data) {
			console.log('create todo finished');
			var dataForTaskUpdate = {
				task_id: req.task_id,
				todo_id: data._id
			}
			// update todos field in the task model after todo was created.
			Task.pushTodoID(dataForTaskUpdate, function (data) {
				//console.log(data);
			});
			io.sockets.emit('emit new todo', data);
		})
	});
	socket.on('update todo title', function (req, callback) {
		/* updateTitle 的參數 req 需要有:
		 * 		todo_id: 	_id of the task
		 * 		title: 		new description of the task
		 */
		Todo.updateTitle(req, function (data) {
		 	socket.broadcast.emit('emit todo title', data);
		})
	});
	socket.on('update todo content', function (req, callback) {
		/* updateContnet 的參數 req 需要有:
		 * 		todo_id: 	_id of the task
		 * 		content: 	new description of the task
		 */
		Todo.updateContent(req, function (data) {
			socket.broadcast.emit('emit todo content', data);
		})
	});
	socket.on('update todo checker', function (req, callback) {
		/* updateChecker 的參數 req 需要有:
		 * 		todo_id: 	_id of the task
		 * 		checker: 	todo checkbox status(t/f)
		 */
		Todo.updateChecker(req, function (data) {
			socket.broadcast.emit('emit todo checker', data);
		})
	});
	socket.on('update todo order', function (req, callback) {
		/* updateOrder 的參數 req 需要有:
		 * 		todo_id: 	_id of the task
		 * 		before: 	order number of the todo before change
		 *		after: 		order number of the todo after change
		 */
		 Todo.updateOrder(req, function (data) {
		 	// 目前回傳資料為被刪除的todo所屬的task的所有資料
		 	socket.broadcast.emit('emit update todo order', req);
		 	
		 })
	});
	socket.on('update todo duedate', function (req, callback) {
		/* updateDuedate 的參數 req 需要有:
		 * 		todo_id: 	_id of the task
		 *		duedate: 	date
		 */
		 console.log('due');
		Todo.updateDuedate(req, function (data) {
		 	socket.broadcast.emit('emit update todo duedate', req);
		})
	});
	socket.on('update collabs', function (req, callback) {
		socket.broadcast.emit('emit update collabs', req);
	});
	socket.on('delete todo', function (req, callback) {
		/* delete 的參數 req 需要有:
		 * 		todo_id: 	_id of the task
		 */
		 console.log('del : ', req);
		Todo.delete(req, function (data) {
			io.sockets.emit('emit todo delete', req);
		})
	});
	socket.on('yell', function (req, callback){
		var data = {
			yell: req.yell,
			user: req.user
		}
		io.sockets.emit('emit yell', data);
	});
});

// test update
app.post('/testupdate', function (req, res) {
	Todo.updateCheckerTest(req, function (data) {
		res.json(data);
	})
});

/* Project api */
// create project
app.get('/newProj', function (req, res) {
  Proj.create(req, function (data) {
  	res.json(data);
  	console.log('new fucking project has been created!');
  })
});
// find project by id
app.post('/api/findProj', function (req, res) {
  Proj.find(req, function (data) {
  	res.json(data);
  })
});
// update project name
app.post('/api/updateProjName', function (req, res) {
  var q = { // test project
  	proj_id: '5653015b58fe43dc186ec0a0',
  	name: 'test proj.'
  }
  Proj.updateName(req, function (data) {
  	res.json(data);
  });
});
// update project description
app.post('/api/updateProjDesc', function (req, res) {
  Proj.updateDesc(req, function (data) {
  	res.json(data);
  })
});

/* Task api */
// create task
app.post('/api/createTask', function (req, res) {
	Task.create(req, function (data) {
		res.json(data);
	});
});
app.post('/api/deleteTask', function (req, res) {
	Task.delete(req, function (data) {
		res.json(data);
	});
});
// find task by project id
app.post('/api/getCount', function (req, res) {
	Proj.getProj(req, function (data) {
		// Proj.temp();
		function count(data, callback) {
			var totalTask = data.tasks.length;
			var finishedTask = 0;
			var totalTodo = 0;
			var finishedTodo = 0;
			
			var projDuedate = data.duedate;
			var projStartdate = data.startdate;
			var projDuration = getDayDiff(projDuedate, projStartdate)+1;
			console.log("projDuration: " + projDuration);
			var PerDay_todoFinishedCountArr = [];
			for (var i = 0; i < projDuration; i++) {
				PerDay_todoFinishedCountArr[i] = 0;
			};
			for(var task in data.tasks){
				// 判斷task是否已完成
				if(data.tasks[task].finished)
					// task已完成 finishedTask記數+1
					finishedTask++;
				// 判斷task之下有沒有todo
				if(data.tasks[task].todos!=null){
					// 有todo 取得todo個數
					totalTodo += data.tasks[task].todos.length;
					for(var todo in data.tasks[task].todos){
						if(data.tasks[task].todos[todo].checker){
							finishedTodo++;
							var todo = data.tasks[task].todos[todo];
							var diff_projStartdate_todoFinisheddate = getDayDiff(todo.finisheddate, projStartdate);
							// console.log(diff_projStartdate_todoFinisheddate);
							PerDay_todoFinishedCountArr[diff_projStartdate_todoFinisheddate]++;
						}
					}
				}
			}
			var todoFinishedCountArr = [];
			var last_day_with_finished_todo = 0;
			for (var i = 0; i < projDuration; i++) {
				if (PerDay_todoFinishedCountArr[i] != 0) 
					last_day_with_finished_todo = i ;
			};
			todoFinishedCountArr[0] = PerDay_todoFinishedCountArr[0];
			for (var i = 1; i <= last_day_with_finished_todo; i++) {
				todoFinishedCountArr[i] = todoFinishedCountArr[i-1] + PerDay_todoFinishedCountArr[i];
			};
			callback(totalTask, finishedTask, totalTodo, finishedTodo, todoFinishedCountArr, projDuration, data);
		}
		function getDayDiff(dateA, dateB){
			var a = new Date(dateA.getFullYear()+"-"+(dateA.getMonth()+1)+"-"+dateA.getDate());
			var b = new Date(dateB.getFullYear()+"-"+(dateB.getMonth()+1)+"-"+dateB.getDate());
			var oneDay = 24*60*60*1000;
			return Math.round(Math.abs((a.getTime()-b.getTime())/(oneDay)));
		}
		var combineData = function(totalTask, finishedTask, totalTodo, finishedTodo, todoFinishedCountArr, projDuration, data) {
			var dataToReturn = {
				totalTask: totalTask,
				finishedTask: finishedTask,
				totalTodo: totalTodo,
				finishedTodo: finishedTodo,
				todoFinishedCountArr: todoFinishedCountArr,
				projDuration: projDuration,
				projectData: data
			}
			res.json(dataToReturn);
		}
		count(data, combineData);
	})
});
app.post('/findAllTask', function (req, res) {
	Task.findAll(req, function (data) {
		res.json(data);
	})
});
// update task
app.post('/updateTask', function (req, res) {
	Task.update(req, function (data) {
		res.json(data);
	})
});
app.get('/deleteAllTask', function (req, res) {
	Task.deleteAll(req, function (data) {
		res.status(data).end();
	});
});
app.get('/tryPull', function (req, res) {
	Task.tryPull(req, function (data) {
		res.json(data);
	})
});

/* Todo api */
// use _id of task to create todo
app.post('/api/getTodoCollabs', function (req, res) {
	Todo.getCollabs(req, function (data) {
		res.json(data);
	})
});
app.post('/api/assignTodo', function (req, res) {
	Todo.assign(req, function (data) {
		res.json(data);
	})
});
app.post('/api/createTodo', function (req, res) {
	Todo.create(req, function (data) {
		var dataForTaskUpdate = {
			task_id: req.body.task_id,
			todo_id: data._id
		}
		// update todos field in the task model after todo was created.
		Task.pushTodoID(dataForTaskUpdate, function (data) {
			res.json(data);
		})
	})
});
app.post('/api/findAllTodo', function (req, res) {
	Todo.findAll(req, function (data) {
		res.json(data);
	})
});
app.get('/api/todos', function (req, res) {
	Todo.find(req, function (data) {
		res.json(data);
	})
});
app.post('/api/updateTodoOrder', function (req, res) {
	Todo.updateOrder(req, function (data) {
		res.json(data);
	})
});
app.get('/delAllTodo', function (req, res) {
	Todo.deleteAll(req, function (data) {
		res.status(data).end();
	});
});
app.post('/delt5Todo', function (req, res) {
	Todo.delete(req, function (data) {
		res.json(data);
	});
});
// test page for api testing!
app.get('/test', function (req, res) {
	res.render('test', {layout: 'layout'});
});

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

app.get('/dashboard', function (req, res) {
  res.render('dashboard', {layout: 'layout'});
});

app.get('/chatroom', function (req, res){
	res.render('chatroomPartial.handlebars', {layout: null});
});

app.get('/task', function (req, res) {
  res.render('task2', {layout: 'layout'});
});

app.get('/filesmgr', function (req, res) {
  res.render('filesmanager', {layout: 'layout'});
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

//when Ctrl+C happened in node
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log(' : Mongoose disconnected on app termination');
    process.exit(0);
  });
});


var testing_proj_id = '5653015b58fe43dc186ec0a0';
var testing_task_id = '5655a784dbb681cc10b5f03d';