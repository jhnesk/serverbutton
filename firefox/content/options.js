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

function OptionDialog() {

	this.configlist = new ConfigList();

	this.init = function() {
		var commands = commandConfig.getAll();
		for(var command in commands) {
			if(!commands.hasOwnProperty(command)) continue;
			this.addCommand(command);
		}
		var commandlist = document.getElementById("commandlist");

		// TODO: handle empty list
		commandlist.selectedIndex = 0;

		this.configlist.populate();
	};

	this.getSelectedType = function() {
		var commandlist = document.getElementById("commandlist");
		var item = commandlist.selectedItem;
		return item.firstChild.getAttribute("label");
	};

	this.fillCommandConfigFields = function() {
		var type = this.getSelectedType();
		var command = commandConfig.get(type);
		var commandNode = document.getElementById("config-command");
		commandNode.value = command.command;
		var argumentsNode = document.getElementById("config-arguments");
		argumentsNode.value = command.args;

		this.clearVarialbes();
		for(var variable in command.variables) {
			if(!command.variables.hasOwnProperty(variable)) continue;
			this.addVariable(variable);
		}
	};

	this.clearVarialbes = function() {
		var list = document.getElementById("variableslist");
		var items = list.getElementsByTagName("listitem");
		for(var i = items.length-1; i >= 0; i--) {
			list.removeChild(items[i]);
		}
	};

	this.openVariableConfig = function() {
		var item = document.getElementById("variableslist").selectedItem;
		var variable = item.firstChild.getAttribute("label");
		var labelCell = item.childNodes[1];
		var typeCell = item.childNodes[2];
		var defaultValueCell = item.childNodes[3];

		var data = {
			name: variable,
			label: labelCell.getAttribute("label"),
			type: typeCell.getAttribute("label"),
			defaultValue: defaultValueCell.getAttribute("label")
		};
		window.openDialog("chrome://serverbutton/content/variable_dialog.xul", "serverbutton-variable-dialog", "chrome,dialog,centerscreen,modal", data).focus();

		labelCell.setAttribute("label", data.label);
		typeCell.setAttribute("label", data.type);
		defaultValueCell.setAttribute("label", data.defaultValue);
	};

	this.addVariable = function(variable) {
		var type = this.getSelectedType();
		var command = commandConfig.get(type);
		var variableObject = command.variables[variable];

		var list = document.getElementById("variableslist");
		var row = document.createElement("listitem");
		this.addCell(row, variable);
		this.addCell(row, variableObject.label);
		this.addCell(row, variableObject.type);
		this.addCell(row, variableObject.defaultValue);
		list.appendChild(row);
	};

	this.addCommand = function(type) {

		var commandlist = document.getElementById("commandlist");
		var row = document.createElement("listitem");
		var cell = document.createElement("listcell");
		cell.setAttribute("label", type);
		row.appendChild(cell);
		commandlist.appendChild(row);
	};

	this.removeCommand = function(type) {
		var promtService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		if(promtService.confirm(window, "Remove command", "Are you sure you wan't to remove this command?")) {
			commandConfig.remove(type);
			this.removeFromList(type);
		}
	};

	this.removeFromList = function(type) {
		var commandlist = document.getElementById("commandlist");
		var children = commandlist.childNodes;
		var length = children.length;
		for(var i = 0; i < length; i++) {
			var cell = children[i].firstChild;
			if(cell.getAttribute("label") === type) {
				commandlist.removeChild(children[i]);
				if(i === length-1) {
					commandlist.selectedIndex = i-2;
				} else {
					commandlist.selectedIndex = i-1;
				}
				break;
			}
		}
	};

	this.addType = function() {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var input = {value:""};
		var result = promptService.prompt(null, "New type", "Key:", input, null, {});
		if(result && input.value) {
			commandConfig.set(input.value, {});
			this.addCommand(input.value);
		}
	};

	this.applyCommand = function() {
		var type = this.getSelectedType();
		var command = commandConfig.get(type);
		var commandNode = document.getElementById("config-command");
		command.command = commandNode.value;
		var argumentsNode = document.getElementById("config-arguments");
		command.args = argumentsNode.value;
		command.variables = this.getCurrentVariables();
		commandConfig.set(type, command);
	};

	this.getCurrentVariables = function() {

		var result = {};

		var list = document.getElementById("variableslist");
		var items = list.getElementsByTagName("listitem");
		for(var i = items.length-1; i >= 0; i--) {
			var item = items[i];
			var variable = item.firstChild.getAttribute("label");
			var labelCell = item.childNodes[1];
			var typeCell = item.childNodes[2];
			var defaultValueCell = item.childNodes[3];

			result[variable] = {
				"label": labelCell.getAttribute("label"),
				"type": typeCell.getAttribute("label"),
				"defaultValue": defaultValueCell.getAttribute("label")
			};
		}
		return result;
	};

	this.resetCommand = function() {
		this.fillCommandConfigFields();
	};

	this.save = function() {
		this.applyCommand();
		commandConfig.save();
	};

	this.cancel = function() {
		commandConfig.load();
	};

	this.importConfig = function() {
		var file = this.selectImportFile();
		if(file) {

			var importFile = new ConfigFile(file);
			importFile.load();
			var importConfig = importFile.getAll();

			for(domain in importConfig) {
				if(!importConfig.hasOwnProperty(domain)) continue;
				if(!importConfig[domain]) continue;

				domainConfig.set(domain, importFile.get(domain));
			}
			domainConfig.save();
			this.configlist.clear();
			this.configlist.populate();
		}
	};

	this.selectImportFile = function() {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		filePicker.init(window, "Select a file for import", nsIFilePicker.modeOpen);
		filePicker.appendFilter("json", "*.json");

		var res = filePicker.show();
		if(res != nsIFilePicker.returnCancel) {
			return filePicker.file;
		}
	};

	this.exportConfig = function() {
		var file = this.selectExportFile();
		if(file) {
			var exportConfig = new ConfigFile(file);
			exportConfig.write(domainConfig.getAll());
		}
	};

	this.selectExportFile = function() {
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		filePicker.init(window, "Select a file for export", nsIFilePicker.modeSave);
		filePicker.appendFilter("json", "*.json");

		var res = filePicker.show();
		if(res != nsIFilePicker.returnCancel) {
			return filePicker.file;
		}
	};

	this.addCell = function(row, label) {
		var cell = document.createElement("listcell");
		cell.setAttribute("label", label);
		row.appendChild(cell);
	};
}

