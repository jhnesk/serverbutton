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
var serverbutton = serverbutton || {};

Components.utils.import("resource://serverbutton/configuration.js");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

serverbutton.Command = function(config) {

	this.config = config;

	this.command = serverbutton.config.commands.get(config.type);

};

serverbutton.Command.prototype.run = function() {
	var filename = this.command.command;
	var args = this.parseArguments(this.command.args);

	for(var variable in this.command.variables) {
		if(!this.command.variables.hasOwnProperty(variable)) continue;

		for(var i = 0; i < args.length; i++) {
			var value = this.config[variable];
			if(value) {
				args[i] = args[i].replace("${" + variable + "}", value);
			} else {
				var defaultValue = this.command.variables[variable].defaultValue;
				if(defaultValue) {
					args[i] = args[i].replace("${" + variable + "}", defaultValue);
				}
			}
		}
	}

	var file = new FileUtils.File(filename);

	var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
	process.init(file);
	process.runw(false, args, args.length);
};

serverbutton.Command.prototype.parseArguments = function(line) {
	var args = [];
	var arg = "";
	var quoted = false;
	var escaped = false;

	for(var i = 0; i < line.length; i++) {
		var nextChar = line.charAt(i);

		if(escaped) {
			escaped = false;
			arg = arg.concat(nextChar);
		} else if(!quoted && nextChar == " ") {
			args.push(arg);
			arg = "";
		} else if(nextChar == "\\") {
			escaped = true;
		} else if(nextChar == "\"") {
			quoted = !quoted;
		} else {
			arg = arg.concat(nextChar);
		}
	}
	if(arg) {
		args.push(arg);
	}

	return args;
};
