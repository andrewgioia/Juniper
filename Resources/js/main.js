/**
 * System variables
 */
var Juniper = {};
var Settings = {};
var Globals = {};
var Ti = {
	ap: Titanium.App,
	ui: Titanium.UI,
	pf: Titanium.Platform,
	fs: Titanium.Filesystem,
	json: Titanium.JSON
};
var mainwin = Ti.ui.getMainWindow();

/**
 * General listeners
 */
Titanium.API.addEventListener(Titanium.CLOSE, function(e) {
	e.preventDefault();
	mainwin.hide();
});

Titanium.API.addEventListener("hidewindow", function(e) {
	mainwin.unfocus(); // doesn't work
});

/**
 * UI Events
 */
Juniper.evnt = function()
{
	// Nav button press
	$(".nav").mousedown(function() {
		//$(this).css("opacity",".6");
		$(".on").removeClass("on");
		$(this).addClass("on");
	});
	$(".nav").mouseup(function() {
		$(this).css("opacity","1.0");
	});

	// Nav button click
	$(".nav").click(function() {
	
		// Set the window title
		var title = $(this).attr("title");
		
		// Load the correct panel
		mainwin.setTitle(title);
		Juniper.panel(title);
		
		// Set the correct height
		var h = 300;
		if (title == "Account") {
			h = 400;
		}
		mainwin.setHeight(h);
	});
}

/**
 * Initialize
 */
Juniper.init = function()
{
	// Define some properties
	Globals.resources = Ti.fs.getResourcesDirectory();
	Globals.header = $('#header');

	// Do something
	Globals.mac = Ti.pf.macaddress;
	Globals.id = Ti.pf.id;
	Globals.user = Ti.pf.username;
	
	// Load the config
	Juniper.config();
	
	// Add the system tray
	Juniper.addTray();
	
	// Load the events
	Juniper.evnt();
	
	// Load the panel
	Juniper.panel();
}

/**
 * Functions
 */
Juniper.config =  function()
{
	// Get the config file
	var file = Ti.fs.getFile(Globals.resources, 'config.json');
	
	// Put it into a workable object
	var conf = Ti.json.parse(file.read());
	
	// Make it global!
	Settings = conf;
}

Juniper.addTray = function()
{
	// Define the tray and icon
	var icon = Globals.resources+"/icon.png";
	var tray = Ti.ui.addTray(icon);
	
	// Create the menu items
	var launch = Ti.ui.createMenuItem("Launch Juniper Website", function() {
		Ti.pf.openURL("http://juniperapp.com");
	});
	var pause = Ti.ui.createMenuItem("Pause Notifications");
	var pref = Ti.ui.createMenuItem("Preferences...", function() {
		Ti.ui.getMainWindow().show();
	});
	var help = Ti.ui.createMenuItem("Help Center", function() {
		Ti.pf.openURL("http://juniperapp.com/help");
	});
	var quit = Ti.ui.createMenuItem("Quit Juniper", function() {
		if (confirm("Are you sure you want to quit Juniper? You'll stop receiving notifications!")) { 
			Ti.ap.exit(); 
		}
	});
    
    // Create the menu
   	var menu = Ti.ui.createMenu();
		menu.appendItem(launch);
		menu.appendItem(pause);
		menu.addSeparatorItem();
		menu.appendItem(pref);
		menu.appendItem(help);
		menu.addSeparatorItem();
		menu.appendItem(quit);

	// Set the tray properties
	tray.setMenu(menu);
	tray.setHint("Juniper 0.1.0\nNo new notifications");
}

Juniper.panel = function(id)
{
	if (id == undefined) { id = "General"; }
	$("#content").load("panels/"+id+".html");
}

Juniper.setAlert = function()
{
	var notif = Titanium.Notification.createNotification(Titanium.UI.createWindow());
		notif.setTitle("New message");
		notif.setMessage("How are you doing?");
		notif.show();
}

/**
 * Run it when we're ready
 */
$(document).ready(function()
{
	Juniper.init();
});