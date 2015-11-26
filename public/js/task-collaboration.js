//此程式含有特別的「id前綴」，目的是用於(1)避免原生jsDOM方法不接受數字開頭的query (2)加快任何的query速度(減少次數)。
var socket = io.connect();
var Global = this;

socket.on('emit todo content', function(data){
	console.log('todo refresh');
	var $el = $('#li'+data._id).children('.collapsible-body');
	$el.html(data.content);
});

socket.on('emit new todo', function(data){
	var html = get_todo_html(data);
	$('.collapsible').append(html);
	var $el = $('#li'+data._id).children('.collapsible-body');
    todo_regist($el);
});


//collection
function collection_init(){
	var task_id = document.getElementById('task-id').innerHTML;
	$.post('/findAllTodo',{},function(data){
		console.log('init:',data);
		data.forEach(function (t){
			todo_deploy(t, function(el){
				todo_regist(el);
			});
		});
	});
	function todo_deploy(data, callback){
		//append html per todo using data._id, data.status, data.title, data.content
		var html = get_todo_html(data);
		$('.collapsible').append(html);
		var el = $('#li'+data._id).children('.collapsible-body');
		callback(el);
	}
}

Global.collection_lock = false;
function todo_regist(el){ // el is .collapsible-body
	el.dblclick(function(){
		var $this = $(this);
		$this.attr("contentEditable","true");
	}).blur(function(){
		if(!Global.collection_lock){
			var $this = $(this);
			$this.attr("contentEditable","false");
		}
	}).keyup(function(){
		var target = $(this).parent().attr('id');
		var formatted_tartget = target.substr(target.indexOf("li")+2,target.length-2); // for <li id='li...'>
		var content = $(this).html();
		var data = {todo_id: formatted_tartget, content: content};
		//socket.emit
		socket.emit('update todo content',data);
	});
	//collapsible
	$('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
}

function get_todo_html(data){
	//WARNING : 需補上data.status的判斷
	var html = "<li id='li"+data._id+"'><input type='checkbox' class='filled-in' id='checkbox"+data._id+"' /><label for='checkbox"+data._id+"' style='position:absolute; margin-top:12px; margin-left:12px'></label><div class='collapsible-header' style='display: inline-block; width:100%''><i class='material-icons'>place</i><span id='todos-title'>"+data.title+"</div><div class='collapsible-body' id='todos-content' contentEditable='false'>"+data.content+"</div></li>";
	return html
}


//UI method
function add_todo(){
	// WARNING : 需補上task_id
	socket.emit('create todo',[],function(){});
}

function sortable_button_init(){
	$('#button_sortable').click(function(){
		var state = sortable_api.option("disabled"); // get
		sortable_api.option("disabled", !state); // set
	});
}
