/**
 * Database API
 */
var db = (function() {
  
	// Create an object which will be our public API
	var api = {};
  
	// Maintain a database connection
	var conn = Titanium.Database.open('items');

	// Initialize the database
	conn.execute('CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, item TEXT)');
	conn.execute('DELETE FROM items'); // This will delete all data from our table - not for production
  
	// Create an item - db.create(item)
	api.create = function(text) 
	{
		conn.execute('INSERT INTO items (item) VALUES(?)',text);
		return conn.lastInsertRowId; // return the primary key for the last insert
	};
  
	// List all items - db.read()
	api.all = function() 
	{
		// Create an empty list
		var results = [];

		// Get items from database
		var resultSet = conn.execute('SELECT * FROM items');
		while (resultSet.isValidRow()) {
			results.push({
				id: resultSet.fieldByName('id'),
				todo: resultSet.fieldByName('item')
			});
			resultSet.next();
		}
		
		// Close and return
		resultSet.close();
		return results; //return an array of JavaScript objects reflecting the todo
	};
  
	// Get an item by a specific ID
	api.get = function(id) 
	{
		var result = null;
		var resultSet = conn.execute('SELECT * FROM items WHERE id = ?', id);
		if (resultSet.isValidRow()) {
			result = {
				id: resultSet.fieldByName("id"),
				todo: resultSet.fieldByName("todo")
			};
		}
		resultSet.close();
		return result;
	};
  
	// Update an exisiting item - db.update(item)
	api.update = function(itemObg) 
	{
		conn.execute("UPDATE items SET item = ? WHERE id = ?", itemObj.item, itemObj.id);
		return conn.rowsAffected; // return the number of rows affected by the last query; should be one...
	};
  
	// Delete an item - db.del(item)
	api.del = function(id) 
	{
		conn.execute("DELETE FROM items WHERE id = ?", id);
		return conn.rowsAffected; // return the number of rows affected by the last query; should be one (not looping)
	};
  
	// Return our public API for use
	return api;

}());