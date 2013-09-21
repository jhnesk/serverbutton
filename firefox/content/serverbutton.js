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

serverbutton.urlBarListener = {
	QueryInterface: function(aIID)
	{
		if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
				aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
				aIID.equals(Components.interfaces.nsISupports))
			return this;
		throw Components.results.NS_NOINTERFACE;
	},

	onLocationChange: function(aProgress, aRequest, aURI)
	{
		if(aURI) {
			try {
				serverbutton.toolbarButton.setDomain(aURI.host);
			} catch(err) {
				serverbutton.toolbarButton.setDomain(null);
			}
		} else {
			serverbutton.toolbarButton.setDomain(null);
		}
	},

	onStateChange: function(a, b, c, d) {},
	onProgressChange: function(a, b, c, d, e, f) {},
	onStatusChange: function(a, b, c, d) {},
	onSecurityChange: function(a, b, c) {}
};

serverbutton.ToolbarButton = function() {

	this.domain = null;
};

serverbutton.ToolbarButton.prototype.init = function() {
	gBrowser.addProgressListener(serverbutton.urlBarListener, Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
};

serverbutton.ToolbarButton.prototype.uninit = function() {
	gBrowser.removeProgressListener(serverbutton.urlBarListener);
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
		button.setAttribute("oncommand", "serverbutton.toolbarButton.connect();");
		button.setAttribute("tooltiptext", "Connect to " + config.host);
		button.disabled=false;
		document.getElementById("menuitem-connect").disabled=false;
	} else if(this.domain) {
		button.setAttribute("config", "true");
		button.setAttribute("oncommand", "serverbutton.toolbarButton.openConfig();");
		button.setAttribute("tooltiptext", "Configure domain");
		button.disabled=false;
		document.getElementById("menuitem-connect").disabled=true;
	} else {
		button.removeAttribute("config");
		button.removeAttribute("oncommand");
		button.setAttribute("tooltiptext", "No domain");
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
			alert("Error: No command found for the selected type '" + config.type + "'.");
			throw e;
		}
		try {
			command.run();
		} catch(e) {
			alert("Error: Couldn't run the command. Check the configuration.");
			throw e;
		}
	}
};

serverbutton.ToolbarButton.prototype.openConfig = function() {
	window.openDialog("chrome://serverbutton/content/domain_dialog.xul", "serverbutton-domain-dialog", "chrome,dialog,centerscreen,modal", this.domain).focus();
	this.updateButtonState();
};

serverbutton.toolbarButton = new serverbutton.ToolbarButton();

window.addEventListener("load", serverbutton.toolbarButton.init, false);
window.addEventListener("unload", serverbutton.toolbarButton.uninit, false);
