function new_game() {

}

function make_move() {
   var board = get_board();
   
   next_best();
   
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

// maybe sort all the items and give them some priority. then go after one by one. at the 
// begining of each move re-calculate the priorities.

function update_strategy(){
  // will be called each time before taking next step. 
}

function next_best(){
  var available_map = get_available_total(); 
  //now sort this according to minimum number available. 
  available_map.sort(sortByAvailability);
  var test = 12;

  // strategy --- which item has minimum numbers.   
  
  /*  is it worth to pursue that type of item?  -- pursue if you are closer or same distance than opponent.
       which is the closest?
	     is the opponent closer than me? 
		   go for that item.
		   
  */
}


/*
 Returns a map - containing the number of items available for picking or owned. This map will be used 
 to determine which item-type we should target next.
*/
function get_available_total(){
   var number_it = get_number_of_item_types();
   
   var available_total = new Array();
   for(var i=1; i<= number_it; i++) {
     var available = get_total_item_count(i) - get_opponent_item_count(i);
	 available_total.push(new ItemAvailability(i, available));
   }
   return available_total;
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


function ItemAvailability(item_type, available) {
  this.item_type = item_type;
  this.available = available;
}

function sortByAvailability(a, b) {
  var x = a.available;
  var y = b.available;
  return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

/* 
 Assumptions - 
 It seems if the number of item types is 4 then the specific types will be 1,2,3,4. 

*/

// find some suitable data structures. 
// Node, priority