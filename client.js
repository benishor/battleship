CellContent = {
	NOTHING: 0,
	BODY: 1,
	HEAD: 2
};

Direction = {
	UP: 0,
	LEFT: 1,
	DOWN: 2,
	RIGHT: 3
};

var Shape = {
	shape: [
	{row:1, col:-1},
	{row:1, col:+1},
	{row:1, col:0},
	{row:2, col:0},
	{row:3, col:-1},
	{row:3, col:+1},
	{row:3, col:0},

	]
}

function Battleship(row, col, dir){
	var battleship = {
		head: {
			'row': row,
			'col': col
		},
		cells: [],
		direction: dir == undefined ? Direction.UP : dir
	}

	var cos = Math.cos(Math.PI * battleship.direction / 2.0); // [1, 0, -1, 0]
	var sin = Math.sin(Math.PI * battleship.direction / 2.0); // [0, 1, 0, -1]

	for (var i in Shape.shape){
		var r = row + Shape.shape[i].row*cos - Shape.shape[i].col*sin;
		var c = col + Shape.shape[i].row*sin + Shape.shape[i].col*cos;
		battleship.cells.push({
			'row': Math.round(r),
			'col': Math.round(c)
		});
	}

	battleship.getCells = function() {
		var result = [];
		result.push({
			'row': this.head.row,
			'col': this.head.col,
			'content': CellContent.HEAD});

		for (var cell in this.cells) {
			result.push({
			'row': this.cells[cell].row,
			'col': this.cells[cell].col,
			'content': CellContent.BODY});
		}

		return result;
	}

	battleship.includes = function(row, col)
	{
		if (this.isAt(row, col))
			return true;
		for(var i in this.cells)
		{
			if (this.cells[i].row === row && this.cells[i].col ===col)
				return true;
		}
		return false;
	}

	battleship.isAt = function(row, col) 
	{
		return this.head.row === row && this.head.col === col;
	}

	battleship.rotate = function()
	{
		var newDirection = this.direction+1;
		if (newDirection > Direction.RIGHT)
			newDirection = Direction.UP;

		var result = new Battleship(this.head.row, this.head.col, newDirection);
		return result;	
	}

	return battleship;
}
function Board() {
	var board = {
		boardSize: 19,
		cells: {},
		battleships: []
	}

	board.getValueAt = function(row, col){
		return this.cells[row][col];
	}

	board.addBattleship = function(row, col){
		var b = new Battleship(row, col);
		this.addBattleship2(b);
	}

	board.addBattleship2 = function(battleship)
	{
		this.battleships.push(battleship);

		var cells = battleship.getCells();
		for (var i in cells) {
			var cell = cells[i];
			this.cells[cell.row][cell.col] = cell.content;
		}
	}

	board.findBattleship = function(row, col){
		for (var i in this.battleships){
			if (this.battleships[i].includes(row,col))
				return this.battleships[i];
		}
		return null;
	}

	board.removeBattleship = function(row, col){
		var battleship = this.findBattleship(row, col);
		if (battleship !== null) {
			this.removeBattleship2(battleship);
		}
	}

	board.removeBattleship2 = function(battleship)
	{
		var cells = battleship.getCells();
		for (var i in cells) {
			var cell = cells[i];
			this.cells[cell.row][cell.col] = CellContent.NOTHING;
		}

		var index = this.battleships.indexOf(battleship);	
		this.battleships.splice(index, 1);
	}

	board.rotateBattleship = function(row, col){
		var battleship = this.findBattleship(row, col);
		if (battleship !== null) {
			console.log(battleship);
			var newBattleship = battleship.rotate();
			console.log(newBattleship);
			this.removeBattleship2(battleship);
			this.addBattleship2(newBattleship);
		}
	}

	for(var row = 0; row < board.boardSize; ++row){
		for(var col = 0; col < board.boardSize; ++col){
			if (col == 0) {
				board.cells[row] = new Array();
			}
			board.cells[row][col] = CellContent.NOTHING;
		}
	}

	return board;
}


function redraw(boardId, board)
{
	for(var row = 0; row < board.boardSize; ++row){
		for(var col = 0; col < board.boardSize; ++col){
			var data = board.getValueAt(row, col);

			var cell = $('[data-row=' + row + '][data-col=' + col + ']', '#' + boardId);

			var classesToRemove = [
				'cell-content-' + CellContent.NOTHING, 
				'cell-content-' + CellContent.BODY, 
				'cell-content-' + CellContent.HEAD
				].join(' ');
			cell.removeClass(classesToRemove);

			cell.addClass('cell-content-' + data);
		}
	}
}

function foo(boardId)
{
	var board = new Board();


	for(var row = 0; row < board.boardSize; ++row){
		var rowShit = $('<div></div>').addClass('row');
		$('#'+boardId).append(rowShit);

		for(var col = 0; col < board.boardSize; ++col){
			var data = board.getValueAt(row, col);

			var cell = $('<div></div>').addClass('cell');
			cell.attr('data-row', row);
			cell.attr('data-col', col);

			cell.click(function() {
				var row = $(this).data('row');
				var col = $(this).data('col');
				var data = board.getValueAt(row, col);

				console.log('YAY at ' 
					+ row + 'x' + col
					+ ' with data ' + data);

				if (data == CellContent.NOTHING){
					board.addBattleship(row, col);
				} else if (data == CellContent.HEAD){
					board.removeBattleship(row, col);
				} else if (data == CellContent.BODY){
					board.rotateBattleship(row, col);
				}
				redraw(boardId, board);

			});
			rowShit.append(cell);
		}
	}

	var battleship = new Battleship(5,5,Direction.RIGHT);
	board.addBattleship2(battleship);
	redraw(boardId, board);
}