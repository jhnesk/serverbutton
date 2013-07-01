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

function Command(type) {

	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var commands = prefs.getBranch("extensions.serverbutton.command.");
	this.command = commands.getCharPref(type);
	// throws exception if the command is not configured

	this.setHost = function(host) {
		this.command = this.command.replace("$HOST", host);
	};

	this.setUser = function(user) {
		this.command = this.command.replace("$USER", user);
	};

	this.setPassword = function(password) {
		this.command = this.command.replace("$PASSWORD", password);
	};

	this.run = function() {
		var args = this.command.split(" ");
		var filename = args.shift();

		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(filename);

		var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
		process.init(file);
		process.run(false, args, args.length);
	};
}
