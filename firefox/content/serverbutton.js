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

serverbutton.UrlBarListener = function() {

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
				serverbutton.ToolbarButton.setDomain(aURI.host);
			} catch(err) {
				serverbutton.ToolbarButton.setDomain(null);
			}
		} else {
			serverbutton.ToolbarButton.setDomain(null);
		}
	};

	this.onStateChange = function(a, b, c, d) {};
	this.onProgressChange = function(a, b, c, d, e, f) {};
	this.onStatusChange = function(a, b, c, d) {};
	this.onSecurityChange = function(a, b, c) {};
};

serverbutton.ToolbarButton = (function() {
	var exports = {};

	var domain = null;

	var urlBarListener = new serverbutton.UrlBarListener();

	function init() {
		gBrowser.addProgressListener(urlBarListener);
	}

	function uninit() {
		gBrowser.removeProgressListener(urlBarListener);
	}

	function setDomain(d) {
		domain = d;
		updateButtonState();
	}

	function updateButtonState() {
		var button = document.getElementById("serverbutton-toolbarbutton");
		if(!button) return;
		var strings = document.getElementById("serverbutton-toolbarbutton-strings");
		var config = serverbutton.config.domains.get(domain);

		if(config) {
			button.removeAttribute("config");
			button.addEventListener("command", connect, false);
			button.removeEventListener("command", openConfig, false);
			var tooltip = strings.getString("tooltipConnect");
			button.setAttribute("tooltiptext", tooltip);
			button.disabled=false;
			document.getElementById("serverbutton-menuitem-connect").disabled=false;
		} else if(domain) {
			button.setAttribute("config", "true");
			button.removeEventListener("command", connect, false);
			button.addEventListener("command", openConfig, false);
			var tooltip = strings.getString("tooltipConfigure");
			button.setAttribute("tooltiptext", tooltip);
			button.disabled=false;
			document.getElementById("serverbutton-menuitem-connect").disabled=true;
		} else {
			button.removeAttribute("config");
			button.removeEventListener("command", connect, false);
			button.removeEventListener("command", openConfig, false);
			var tooltip = strings.getString("tooltipNoDomain");
			button.setAttribute("tooltiptext", tooltip);
			button.disabled=true;
			document.getElementById("serverbutton-menuitem-connect").disabled=true;
		}
	}

	function connect() {
		var config = serverbutton.config.domains.get(domain);
		var strings = document.getElementById("serverbutton-toolbarbutton-strings");

		if(config != null) {
			var command;
			try {
				command = new serverbutton.Command(config);
			} catch(e) {
				alert(strings.getString("errorNoCommand"));
				throw e;
			}
			try {
				command.run();
			} catch(e) {
				alert(strings.getString("errorRun"));
				throw e;
			}
		}
	}

	function openConfig() {
		window.openDialog("chrome://serverbutton/content/domain_dialog.xul", "serverbutton-domain-dialog", "chrome,dialog,centerscreen,modal", domain).focus();
		updateButtonState();
	}

	return {
		connect: connect,
		openConfig: openConfig,
		setDomain: setDomain,
		init: init,
		uninit: uninit,
	};
})();

window.addEventListener("load", serverbutton.ToolbarButton.init, false);
window.addEventListener("unload", serverbutton.ToolbarButton.uninit, false);
