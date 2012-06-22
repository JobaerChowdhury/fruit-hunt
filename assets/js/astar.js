/* Pseudo-code
 push startNode onto openList
 while(openList is not empty) {
 currentNode = find lowest f in openList
 if currentNode is final, return the successful path
 push currentNode onto closedList and remove from openList
 foreach neighbor of currentNode {
 if neighbor is not in openList {
 save g, h, and f then save the current parent
 add neighbor to openList
 }
 if neighbor is in openList but the current g is better than previous g {
 save g and f, then save the current parent
 }
 }

 */

var WIDTH = 10;
var HEIGHT = 10;

function is_equal(first, second) {
    return (first.x == second.x && first.y == second.y);
}

var astar = {
    init:function () {
        for (var x = 0; x < WIDTH; x++) {
            for (var y = 0; y < HEIGHT; y++) {
                grid[x][y].f = 0;
                grid[x][y].g = 0;
                grid[x][y].h = 0;
                grid[x][y].parent = null;
            }
        }
    },

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

    is_present: function(nodeList, node) {
        return astar.index_of(nodeList, node) > 0;
    },

    remove_node:function (nodeList, node) {
        var index = astar.index_of(nodeList, node);
        if (index > 0) {
            nodeList.splice(i, 1);
        }
    },

    search:function (grid, start, end) {
        astar.init(grid);
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

            var neighbors = astar.neighbors(grid, currentNode);
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
    },

    heuristic:function (pos0, pos1) {
        // This is the Manhattan distance
        return Math.abs(pos1.x - pos0.x) + Math.abs(pos1.y - pos0.y);
    },

    neighbors:function (grid, node) {
        var ret = [];
        var x = node.pos.x;
        var y = node.pos.y;
        if (grid[x - 1] && grid[x - 1][y]) {
            ret.push(grid[x - 1][y]);
        }
        if (grid[x + 1] && grid[x + 1][y]) {
            ret.push(grid[x + 1][y]);
        }
        if (grid[x][y - 1] && grid[x][y - 1]) {
            ret.push(grid[x][y - 1]);
        }
        if (grid[x][y + 1] && grid[x][y + 1]) {
            ret.push(grid[x][y + 1]);
        }
        return ret;
    }
};