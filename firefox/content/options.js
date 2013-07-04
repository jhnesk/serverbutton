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

function OptionDialog() {

	this.types = new Array();

	this.init = function() {
		var commands = this.getCommandList();
		var length = commands.length;
		for(var i = 0; i < length; i++) {
			this.addCommand(commands[i]);
		}
	};

	this.addCommand = function(type) {
		this.types.push(type);

		var dialog = document.getElementById("commands");
		var id = "command-" + type;

		var label = document.createElement("label");
		label.setAttribute("control", id);
		label.setAttribute("value", type + ":");

		var textbox = document.createElement("textbox");
		textbox.setAttribute("id", id);
		textbox.setAttribute("value", this.getCommand(type));
		textbox.setAttribute("flex", "1");
		textbox.setAttribute("style", "min-width: 30em;");

		dialog.appendChild(label);
		dialog.appendChild(textbox);
	};

	this.addType = function() {
		var param = {type:null};
		window.openDialog("chrome://serverbutton/content/typeinput.xul", "typeinput-dialog", "chrome,dialog,centerscreen,modal", param).focus();
		if(param.type) {
			this.addCommand(param.type);
		}
	};

	this.getCommand = function(type) {
		try {
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
			var commands = prefs.getBranch("extensions.serverbutton.command.");
			return commands.getCharPref(type);
		} catch(e) {
			return "";
		}
	};

	this.save = function() {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.serverbutton.command.");

		var length = this.types.length;
		for(var i = 0; i < length; i++) {
			var type = this.types[i];
			var command = document.getElementById("command-" + type).value;
			branch.setCharPref(type, command);
		}
	};

	this.getCommandList = function() {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		var branch = prefs.getBranch("extensions.serverbutton.command.");
		return branch.getChildList("", {}); 
	};
}

optiondialog = new OptionDialog();
