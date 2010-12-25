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
 * Application listeners
 */
Titanium.API.addEventListener(Titanium.CLOSE, function(e) {
	e.preventDefault();
	mainwin.hide();
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
		var h = 200;
		if (id == "Notifications") {
			h = 280;
		} else if (id == "Account") {
			h = 235;
		} else if (id == "About") {
			h = 335;
		} else if (id == "Services") {
			h = 220;
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
	Globals.application = Ti.fs.getApplicationDirectory();
	Globals.appdata = Ti.fs.getApplicationDataDirectory();
	Globals.header = $('#header');
	Globals.device_mac = Ti.pf.macaddress;
	Globals.device_id = Ti.pf.id;
	Globals.device_user = Ti.pf.username;

	// Load the config settings
	Juniper.config();
	
	// If there is no user set, run the setup
	if (Settings.general.userid == "")
	{
		Juniper.runOnce();
	}
	else
	{
		// Add the system tray
		Juniper.addTray();

		// Load the events
		Juniper.evnt();

		// Set the General panel
		$("#content").load("panels/general.html");
	}
}

/**
 * Functions
 */
Juniper.config = function()
{
	// Get the config file
	var file = Ti.fs.getFile(Globals.appdata, 'config.json');
	if (!file.exists())
	{
		var copy = Ti.fs.getFile(Globals.application, 'config.json')
			copy.move(Globals.appdata);
		file = Ti.fs.getFile(Globals.appdata, 'config.json'); // possibly remove the "file =" ?
	}
	
	// Put it into a workable object
	file.open(Ti.fs.MODE_READ);
	Settings = Ti.json.parse(file.read());
}

Juniper.defaults = function()
{
	// Initialize the objects
	var appdir = Ti.fs.getProgramsDirectory();
	var Defaults = {};
		Defaults.browser = "System Default";
		Defaults.music = "None";
	
	if (Ti.fs.getFile(appdir,"iTunes.app").exists())
	{
		Defaults.music = "iTunes";
	}
}

Juniper.addTray = function(setup)
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
	var login = Ti.ui.createMenuItem("Sign in to Juniper...", function() {
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
    if (setup == "setup")
    {
    	menu.appendItem(launch);
		menu.appendItem(help);
		menu.addSeparatorItem();
		menu.appendItem(login);
		menu.addSeparatorItem();
		menu.appendItem(quit);
    }
    else
    {
		menu.appendItem(launch);
		menu.appendItem(pause);
		menu.addSeparatorItem();
		menu.appendItem(status);
		menu.addSeparatorItem();
		menu.appendItem(pref);
		menu.appendItem(help);
		menu.addSeparatorItem();
		menu.appendItem(quit);
	}

	// Set the tray properties
	tray.setMenu(menu);
	tray.setHint("Juniper Root m."+Ti.ap.getVersion()+"\nNo new notifications");
}

Juniper.panel = function(id, from)
{
	$("#main").removeClass(from).addClass(id.toLowerCase());
	$("#content").load("panels/"+id+".html");
}

Juniper.notify = function(title, message)
{
	var notif = Titanium.Notification.createNotification({
			'title': title,
			'message': message,
			'timeout': 100 // 604800, one week
		}); 
		notif.show();
}

Juniper.saveSetting = function(c, s, v)
{
	// Check for valid class
	if (c != "general" && c != "defaults" && c != "notifications")
	{
		return false;
	}
	
	// Save the new individual setting
	Settings[''+c+''][''+s+''] = v;
	
	// Write it to the .json file
	var json = Ti.json.stringify(Settings);
	
	Juniper.notify("Settings change",json);
	
	var file = Ti.fs.getFile(Globals.appdata,'config.json');
		file.open(Ti.fs.MODE_WRITE);
	try 
	{
		file.write(json);
	} 
	catch (e)
	{
		Titanium.API.info("--SETTINGS SAVE ERROR: "+e);
	}
	return file;
}

Juniper.runOnce = function()
{
	// Set the window url to login
	mainwin.setURL("app://login.html");
	mainwin.setHeight(230);
	
	// Add the limited system tray
	Juniper.addTray("setup");
}

/**
 * Run it when we're ready
 */
$(document).ready(function()
{
	Juniper.init();
});