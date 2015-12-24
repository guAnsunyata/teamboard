//此程式含有特別的「id前綴」，目的是用於(1)避免原生jsDOM方法不接受數字開頭的query (2)加快任何的query速度(減少次數)。
var socket = io.connect();
var Global = this;

socket.on('emit todo title', function(data){
	console.log('todo title refresh');
	var $el = $('#li'+data._id).children('.collapsible-header').children('.todos-title');
	$el.html(unescape(data.title));
});

socket.on('emit todo content', function(data){
	console.log('todo content refresh');
	var $el = $('#li'+data._id).children('.collapsible-body');
	$el.html(unescape(data.content));
});

socket.on('emit new todo', function(data){
	console.log('new todo refresh');
	var html = get_todo_html(data);
	$('.collapsible').append(html);
	var $el = $('#li'+data._id);
    todo_regist($el);
});
socket.on('emit new todo and focus', function(data){
	var $el = $('#li'+data._id);
	$el.children('.todos-title').attr('contentEditable','true').focus();
});

socket.on('emit todo checker', function(data){
	var $el = $('#li'+data._id).children('input[type=checkbox]');
	var state = $el.prop('checked');
	console.log(!state);
	$el.prop('checked', !state);
	//var state2 = $el.prop('checked');
	//console.log(state2);
	console.log('todo checker refresh');
});

socket.on('emit update todo order', function(data){
	/* data : 
	 * todo_id : target
	 * before : todo_id which is before to the target aftering relocated.
	 */
	 console.log('emit update order '+data);
});

// socket.on('emit todo order', function(data){
// 	var $el = $('#li'+data._id).children('.checkbox');
// 	var state = $el.attr('checked');
// 	$el.prop('checked', !state);
// });
var task_id = '5655a784dbb681cc10b5f03d';
//collection
function collection_init(){
	$.post('/api/findAllTodo',{task_id:task_id},function(data){
		console.log('init:',data);
		function compare(a,b) {
		  if (a.order < b.order)
		    return -1;
		  if (a.order > b.order)
		    return 1;
		  return 0;
		}
		//data = data.sort(compare);
		data.sort(compare).forEach(function (t){
			todo_deploy(t, function(el){
				todo_regist(el);
			});
		});
	});
	function todo_deploy(data, callback){
		//append html per todo using data._id, data.status, data.title, data.content
		var html = unescape(get_todo_html(data));
		$('.collapsible').append(html);
		var $el = $('#li'+data._id);
		callback($el);
	}
}

Global.collection_lock = false;
function todo_regist($el){ // el is whole <li>
	$el.children('.collapsible-body').dblclick(function(){
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
		content = escape(content);
		var data = {todo_id: formatted_tartget, content: content};
		//socket.emit
		socket.emit('update todo content',data);
	});
	//todo status
	$el.children('label').click(function(){
		var target = $(this).parent().attr('id');
		var formatted_tartget = target.substr(target.indexOf("li")+2,target.length-2);
		//WARNING : 未知問題，正常運作
		var check = $el.children('input[type=checkbox]').prop('checked');
		console.log(check);
		var data = {
			todo_id: formatted_tartget,
			checker: !check
		}
		socket.emit('update todo checker',data);
	});
	$el.children('.collapsible-header').children('.todos-title').click(function(){
		$(this).attr('contentEditable','true');
	}).blur(function(){
		var $this = $(this);
		$this.attr('contentEditable','false');
		//socket.emit
		var target = $(this).parent().parent().attr('id');
		var formatted_tartget = target.substr(target.indexOf("li")+2,target.length-2); // for <li id='li...'>
		var content = $(this).html();
		content = escape(content);
		var data = {todo_id: formatted_tartget, title: content};
		content = escape(content);
		socket.emit('update todo title',data);
	});
	//collapsible
	$('.collapsible').collapsible({
      accordion : false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
}

function get_todo_html(data){
	//WARNING : 需補上data.status的判斷
	var checked = false;
	if(data.checker){ checked = 'checked'}else{ checked = '' };
	var html = "<li id='li"+data._id+"'><input type='checkbox' class='filled-in' id='checkbox"+data._id+"' "+checked+" /><label for='checkbox"+data._id+"' style='position:absolute; margin-top:12px; margin-left:12px'></label><div class='collapsible-header' style='display: inline-block; width:100%''><i class='material-icons'>place</i><span class='todos-title'>"+data.title+"</span></div><div class='collapsible-body' id='todos-content' contentEditable='false'>"+data.content+"</div></li>";
	return html
}


//UI method
function add_todo(){
	// WARNING : 需補上task_id
	socket.emit('create todo',{task_id:task_id},function(){});
}

function sortable_button_init(){
	$('#button_sortable').click(function(){
		var state = sortable_api.option("disabled"); // get
		sortable_api.option("disabled", !state); // set
		this.enabled = !this.enabled; //toggle pattern
	    if(this.enabled) {
	        $('.collapsible-header').css('cursor','pointer');
	    } else {
	        $('.collapsible-header').css('cursor','default');
	    }
	});
}

//$('.collapsible-header').off();
//$('.collapsible').collapsible();
//$('.collapsible-header').click();

