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

Components.utils.import("resource://serverbutton/domain_config.js");

function OptionDialog() {

	this.types = new Array();

	this.configlist = new ConfigList();

	this.init = function() {
		var commands = this.getCommandList();
		var length = commands.length;
		for(var i = 0; i < length; i++) {
			this.addCommand(commands[i]);
		}

		this.configlist.populate();
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

	this.importConfig = function() {
		var file = this.selectImportFile();
		if(file) {

			var importFile = new DomainConfig(file);
			importFile.load();
			var importConfig = importFile.getAll();

			for(domain in importConfig) {
				if(!importConfig.hasOwnProperty(domain)) continue;
				if(!importConfig[domain]) continue;

				serverButtonConfig.set(domain, importFile.get(domain));
			}
			serverButtonConfig.save();
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
			var exportConfig = new DomainConfig(file);
			exportConfig.write(serverButtonConfig.getAll());
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

	this.editAction = function() {
		var domain = document.popupNode.firstChild.getAttribute("label");
		var config = serverButtonConfig.get(domain);
		var param = {input:config,key:domain,output:null};

		window.openDialog("chrome://serverbutton/content/domain_dialog.xul", "serverbutton-domain-dialog", "chrome,dialog,centerscreen,modal", param).focus();
		if(param.output) {
			config = {
				type: param.output.type,
				host: param.output.host,
				user: param.output.user,
				password: param.output.password
			};
			if(config.type) {
				serverButtonConfig.set(domain, config);
			} else {
				serverButtonConfig.remove(domain);
			}
			serverButtonConfig.save();
			this.configlist.clear();
			this.configlist.populate();
		}
	};

	this.deleteAction = function() {
		var domain = document.popupNode.firstChild.getAttribute("label");
		serverButtonConfig.remove(domain);
		serverButtonConfig.save();
		this.configlist.clear();
		this.configlist.populate();
	};
}

function ConfigList() {

	this.clear = function() {
		var list = document.getElementById("configlist");
		var items = list.getElementsByTagName("listitem");
		for(var i = items.length-1; i >= 0; i--) {
			list.removeChild(items[i]);
		}
	};

	this.populate = function() {
		var list = document.getElementById("configlist");

		var config = serverButtonConfig.getAll();
		for(var domain in config) {
			if(!config.hasOwnProperty(domain)) continue;
			if(!config[domain]) continue;

			var row = document.createElement("listitem");

			this.addCell(row, domain);
			this.addCell(row, config[domain].type);
			this.addCell(row, config[domain].host);
			this.addCell(row, config[domain].user);

			list.appendChild(row);
		}
	};

	this.addCell = function(row, label) {
		var cell = document.createElement("listcell");
		cell.setAttribute("label", label);
		row.appendChild(cell);
	};
}

var optiondialog = new OptionDialog();
