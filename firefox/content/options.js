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

function OptionDialog() {

	this.types = new Array();

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
		this.types.push(type);

		var dialog = document.getElementById("commands");
		var id = "command-" + type;

		var label = document.createElement("label");
		label.setAttribute("control", id);
		label.setAttribute("value", type + ":");

		var textbox = document.createElement("textbox");
		textbox.setAttribute("id", id);
		var value = commandConfig.get(type) || "";
		textbox.setAttribute("value", value);
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

	this.save = function() {

		var length = this.types.length;
		for(var i = 0; i < length; i++) {
			var type = this.types[i];
			var command = document.getElementById("command-" + type).value;
			commandConfig.set(type, command);
		}
		commandConfig.save();
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

	this.editAction = function() {
		var domain = document.popupNode.firstChild.getAttribute("label");
		var config = domainConfig.get(domain);
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
				domainConfig.set(domain, config);
			} else {
				domainConfig.remove(domain);
			}
			domainConfig.save();
			this.configlist.clear();
			this.configlist.populate();
		}
	};

	this.deleteAction = function() {
		var domain = document.popupNode.firstChild.getAttribute("label");
		domainConfig.remove(domain);
		domainConfig.save();
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

		var config = domainConfig.getAll();
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
