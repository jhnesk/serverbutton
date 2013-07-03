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

var ServerButtonConfigurationDialog = {

	init: function() {
		var config = window.arguments[0].input;
		var key = window.arguments[0].key;

		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService);
		var commands = prefs.getBranch("extensions.serverbutton.command.").getChildList("", {});

		document.getElementById("title-host").value = key;

		var commandList = document.getElementById("serverbutton-configuration-type");
		var selected;

		for(var i = 0; i < commands.length; i++) {
			var command = commands[i];
			var item = document.createElement("menuitem");
			item.setAttribute("label", command);
			item.setAttribute("value", command);
			item.setAttribute("id", "type-" + command);
			commandList.firstChild.appendChild(item);
			if(i == 0) {
				selected = item;
			} else if(config && command == config.type) {
				selected = item;
			}
		}

		commandList.selectedItem = selected;
		if(config) {
			document.getElementById("serverbutton-configuration-host").value = config.host;
			document.getElementById("serverbutton-configuration-user").value = config.user;
			document.getElementById("serverbutton-configuration-password").value = config.password;
		}
	},

	save: function() {
		var type = document.getElementById("serverbutton-configuration-type").selectedItem.value;
		var host = document.getElementById("serverbutton-configuration-host").value;
		var user = document.getElementById("serverbutton-configuration-user").value;
		var password = document.getElementById("serverbutton-configuration-password").value;

		var config = {type:type,host:host,user:user,password:password};
		window.arguments[0].output=config;
	},

	remove: function() {
		var config = {type:null,host:null,user:null,password:null};
		window.arguments[0].output=config;
		window.close();
	},
};