function ConfigList() {

	this.editAction = function() {
		var item = document.getElementById("configlist").selectedItem;
		if(item === null) {
			return;
		}
		var domain = item.firstChild.getAttribute("label");
		window.openDialog("chrome://serverbutton/content/domain_dialog.xul", "serverbutton-domain-dialog", "chrome,dialog,centerscreen,modal", domain).focus();
		this.clear();
		this.populate();
	};

	this.deleteAction = function() {
		var item = document.getElementById("configlist").selectedItem;
		if(item === null) {
			return;
		}
		var domain = item.firstChild.getAttribute("label");
		domainConfig.remove(domain);
		domainConfig.save();
		this.clear();
		this.populate();
	};

	this.clear = function() {
		var list = document.getElementById("configlist");
		var items = list.getElementsByTagName("listitem");
		for(var i = items.length-1; i >= 0; i--) {
			list.removeChild(items[i]);
		}
	};

	this.populate = function() {
		var list = document.getElementById("configlist");

		var config = domainConfig.getAll();
		for(var domain in config) {
			if(!config.hasOwnProperty(domain)) continue;
			if(!config[domain]) continue;

			var row = document.createElement("listitem");
			this.addCell(row, domain);
			this.addCell(row, config[domain].type);

			list.appendChild(row);
		}
	};

	this.addCell = function(row, label) {
		var cell = document.createElement("listcell");
		cell.setAttribute("label", label);
		row.appendChild(cell);
	};
}
