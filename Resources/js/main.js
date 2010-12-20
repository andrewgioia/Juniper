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
	// Nav button click
	$(".nav").click(function() 
	{
		// Add the background
		$(".on").removeClass("on");
		$(this).addClass("on");

		// Load the correct panel
		var id = ($(this).attr("title") == undefined) ? "General" : $(this).attr("title");
		var from = $("#main").attr("class");
		if (id.toLowerCase() != from)
		{
			$("#content").html("");
			Juniper.panel(id, from);
		}

		// Set the window title
		mainwin.setTitle(id);
		
		// Set the correct height
		var h = 300;
		if (id == "General") {
			h = 200;
		} else if (id == "Account") {
			h = 235;
		} else if (id == "About") {
			h = 335;
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
	Globals.device_mac = Ti.pf.macaddress;
	Globals.device_id = Ti.pf.id;
	Globals.device_user = Ti.pf.username;
	
	// Load the config settings
	Juniper.config();
	
	// Add the system tray
	Juniper.addTray();
	
	// Load the events
	Juniper.evnt();
	
	// Set the General panel
	$("#content").load("panels/general.html");
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
	var ioff = Globals.resources+"/icon-alert.png";
	var tray = Ti.ui.addTray(icon);
	
	// Create the menu items
	var launch = Ti.ui.createMenuItem("Launch Juniper Website", function() {
		Ti.pf.openURL("http://juniperapp.com");
	});
	var pause = Ti.ui.createMenuItem("Pause Notifications", function() {
		if (pause.getLabel() == "Pause Notifications") {
			pause.setLabel("Resume Notifications");
			tray.setIcon(ioff);
		} else {
			pause.setLabel("Pause Notifications");
			tray.setIcon(icon);
		}
	});
	var status = Ti.ui.createMenuItem("No new notifications");
		status.disable();
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
		menu.appendItem(status);
		menu.addSeparatorItem();
		menu.appendItem(pref);
		menu.appendItem(help);
		menu.addSeparatorItem();
		menu.appendItem(quit);

	// Set the tray properties
	tray.setMenu(menu);
	tray.setHint("Juniper 0.1.0\nNo new notifications");
}

Juniper.panel = function(id, from)
{
	$("#main").removeClass(from).addClass(id.toLowerCase());
	$("#content").load("panels/"+id+".html");
}

Juniper.notify = function()
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