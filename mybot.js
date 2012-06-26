//todo - optimize javascript - minimize visibility, scopes etc - read the best practices and apply those
//todo - there are a lot of top-level functions, may be that can be minimized.
function new_game() {

}

function make_move() {
    var board = get_board();

    var my_x = get_my_x();
    var my_y = get_my_y();
    var my_position = new Point(my_x, my_y);

    var opponent_position = new Point(get_opponent_x(), get_opponent_y());

    var item_type = board[my_x][my_y];
    if (item_type > 0) {
        var item_heat = calculate_heat_for_item_type(item_type, my_position, my_position);
        var significant_difference = differs_significantly(goal_heat, item_heat);
        if (is_beneficial(item_type) && !significant_difference) {
            return TAKE;
        }
    }

    return follow_heated_items(my_position, opponent_position, board);
}

function follow_heated_items(my_position, opponent_position, board) {
    var grid = [];
    initialize_grid(grid, board, my_position, opponent_position);
    var most_heated = get_most_heated_item(grid);
    if (most_heated == undefined) {
        return make_random_move();
    } else {
        goal_heat = most_heated.heat;
        var path = find_astar_path(my_position, most_heated.point);
        return follow_path(my_position, path);
    }
}

function get_most_heated_item(grid) {
    var heated = [];

    var highest_heat = 0;
    for (var x = 0; x < WIDTH; x++) {
        for (var y = 0; y < HEIGHT; y++) {
            var current_heat = grid[x][y].heat;
            if (current_heat > highest_heat) {
                highest_heat = current_heat;
            }
        }
    }

    for (var j = 0; j < WIDTH; j++) {
        for (var k = 0; k < HEIGHT; k++) {
            if (grid[j][k].heat == highest_heat) {
                heated.push(grid[j][k]);
            }
        }
    }

    if (heated.length == 1) {
        return heated[0];
    }

    var rarest = 0;
    var result;
    for (var i = 0; i < heated.length; i++) {
        if (heated[i].rarity > rarest) {
            rarest = heated[i].rarity;
            result = heated[i];
        }
    }

    return result;
}

function initialize_grid(grid, board, my_position, opponent_position) {
    for (var x = 0; x < WIDTH; x++) {
        grid[x] = [];
        for (var y = 0; y < HEIGHT; y++) {
            grid[x][y] = {};
            grid[x][y].point = new Point(x, y);
            grid[x][y].item_type = board[x][y];
            calculate_heat(grid[x][y], my_position, opponent_position);
        }
    }
}

function differs_significantly(heat1, heat2) {
    return heat1 > 2.1 * heat2; // more than double
}

function calculate_heat(item, my_position, opponent_position) {
    if (item.item_type == 0) {
        item.heat = 0;
        item.rarity = 0;
    } else if (!is_beneficial(item.item_type)) {
        item.heat = 0;
        item.rarity = 0;
    } else {
        item.rarity = calculate_rarity(item.item_type);
        item.heat = calculate_heat_for_item_type(item.item_type, my_position, item.point);
    }
}

function calculate_heat_for_item_type(item_type, my_position, point) {
    var rarity = calculate_rarity(item_type);
    var dist = distance(my_position, point);
    if(dist == 0) dist = 0.9; // avoid divide by 0

    return rarity * rarity * (1.0 / dist);
}

function calculate_rarity(item_type) {
    var iw = how_many_i_need(item_type);
    var ow = how_many_opponent_need(item_type);
    var ab = get_available_on_board(item_type);

    return (1 / iw ) * 10;
}

function get_available_on_board(item_type) {
    return get_total_item_count(item_type) - (get_my_item_count(item_type) + get_opponent_item_count(item_type));
}


function make_random_move() {
    var rand = Math.random() * 4;

    if (rand < 1) return NORTH;
    if (rand < 2) return SOUTH;
    if (rand < 3) return EAST;
    if (rand < 4) return WEST;

    return PASS;
}

function is_beneficial(item_type) {
    return !opponent_has_more_than_half(item_type) && !i_have_more_than_half(item_type);
}

