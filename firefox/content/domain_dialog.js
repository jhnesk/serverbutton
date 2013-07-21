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

Components.utils.import("resource://serverbutton/configuration.js");

function ServerButtonConfigurationDialog() {

	this.domain = window.arguments[0];

	this.config = domainConfig.get(this.domain);

	this.init = function() {
		document.getElementById("title-host").value = this.domain;

		var commandList = document.getElementById("serverbutton-configuration-type");
		var selected = null;

		var commands = commandConfig.getAll();

		for(var command in commands) {
			if(!commands.hasOwnProperty(command)) continue;
			var item = document.createElement("menuitem");
			item.setAttribute("label", command);
			item.setAttribute("value", command);
			item.setAttribute("id", "type-" + command);
			commandList.firstChild.appendChild(item);
			if(selected == null) {
				selected = item;
			} else if(this.config && command === this.config.type) {
				selected = item;
			}
		}

		commandList.selectedItem = selected;
		if(this.config) {
			document.getElementById("serverbutton-configuration-host").value = this.config.host;
			document.getElementById("serverbutton-configuration-user").value = this.config.user;
			document.getElementById("serverbutton-configuration-password").value = this.config.password;
		}
	};

	this.save = function() {
		var type = document.getElementById("serverbutton-configuration-type").selectedItem.value;
		var host = document.getElementById("serverbutton-configuration-host").value;
		var user = document.getElementById("serverbutton-configuration-user").value;
		var password = document.getElementById("serverbutton-configuration-password").value;

		this.config = {type:type,host:host,user:user,password:password};
		domainConfig.set(this.domain, this.config);
		domainConfig.save();
	};

	this.remove = function() {
		domainConfig.remove(this.domain);
		domainConfig.save();
		window.close();
	};
}
