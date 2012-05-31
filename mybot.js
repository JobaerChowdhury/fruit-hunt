function new_game() {
}

function make_move() {
   var board = get_board();
   
   // we found an item! take it!
   if (board[get_my_x()][get_my_y()] > 0) {
       return TAKE;
   }

   var rand = Math.random() * 4;

   if (rand < 1) return NORTH;
   if (rand < 2) return SOUTH;
   if (rand < 3) return EAST;
   if (rand < 4) return WEST;

   return PASS;
}


function update_strategy(){
  // will be called each time before taking next step. 
}

function next_best(){
  // return the next best item to go for 
}

function get_available_items(){
  var available_items = new Array();
  
  var board = get_board();  
  for(var i=0; i<WIDTH; i++){
    for(var j=0; j<HEIGHT; j++) {
	  var item_type = board[i][j];
	  if(item_type>0){
	   available_items.push(new Item(item_type, i, j));
	  }
	}
  }
  
  return available_items;
}

function Item(item_type, x, y){
  this.item_type = item_type;
  this.x = x;
  this.y = y;
}

