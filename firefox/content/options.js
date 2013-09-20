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

Components.utils.import("resource://serverbutton/configuration.js");

function OptionDialog() {

	this.configlist;

	this.commandlist;

	this.variableslist;

	this.init = function() {

		this.configlist = new ConfigList();
		this.commandlist = new MenuList("commandlist");
		this.variableslist = new MenuList("variableslist");

		var commands = commandConfig.getAll();
		for(var command in commands) {
			if(!commands.hasOwnProperty(command)) continue;
			this.commandlist.addRow([command]);
		}

		this.commandlist.selectFirst();

		this.configlist.populate();
	};

	this.getSelectedType = function() {
		var item = this.commandlist.getSelectedItem();
		return item.firstChild.getAttribute("label");
	};

	this.fillCommandConfigFields = function() {
		var type = this.getSelectedType();
		var command = commandConfig.get(type);
		var commandNode = document.getElementById("config-command");
		commandNode.value = command.command || "";
		var argumentsNode = document.getElementById("config-arguments");
		argumentsNode.value = command.args || "";

		this.variableslist.clear();
		if(command.variables) {
			for(var variable in command.variables) {
				if(!command.variables.hasOwnProperty(variable)) continue;
				this.addVariable(variable);
			}
		}
		this.updateAllVariableChangedStatus();
	};

	this.openVariableConfig = function() {
		var item = this.variableslist.getSelectedItem();
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

		this.updateVariableChangedStatus(item);
	};

	this.updateAllVariableChangedStatus = function() {
		var items = this.variableslist.getItems();
		for(var i = items.length-1; i >= 0; i--) {
			var item = items[i];
			this.updateVariableChangedStatus(item);
		}
	};

	this.updateVariableChangedStatus = function(item) {
		var variable = item.firstChild.getAttribute("label");
		var labelCell = item.childNodes[1];
		var typeCell = item.childNodes[2];
		var defaultValueCell = item.childNodes[3];

		var type = this.getSelectedType();
		var variableObject = commandConfig.get(type).variables[variable];

		if(labelCell.getAttribute("label") !== variableObject.label) {
			labelCell.setAttribute("style", "font-weight: bold;");
		} else {
			labelCell.setAttribute("style", "font-weight: normal;");
		}
		if(typeCell.getAttribute("label") !== variableObject.type) {
			typeCell.setAttribute("style", "font-weight: bold;");
		} else {
			typeCell.setAttribute("style", "font-weight: normal;");
		}
		if(defaultValueCell.getAttribute("label") !== variableObject.defaultValue) {
			defaultValueCell.setAttribute("style", "font-weight: bold;");
		} else {
			defaultValueCell.setAttribute("style", "font-weight: normal;");
		}
	};

	this.addVariable = function(variable) {
		var type = this.getSelectedType();
		var command = commandConfig.get(type);
		command.variables = command.variables || {};
		var variableObject = command.variables[variable];

		if(variableObject) {
			this.variableslist.addRow([variable, variableObject.label, variableObject.type, variableObject.defaultValue]);
		} else {
			this.variableslist.addRow([variable, variable, "string", ""]);
		}
	};

	this.newVariable = function() {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var input = {value:""};
		var result = promptService.prompt(null, "New variable", "Key:", input, null, {});
		if(result && input.value) {
			this.addVariable(input.value);
		}
	};

	this.removeVariable = function() {
		this.variableslist.removeSelected();
	};

	this.removeCommand = function(type) {
		var promtService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		if(promtService.confirm(window, "Remove command", "Are you sure you wan't to remove this command?")) {
			commandConfig.remove(type);
			this.removeFromList(type);
		}
	};

	this.removeFromList = function(type) {
		var list = this.commandlist.list;
		var children = list.childNodes;
		var length = children.length;
		for(var i = 0; i < length; i++) {
			var cell = children[i].firstChild;
			if(cell.getAttribute("label") === type) {
				list.removeChild(children[i]);
				if(i === length-1) {
					list.selectedIndex = i-2;
				} else {
					list.selectedIndex = i-1;
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
			commandConfig.set(input.value, {command: "", variables: {}, args: ""});
			this.commandlist.addRow([input.value]);
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
		this.updateAllVariableChangedStatus();
	};

	this.getCurrentVariables = function() {

		var result = {};

		var items = this.variableslist.getItems();
		for(var i = 0; i < items.length; i++) {
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

	this.variableUp = function() {
		this.variableslist.moveSelectedUp();
	};

	this.variableDown = function() {
		this.variableslist.moveSelectedDown();
	};

	this.restoreDefaultCommand = function() {
		var type = this.getSelectedType();
		var defaults = getDefaultCommandConfig();
		if(defaults[type]) {
			commandConfig.set(type, defaults[type]);
		} else {
			alert("No default found for " + type);
		}
		this.fillCommandConfigFields();
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

			for(var domain in importConfig) {
				if(!importConfig.hasOwnProperty(domain)) continue;
				if(!importConfig[domain]) continue;

				domainConfig.set(domain, importFile.get(domain));
			}
			domainConfig.save();
			this.configlist.list.clear();
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
}

function ConfigList() {

	this.list = new MenuList("configlist");

	this.editAction = function() {
		var item = this.list.getSelectedItem();
		if(item === null) {
			return;
		}
		var domain = item.firstChild.getAttribute("label");
		window.openDialog("chrome://serverbutton/content/domain_dialog.xul", "serverbutton-domain-dialog", "chrome,dialog,centerscreen,modal", domain).focus();
		this.list.clear();
		this.populate();
	};

	this.deleteAction = function() {
		var item = this.list.getSelectedItem();
		if(item === null) {
			return;
		}
		var domain = item.firstChild.getAttribute("label");
		domainConfig.remove(domain);
		domainConfig.save();
		this.list.removeSelected();
	};

	this.populate = function() {

		var config = domainConfig.getAll();
		for(var domain in config) {
			if(!config.hasOwnProperty(domain)) continue;
			if(!config[domain]) continue;
			this.list.addRow([domain, config[domain].type]);
		}
	};
}
