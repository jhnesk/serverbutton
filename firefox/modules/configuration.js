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

var EXPORTED_SYMBOLS = ["ConfigFile", "domainConfig", "commandConfig"];

Components.utils.import("resource://gre/modules/FileUtils.jsm");

function ConfigFile(f) {

	this.file = f;

	this.config = {};

	this.get = function(key) {
		return this.config[key];
	};

	this.set = function(key, c) {
		this.config[key] = c;
	};

	this.remove = function(key) {
		delete this.config[key];
	};

	this.getAll = function() {
		return this.config;
	};

	this.load = function() {

		if(!this.file.exists()) {
			this.write({});
		}
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(this.file, 0x01, 4, null);
		var fileScriptableIO = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream); 
		fileScriptableIO.init(istream);
		istream.QueryInterface(Components.interfaces.nsILineInputStream); 
		var content = "";
		var csize = 0; 
		while ((csize = fileScriptableIO.available()) != 0)
		{
			content += fileScriptableIO.read( csize );
		}
		fileScriptableIO.close();
		istream.close();
		this.config = JSON.parse(content);
	};

	this.write = function(jsonObject) {
		var content = JSON.stringify(jsonObject);
		if(!this.file.exists()) {
			this.file.create(0, 0600);
		}
		var stream = FileUtils.openFileOutputStream(this.file, FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE);
		stream.write(content, content.length);
		stream.close();
	};

	this.save = function() {
		this.write(this.config);
	};
}

function getDomainFile() {
	var domainFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
	domainFile.append("serverbutton");
	domainFile.append("domains.json");
	return domainFile;
}

function getCommandFile() {
	var commandFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
	commandFile.append("serverbutton");
	commandFile.append("commands.json");
	return commandFile;
}

function getDefaultCommandConfig() {

	var linuxCommands = {
		"ssh": "/usr/bin/urxvt -e ssh $USER@$HOST",
		"ftp": "/usr/bin/gftp ftp://$USER:$PASSWORD@$HOST",
		"rdesktop": "/usr/bin/rdesktop -u $USER -p $PASSWORD -g 1280x960 $HOST",
		"vmware": "/usr/bin/vmware-view --serverURL=$HOST --userName=$USER --password=$PASSWORD -q"
	};

	var macCommands = {
		"ssh": "",
		"ftp": "",
		"rdesktop": "",
		"vmware": ""
	};

	var windowsCommands = {
		"ssh": "",
		"ftp": "",
		"rdesktop": "",
		"vmware": ""
	};

	var os = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;  
	switch(os) {
		case "Linux":
			return linuxCommands;
		case "Darwin":
			return macCommands;
		case "WINNT":
			return windowsCommands;
		default:
			return linuxCommands;
	}
}


var domainConfig = new ConfigFile(getDomainFile());
domainConfig.load();

var commandFile = getCommandFile();
var commandConfig = new ConfigFile(commandFile);
if(!commandFile.exists()) {
	commandConfig.write(getDefaultCommandConfig());
}
commandConfig.load();

