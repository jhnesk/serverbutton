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

Components.utils.import("resource://serverbutton/configuration.js");

function ServerButtonConfigurationDialog() {

	this.domain = window.arguments[0];

	this.config = domainConfig.get(this.domain);

	this.init = function() {
		document.getElementById("title-host").value = this.domain;

		var commandList = document.getElementById("serverbutton-configuration-type");
		var selected = null;
		var selectedCommand = null;

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
				selectedCommand = command;
			} else if(this.config && command === this.config.type) {
				selected = item;
				selectedCommand = command;
			}
		}
		commandList.selectedItem = selected;

		this.updateArgumentInput(commands[selectedCommand]);
	};

	this.commandChange = function() {
		var commandList = document.getElementById("serverbutton-configuration-type");
		var commands = commandConfig.getAll();
		this.updateArgumentInput(commands[commandList.selectedItem.value]);
	};

	this.removeAllChildren = function(node) {
		while(node.firstChild) {
			node.removeChild(node.firstChild);
		}
	};

	this.updateArgumentInput = function(command) {
		var argumentBox = document.getElementById("arguments");
		this.removeAllChildren(argumentBox);

		var hasPassword = false;

		for(var variable in command.variables) {
			if(!command.variables.hasOwnProperty(variable)) continue;
			var variableObject = command.variables[variable];

			var label = document.createElement("label");
			label.setAttribute("value", variableObject.label + ":");
			label.setAttribute("control", "serverbutton-config-variable-" + variable);
			var inputElement;
			switch(variableObject.type) {
				case "string":
					inputElement = document.createElement("textbox");
					inputElement.setAttribute("id", "serverbutton-config-variable-" + variable);
					break;
				case "password":
					inputElement = document.createElement("textbox");
					inputElement.setAttribute("id", "serverbutton-config-variable-" + variable);
					inputElement.setAttribute("type", "password");
					inputElement.setAttribute("password", "true");
					hasPassword = true;
					break;
				case "integer":
					inputElement = document.createElement("textbox");
					inputElement.setAttribute("id", "serverbutton-config-variable-" + variable);
					inputElement.setAttribute("type", "number");
					break;
			}
			argumentBox.appendChild(label);
			argumentBox.appendChild(inputElement);
		}

		var passwordCheckbox = document.getElementById("show-password");
		if(hasPassword) {
			passwordCheckbox.hidden = false;
		} else {
			passwordCheckbox.hidden = true;
		}

		this.fillArgumentInput(command);
	};

	this.fillArgumentInput = function(command) {
		for(var variable in command.variables) {
			if(!command.variables.hasOwnProperty(variable)) continue;
			var element = document.getElementById("serverbutton-config-variable-" + variable);

			if(this.config && this.config[variable]) {
				element.value = this.config[variable];
			} else {
				var defaultValue = command.variables[variable].defaultValue;
				if(defaultValue) {
					element.value = defaultValue;
				}
			}
		}
	};

	this.save = function() {
		var type = document.getElementById("serverbutton-configuration-type").selectedItem.value;
		var command = commandConfig.get(type);

		this.config = {type:type};

		for(var variable in command.variables) {
			if(!command.variables.hasOwnProperty(variable)) continue;
				var value = document.getElementById("serverbutton-config-variable-" + variable).value;
				this.config[variable] = value;
		}

		domainConfig.set(this.domain, this.config);
		domainConfig.save();
	};

	this.remove = function() {
		domainConfig.remove(this.domain);
		domainConfig.save();
		window.close();
	};

	this.togglePassword = function() {
		var showPassword = document.getElementById("show-password").checked;

		var argumentBox = document.getElementById("arguments");
		var textboxes = argumentBox.getElementsByTagName("textbox");

		for(var i = 0; i < textboxes.length; i++) {
			var textbox = textboxes[i];
			if(textbox.getAttribute("password")) {
				if(showPassword) {
					textbox.removeAttribute("type");
				} else {
					textbox.setAttribute("type", "password");
				}
			}
		}
	};
}
