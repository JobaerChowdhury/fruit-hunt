//todo - optimize javascript - minimize visibility, scopes etc - read the best practices and apply those
//todo - there are a lot of top-level functions, may be that can be minimized.
function new_game() {

}

function make_move() {
    var board = get_board();

    // we found an item! take it!
    if (board[get_my_x()][get_my_y()] > 0) {
        return TAKE;
    }

    var my_position = new Point(get_my_x(), get_my_y());
    var opponent_position = new Point(get_opponent_x(), get_opponent_y());

    //start with the least available item
    // find all the occurrences of it in the board
    // which one is closes?
    // is it worth to pursue it - if yes, then go for that direction

    var available_map = get_total_sorted_by_availability();
    while (available_map.length > 0) {
        var current = available_map.shift();
        var current_type = current.item_type;

        var all_items_of_type = get_existing_items_of_type(current_type);

        var sorted_items = get_items_sorted_by_closeness(my_position, all_items_of_type);
        for (var i = 0; i < sorted_items.length; i++) {
            var current_item = sorted_items[i];
            if (is_worthy(my_position, opponent_position, current_item)) {
                //pursue the item
                return shortest_path_between_points(my_position, current_item.position).shift();
            }
        }
    }

    //if nothing matches above then return a random move
    return make_random_move();
}

function get_total_sorted_by_availability() {
    var available_map = get_available_total();

    //now sort this according to minimum number available.
    function sortByAvailability(a, b) {
        return ((a.available < b.available) ? -1 : ((a.available > b.available) ? 1 : 0));
    }
    available_map.sort(sortByAvailability);

    return available_map;
}

function make_random_move() {
    var rand = Math.random() * 4;

    if (rand < 1) return NORTH;
    if (rand < 2) return SOUTH;
    if (rand < 3) return EAST;
    if (rand < 4) return WEST;

    return PASS;
}

function is_worthy(my_position, opponent_position, target_item) {
    function opponent_is_not_closer() {
        return distance(my_position, target_item.position) <= distance(opponent_position, target_item.position);
    }

    return opponent_is_not_closer();
}

function get_items_sorted_by_closeness(my_position, items) {
    function comparator_by_distance(a, b) {
        var distance_from_a = distance(my_position, a.position);
        var distance_from_b = distance(my_position, b.position);
        return ((distance_from_a < distance_from_b) ? -1 : ((distance_from_a > distance_from_b) ? 1 : 0));
    }

    return items.sort(comparator_by_distance);
}

function get_existing_items_of_type(item_type) {
    var result = new Array();

    var available_items = get_available_items();
    for (var i = 0; i < available_items.length; i++) {
        var item = available_items[i];
        if (item.item_type == item_type) {
            result.push(item);
        }
    }

    return result;
}

/*
 Returns a map - containing the number of items available for picking or owned. This map will be used 
 to determine which item-type we should target next.
 */
function get_available_total() {
    var number_it = get_number_of_item_types();

    var available_total = new Array();
    for (var i = 1; i <= number_it; i++) {
        var available = get_total_item_count(i) - get_opponent_item_count(i);
        available_total.push(new ItemAvailability(i, available));
    }
    return available_total;
}

function get_available_items() {
    var available_items = new Array();

    var board = get_board();
    for (var i = 0; i < WIDTH; i++) {
        for (var j = 0; j < HEIGHT; j++) {
            var item_type = board[i][j];
            if (item_type > 0) {
                var p = new Point(i, j);
                available_items.push(new Item(item_type, p));
            }
        }
    }

    return available_items;
}

function Item(item_type, point) {
    this.item_type = item_type;
    this.position = point;
}


function ItemAvailability(item_type, available) {
    this.item_type = item_type;
    this.available = available;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

/*
 This will compute and return the distance between source and destination. 
 */
function distance(source, dest) {
    // use just mathematics since the paths are simple
    if (source.x == dest.x && source.y == dest.y) {
        return 0;
    } else if (source.x == dest.x) {
        return Math.abs(source.y - dest.y);
    } else if (source.y == dest.y) {
        return Math.abs(source.x - dest.x);
    } else {
        return distance(source, new Point(dest.x, source.y)) + distance(new Point(dest.x, source.y), dest);
    }
}

/*
 This will return an array containing the moves that needs to be performed to reach 
 from source to dest by following the shortest path. 
 */
function shortest_path_between_points(source, dest) {
    return recursive_path_calculator(new Array(), source, dest);
}

function recursive_path_calculator(result, source, dest) {
    if (source.x == dest.x && source.y == dest.y) {
        return result;
    } else if (source.x == dest.x) {
        if (source.y > dest.y) {
            // go left/west
            result.push(NORTH);
            return recursive_path_calculator(result, new Point(source.x, (source.y - 1)), dest);
        } else {
            // go right/east
            result.push(SOUTH);
            return recursive_path_calculator(result, new Point(source.x, (source.y + 1)), dest)
        }
    } else if (source.y == dest.y) {
        if (source.x > dest.x) {
            //go up/ north
            result.push(WEST);
            return recursive_path_calculator(result, new Point((source.x - 1), source.y), dest);
        } else {
            // go down/south
            result.push(EAST);
            return recursive_path_calculator(result, new Point((source.x + 1), source.y), dest);
        }
    } else {
        var intermediate_point = new Point(dest.x, source.y);
        var path1 = recursive_path_calculator(new Array(), source, intermediate_point);
        var path2 = recursive_path_calculator(new Array(), intermediate_point, dest);
        return path1.concat(path2);
    }
}


/* 
 Assumption - It seems if the number of item types is 4 then the specific types will be 1,2,3,4. 
 If this assumptions turns out to be wrong then code needs to be fixed. 
 */