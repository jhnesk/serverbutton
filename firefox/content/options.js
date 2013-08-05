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

		this.configlist.populate();
	};

	this.addCommand = function(type) {

		var dialog = document.getElementById("commands");
		var id = "command-" + type;

		var label = document.createElement("label");
		label.setAttribute("control", id);
		label.setAttribute("value", type + ":");

		var hbox = document.createElement("hbox");

		var textbox = document.createElement("textbox");
		textbox.setAttribute("id", id);
		var value = commandConfig.get(type) || "";
		textbox.setAttribute("value", value);
		textbox.setAttribute("flex", "1");
		textbox.setAttribute("style", "min-width: 30em;");

		var removeButton = document.createElement("button");
		removeButton.setAttribute("icon", "remove");
		removeButton.setAttribute("label", "Remove");
		removeButton.setAttribute("onclick", "optiondialog.removeCommand('" + type  + "');");

		hbox.appendChild(textbox);
		hbox.appendChild(removeButton);

		var vbox = document.createElement("vbox");
		vbox.setAttribute("id", "command-wrapper-" + type);
		vbox.appendChild(label);
		vbox.appendChild(hbox);
		dialog.appendChild(vbox);
	};

	this.removeCommand = function(type) {
		var promtService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		if(promtService.confirm(window, "Remove command", "Are you sure you wan't to remove this command?")) {
			commandConfig.remove(type);
			var commandElement = document.getElementById("command-wrapper-" + type);
			commandElement.parentNode.removeChild(commandElement);
		}
	};

	this.addType = function() {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
		var input = {value:""};
		var result = promptService.prompt(null, "New type", "Key:", input, null, {});
		if(result && input.value) {
			commandConfig.set(input.value, "");
			this.addCommand(input.value);
		}
	};

	this.save = function() {
		var commands = commandConfig.getAll();
		for(var type in commands) {
			if(!commands.hasOwnProperty(type)) continue;

			var command = document.getElementById("command-" + type).value;
			commandConfig.set(type, command);
		}
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

	this.togglePassword = function() {
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

		var showPassword = document.getElementById("show-password").checked;

		var config = domainConfig.getAll();
		for(var domain in config) {
			if(!config.hasOwnProperty(domain)) continue;
			if(!config[domain]) continue;

			var row = document.createElement("listitem");

			this.addCell(row, domain);
			this.addCell(row, config[domain].type);
			this.addCell(row, config[domain].host);
			this.addCell(row, config[domain].user);
			if(showPassword) {
				this.addCell(row, config[domain].password);
			} else {
				this.addCell(row, "********");
			}

			list.appendChild(row);
		}
	};

	this.addCell = function(row, label) {
		var cell = document.createElement("listcell");
		cell.setAttribute("label", label);
		row.appendChild(cell);
	};
}