function opponent_has_more_than_half(item_type) {
    var total = get_total_item_count(item_type);
    var opponent_has = get_opponent_item_count(item_type);

    return opponent_has > (total / 2.0);
}

function i_have_more_than_half(item_type) {
    var total = get_total_item_count(item_type);
    var i_have = get_my_item_count(item_type);

    return i_have > (total / 2.0);
}

function to_win(item_type) {
    var total = get_total_item_count(item_type);
    return Math.ceil(total / 2.0);
}

function how_many_i_need(item_type) {
    var needed = to_win(item_type);
    var i_have = get_my_item_count(item_type);
    return needed - i_have;
}

function how_many_opponent_need(item_type) {
    var needed = to_win(item_type);
    var he_has = get_opponent_item_count(item_type);
    return needed - he_has;
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
            ret.push(curr.point);
            curr = curr.parent;
        }
        return ret.reverse();
    },

    index_of:function (nodeList, node) {
        for (var i = 0; i < nodeList.length; i++) {
            if (is_equal(nodeList[i].point, node.point)) {
                return i;
            }
        }
        return -1;
    },

    is_present:function (nodeList, node) {
        return astar.index_of(nodeList, node) >= 0;
    },

    remove_node:function (nodeList, node) {
        var index = astar.index_of(nodeList, node);
        if (index >= 0) {
            nodeList.splice(index, 1);
        }
    },

    heuristic:function (node, goal_node) {
        var dist = distance(node, goal_node);
        //todo - considering distance only for now, in future - rarity,chance will be considered as well.
        //nodes having item on them has lower h score.
        var item = get_board()[node.x][node.y];
        var h_val = 1;

        if (item > 0) {
            h_val = 0;
            if (is_beneficial(item)) {
                var i_need, opp_need;
                i_need = how_many_i_need(item);
                opp_need = how_many_opponent_need(item);
                if (i_need >= opp_need) {
                    h_val = 1 - (1.0 / i_need);
                } else {
                    h_val = 1 - (1.0 / (i_need + (opp_need - i_need)));
                }
            }
        }

        return (dist * 1) + h_val;
    },

    neighbors:function (node, grid) {
        var result = [];
        var x = node.point.x;
        var y = node.point.y;

        if (x + 1 < WIDTH) {
            result.push(grid[x + 1][y]);
        }
        if (x - 1 >= 0) {
            result.push(grid[x - 1][y]);
        }
        if (y + 1 < HEIGHT) {
            result.push(grid[x][y + 1]);
        }
        if (y - 1 >= 0) {
            result.push(grid[x][y - 1]);
        }

        return result;
    },

    search:function (start_position, goal) {
        var grid = [];
        for (var x = 0; x < WIDTH; x++) {
            grid[x] = [];
            for (var y = 0; y < HEIGHT; y++) {
                grid[x][y] = {};
                grid[x][y].point = new Point(x, y);
                grid[x][y].f = 0;
                grid[x][y].g = 0;
                grid[x][y].h = 0;
                grid[x][y].parent = null;
            }
        }

        var openList = [];
        var closedList = [];
        var start = grid[start_position.x][start_position.y];
        openList.push(start);
        while (openList.length > 0) {
            var currentNode = astar.get_lowest(openList);
            // End case -- result has been found, return the traced path
            if (is_equal(currentNode.point, goal)) {
                return astar.get_path_from_node(currentNode);
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors
            astar.remove_node(openList, currentNode);
            closedList.push(currentNode);

            var neighbors = astar.neighbors(currentNode, grid);
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
                    neighbor.h = astar.heuristic(neighbor.point, goal);
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
 * Returns the direction to follow the path
 * */
function follow_path(current_position, path) {
    var next_node = path[0];
    if (next_node == undefined) {
        return PASS;
    }

    if (current_position.x == next_node.x) {
        if (next_node.y > current_position.y) {
            return SOUTH;
        }
        else if (next_node.y < current_position.y) {
            return NORTH;
        }
    } else {
        if (next_node.x > current_position.x) {
            // move right
            return EAST;
        } else {
            return WEST;
        }
    }
    return PASS;
}