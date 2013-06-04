/**
 * Copyright 2013 Johan Ask.
 * E-mail: jhnesk@gmail.com
 *
 * This file is part of serverbutton.
 *
 * serverbutton is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * serverbutton is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with serverbutton.  If not, see <http://www.gnu.org/licenses/>.
 */

Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/AddonManager.jsm");

var ServerButtonConfig = {};

var ServerButton_urlBarListener = {
	QueryInterface: function(aIID)
	{
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
				aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
				aIID.equals(Components.interfaces.nsISupports))
			return this;
		throw Components.results.NS_NOINTERFACE;
	},

	onLocationChange: function(aProgress, aRequest, aURI)
	{
		if(aURI) {
			ServerButton.setButtonState(aURI.host);
		} else {
			ServerButton.setButtonState(null);
		}
	},

	onStateChange: function(a, b, c, d) {},
	onProgressChange: function(a, b, c, d, e, f) {},
	onStatusChange: function(a, b, c, d) {},
	onSecurityChange: function(a, b, c) {}
};
 
var ServerButton = {

	init: function() {
		gBrowser.addProgressListener(ServerButton_urlBarListener, Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
	},

	uninit: function() {
		gBrowser.removeProgressListener(ServerButton_urlBarListener);
	},

	setButtonState: function(host) {
		var button = document.getElementById("serverbutton-toolbarbutton");
		var config = ServerButtonConfig[host];
		if(config) {
			button.removeAttribute("config");
			button.setAttribute("oncommand", "ServerButton.connect();");
			button.setAttribute("tooltiptext", "Connect to " + config.host);
			document.getElementById("menuitem-connect").disabled=false;
		} else {
			button.setAttribute("config", "true");
			button.setAttribute("oncommand", "ServerButton.openConfig();");
			button.setAttribute("tooltiptext", "Configure domain");
			document.getElementById("menuitem-connect").disabled=true;
		}
	},

	connect: function() {
		var host = window.top.getBrowser().selectedBrowser.contentWindow.location.host;
		var config = ServerButtonConfig[host];
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var commands = prefs.getBranch("extensions.serverbutton.command.");

		if(config != null) {
			try {
				var command = commands.getCharPref(config.type);
			} catch(err) {
				alert("Error: No command found for the selected type '" + config.type + "'.");
				return;
			}
			command = command.replace("$HOST", config.host);
			command = command.replace("$USER", config.user);
			command = command.replace("$PASSWORD", config.password);

			var args = command.split(" ");
			var filename = args.shift();

			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filename);

			var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
			process.init(file);
			process.run(false, args, args.length);
		}
	},

	getConfigFile: function() {
		var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		file.append("serverbutton");
		file.append("config.json");
		return file;
	},

	loadConfig: function() {
		var file = ServerButton.getConfigFile();
		if(!file.exists()) {
			file.create(0, 0600);
		}
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(file, 0x01, 4, null);
		var fileScriptableIO = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream); 
		fileScriptableIO.init(istream);
		istream.QueryInterface(Components.interfaces.nsILineInputStream); 
		var fileContent = "";
		var csize = 0; 
		while ((csize = fileScriptableIO.available()) != 0)
		{
			fileContent += fileScriptableIO.read( csize );
		}
		fileScriptableIO.close();
		istream.close();

		ServerButtonConfig = JSON.parse(fileContent);
	},

	saveConfig: function() {
		var file = ServerButton.getConfigFile();
		var stream = FileUtils.openFileOutputStream(file, FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE);
		var jsonString = JSON.stringify(ServerButtonConfig);
		stream.write(jsonString, jsonString.length);
		stream.close();
	},

	openConfig: function() {
		var host = window.top.getBrowser().selectedBrowser.contentWindow.location.host;
		var config = ServerButtonConfig[host];
		var param = {input:config,key:host,output:null};

		window.openDialog("chrome://serverbutton/content/config.xul", "serverbutton-configuration-dialog", "chrome,dialog,centerscreen,modal", param).focus();
		if(param.output) {
			config = {
				type: param.output.type,
				host: param.output.host,
				user: param.output.user,
				password: param.output.password
			};
			if(config.type) {
				ServerButtonConfig[host] = config;
			} else {
				ServerButtonConfig[host] = null;
			}
			ServerButton.saveConfig();
			ServerButton.setButtonState(host);
		}
	},
};

window.addEventListener("load", ServerButton.init, false);
window.addEventListener("unload", ServerButton.uninit, false);
ServerButton.loadConfig();
