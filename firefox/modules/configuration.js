/**
 * Copyright 2013 Johan Ask.
 * E-mail: jhnesk@gmail.com
 *
 * This file is part of ServerButton.
 *
 * ServerButton is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ServerButton is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ServerButton.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

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
			this.write(this.config);
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
			this.file.create(0, parseInt("0600", 8));
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
		ssh: {
			command: "/usr/bin/urxvt",
			variables: {
				"user": {
					label: "User",
					type: "string",
					defaultValue: ""
				},
				"host": {
					label: "Host",
					type: "string",
					defaultValue: ""
				},
				"port": {
					label: "Port",
					type: "integer",
					defaultValue: 22
				}
			},
			args: "-e ssh ${user}@${host} -p ${port}"
		},
		ftp: {
			command: "/usr/bin/gftp",
			variables: {
				"user": {
					label: "User",
					type: "string",
					defaultValue: ""
				},
				"host": {
					label: "Host",
					type: "string",
					defaultValue: ""
				},
				"password": {
					label: "Password",
					type: "password",
					defaultValue: ""
				}
			},
			args: "ftp://${user}:${password}@${host}"
		},
		rdesktop: {
			command: "/usr/bin/rdesktop",
			variables: {
				"user": {
					label: "User",
					type: "string",
					defaultValue: ""
				},
				"host": {
					label: "Host",
					type: "string",
					defaultValue: ""
				},
				"password": {
					label: "Password",
					type: "password",
					defaultValue: ""
				}
			},
			args: "-u ${user} -p ${password} ${host}"
		},
		vmware: {
			command: "/usr/bin/vmware-view",
			variables: {
				"user": {
					label: "User",
					type: "string",
					defaultValue: ""
				},
				"host": {
					label: "Host",
					type: "string",
					defaultValue: ""
				},
				"password": {
					label: "Password",
					type: "password",
					defaultValue: ""
				}
			},
			args: "--serverURL=${host} --userName=${user} --password=${password} -q"
		}
	};

	var macCommands = {
	};

	var windowsCommands = {
		"rdesktop": {
			command: "C:\\Windows\\System32\\mstsc.exe",
			variables: {
				"host": {
					label: "Host",
					type: "string",
					defaultValue: ""
				}
			},
			args: "/v:${host} "
		}
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

var EXPORTED_SYMBOLS = ["ServerButtonConfig", "getDefaultCommandConfig", "ConfigFile"];

var ServerButtonConfig = {};

ServerButtonConfig.domains = new ConfigFile(getDomainFile());
ServerButtonConfig.domains.load();

var commandFile = getCommandFile();
ServerButtonConfig.commands = new ConfigFile(commandFile);
if(!commandFile.exists()) {
	ServerButtonConfig.commands.config = getDefaultCommandConfig();
}
ServerButtonConfig.commands.load();

