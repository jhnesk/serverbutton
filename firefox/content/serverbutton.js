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
var serverbutton = serverbutton || {};

Components.utils.import("resource://serverbutton/configuration.js");

serverbutton.UrlBarListener = function(toolbarButton) {

	this.toolbarButton = toolbarButton;

	this.QueryInterface = function(aIID) {
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
				aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
				aIID.equals(Components.interfaces.nsISupports))
			return this;
		throw Components.results.NS_NOINTERFACE;
	};

	this.onLocationChange = function(aProgress, aRequest, aURI) {
		if(aURI) {
			try {
				this.toolbarButton.setDomain(aURI.host);
			} catch(err) {
				this.toolbarButton.setDomain(null);
			}
		} else {
			this.toolbarButton.setDomain(null);
		}
	};

	this.onStateChange = function(a, b, c, d) {};
	this.onProgressChange = function(a, b, c, d, e, f) {};
	this.onStatusChange = function(a, b, c, d) {};
	this.onSecurityChange = function(a, b, c) {};
};

serverbutton.ToolbarButton = function() {

	this.domain = null;
	this.connectFunction = this.createEventHandler(this.connect);
	this.openConfigFunction = this.createEventHandler(this.openConfig);
	this.strings;
	this.urlBarListener;
};

serverbutton.ToolbarButton.prototype.createEventHandler = function(f) {
	var fun = f.bind(this);
	return function(event) {
		event.stopPropagation();
		fun();
	};
};

serverbutton.ToolbarButton.prototype.init = function() {
	this.urlBarListener = new serverbutton.UrlBarListener(this);
	gBrowser.addProgressListener(this.urlBarListener, Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
	this.strings = document.getElementById("serverbutton-toolbarbutton-strings");
	var menuitemConnect = document.getElementById("menuitem-connect");
	menuitemConnect.addEventListener("command", this.connectFunction, false);
	var menuitemConfig = document.getElementById("menuitem-config");
	menuitemConfig.addEventListener("command", this.openConfigFunction, false);
	var menuitemShortCut = document.getElementById("serverbutton-shortcut");
	menuitemShortCut.addEventListener("command", this.connectFunction, false);
};

serverbutton.ToolbarButton.prototype.uninit = function() {
	gBrowser.removeProgressListener(this.urlBarListener);
};

serverbutton.ToolbarButton.prototype.setDomain = function(domain) {
	this.domain = domain;
	this.updateButtonState();
};

serverbutton.ToolbarButton.prototype.updateButtonState = function() {
	var button = document.getElementById("serverbutton-toolbarbutton");

	var config = serverbutton.config.domains.get(this.domain);

	if(config) {
		button.removeAttribute("config");
		button.addEventListener("command", this.connectFunction, false);
		button.removeEventListener("command", this.openConfigFunction, false);
		var tooltip = this.strings.getString("tooltipConnect");
		button.setAttribute("tooltiptext", tooltip);
		button.disabled=false;
		document.getElementById("menuitem-connect").disabled=false;
	} else if(this.domain) {
		button.setAttribute("config", "true");
		button.removeEventListener("command", this.connectFunction, false);
		button.addEventListener("command", this.openConfigFunction, false);
		var tooltip = this.strings.getString("tooltipConfigure");
		button.setAttribute("tooltiptext", tooltip);
		button.disabled=false;
		document.getElementById("menuitem-connect").disabled=true;
	} else {
		button.removeAttribute("config");
		button.removeEventListener("command", this.connectFunction, false);
		button.removeEventListener("command", this.openConfigFunction, false);
		var tooltip = this.strings.getString("tooltipNoDomain");
		button.setAttribute("tooltiptext", tooltip);
		button.disabled=true;
		document.getElementById("menuitem-connect").disabled=true;
	}
};

serverbutton.ToolbarButton.prototype.connect = function() {
	var config = serverbutton.config.domains.get(this.domain);

	if(config != null) {
		var command;
		try {
			command = new serverbutton.Command(config);
		} catch(e) {
			alert(this.strings.getString("errorNoCommand"));
			throw e;
		}
		try {
			command.run();
		} catch(e) {
			alert(this.strings.getString("errorRun"));
			throw e;
		}
	}
};

serverbutton.ToolbarButton.prototype.openConfig = function() {
	window.openDialog("chrome://serverbutton/content/domain_dialog.xul", "serverbutton-domain-dialog", "chrome,dialog,centerscreen,modal", this.domain).focus();
	this.updateButtonState();
};

(function() {
	var toolbarButton = new serverbutton.ToolbarButton();
	window.addEventListener("load", toolbarButton.init.bind(toolbarButton), false);
	window.addEventListener("unload", toolbarButton.uninit, false);
})();
