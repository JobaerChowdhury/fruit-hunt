//todo - optimize javascript - minimize visibility, scopes etc - read the best practices and apply those
//todo - there are a lot of top-level functions, may be that can be minimized.
//todo - get rid of the data-structures and maybe use arrays instead - in a readable manner.
function new_game() {

}

function make_move() {
    var board = get_board();

    // only take if it is worthy!
    var item_type = board[get_my_x()][get_my_y()];
    if (item_type > 0) {
        if (is_beneficial(new Item(item_type, new Point(get_my_x(), get_my_y())))) {
            return TAKE;
        }
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

    //todo - find better alternative than this. - like pursue closes item.
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

function is_beneficial(target_item) {
    return !opponent_has_more_than_half(target_item) && !i_have_more_than_half(target_item);
}

function opponent_has_more_than_half(item) {
    var item_type = item.item_type;
    var total = get_total_item_count(item_type);
    var opponent_has = get_opponent_item_count(item_type);

    return opponent_has > Math.floor(total / 2.0);
}

function i_have_more_than_half(item) {
    var item_type = item.item_type;
    var total = get_total_item_count(item_type);
    var i_have = get_my_item_count(item_type);

    return i_have > Math.floor(total / 2.0);
}

function is_worthy(my_position, opponent_position, target_item) {
    function opponent_is_not_closer() {
        return distance(my_position, target_item.position) <= distance(opponent_position, target_item.position);
    }

    return opponent_is_not_closer() && is_beneficial(target_item);
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

function is_equal(first, second) {
    return (first.x == second.x && first.y == second.y);
}

/*
 This will compute and return the Manhattan distance between source and destination.
 */
function distance(source, dest) {
    return Math.abs(dest.x - source.x) + Math.abs(dest.y - source.y);
}

function find_astar_path(source, dest) {
     return astar.search(source, dest)
}

var astar = {
    init:function () {

    },

    // todo - implement using priority queue or binary heap
    get_lowest:function (openList) {
        // Grab the lowest f(x) from the list
        var lowInd = 0;
        for (var i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowInd].f) {
                lowInd = i;
            }
        }

        return openList[lowInd];
    },

    get_path_from_node:function (node) {
        var curr = node;
        var ret = [];
        while (curr.parent) {
            ret.push(curr);
            curr = curr.parent;
        }
        return ret.reverse();
    },

    index_of:function (nodeList, node) {
        for (var i = 0; i < nodeList.length; i++) {
            if (is_equal(nodeList[i], node)) {
                return i;
            }
        }
        return -1;
    },

    is_present:function (nodeList, node) {
        return astar.index_of(nodeList, node) > 0;
    },

    remove_node:function (nodeList, node) {
        var index = astar.index_of(nodeList, node);
        if (index > 0) {
            nodeList.splice(i, 1);
        }
    },

    heuristic: function (node1, node2) {
        //todo - considering distance only for now, in future - rarity,chance will be considered as well.
        return distance(node1, node2);
    },

    neighbors:function (node) {
        var result = [];
        if ((node.x + 1) >= WIDTH && (node.y + 1) >= HEIGHT) {
        } else if ((node.x + 1) >= WIDTH && (node.y + 1) < HEIGHT) {
            result.push(new Point(node.x, node.y + 1));
        } else if ((node.x + 1) < WIDTH && (node.y + 1) >= HEIGHT) {
            result.push(new Point(node.x + 1, node.y));
        } else {
            result.push(new Point(node.x, node.y + 1));
            result.push(new Point(node.x + 1, node.y));
        }

        return result;
    },

search:function (start, end) {
        var grid = [];
        for (var x = 0; x < WIDTH; x++) {
            grid[x] = [];
            for (var y = 0; y < HEIGHT; y++) {
                grid[x][y].point = new Point(x,y);
                grid[x][y].f = 0;
                grid[x][y].g = 0;
                grid[x][y].h = 0;
                grid[x][y].parent = null;
            }
        }

        var openList = [];
        var closedList = [];
        openList.push(start);
        while (openList.length > 0) {
            var currentNode = astar.get_lowest(openList);
            // End case -- result has been found, return the traced path
            if (is_equal(currentNode, end)) {
                return astar.get_path_from_node(currentNode);
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors
            astar.remove_node(openList, currentNode);
            closedList.push(currentNode);

            var neighbors = neighbors(currentNode);
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                if (astar.is_present(closedList, neighbor)) {
                    // not a valid node to process, skip to next neighbor
                    continue;
                }

                // g score is the shortest distance from start to current node, we need to check // the path we have arrived at this neighbor is the shortest one we have
                var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
                var gScoreIsBest = false;
                if (!astar.is_present(openList, neighbor)) {
                    // This the the first time we have arrived at this node, it must be the // Also, we need to take the h (heuristic) score since we haven't done
                    gScoreIsBest = true;
                    neighbor.h = astar.heuristic(neighbor.pos, end.pos);
                    openList.push(neighbor);
                }
                else if (gScore < neighbor.g) {
                    // We have already seen the node, but last time it had a worse g (distance
                    gScoreIsBest = true;
                }
                if (gScoreIsBest) {
                    // Found an optimal (so far) path to this node. Store info on how we // just how good it really is...
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                }
            }
        }

        // No result was found -- empty array signifies failure to find path
        return [];
    }
};

/*
 This will return an array containing the moves that needs to be performed to reach 
 from source to dest by following the shortest path. 
 */
function shortest_path_between_points(source, dest) {
    return recursive_path_calculator(new Array(), source, dest);
}

function recursive_path_calculator(result, source, dest) {
    if (is_equal(source, dest)) {
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