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

function Command(config) {

	this.config = config;

	this.command = commandConfig.get(config.type);

	this.run = function() {
		var filename = this.command.command;
		var args = this.parseArguments(this.command.args);

		for(variable in this.command.variables) {
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

		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(filename);

		var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
		process.init(file);
		process.run(false, args, args.length);
	};

	this.parseArguments = function(arg) {
		return arg.split(" ");
	}
}
