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

var ServerButton_urlBarListener = {
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
				ServerButton.setHost(aURI.host);
			} catch(err) {
				ServerButton.setHost(null);
			}
		} else {
			ServerButton.setHost(null);
		}
	},

	onStateChange: function(a, b, c, d) {},
	onProgressChange: function(a, b, c, d, e, f) {},
	onStatusChange: function(a, b, c, d) {},
	onSecurityChange: function(a, b, c) {}
};
 
var ServerButton = {
	host: null,

	init: function() {
		gBrowser.addProgressListener(ServerButton_urlBarListener, Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
	},

	uninit: function() {
		gBrowser.removeProgressListener(ServerButton_urlBarListener);
	},

	setHost: function(host) {
		ServerButton.host = host;
		ServerButton.updateButtonState();
	},

	updateButtonState: function() {
		var button = document.getElementById("serverbutton-toolbarbutton");
		var config = domainConfig.get(ServerButton.host);
		if(config) {
			button.removeAttribute("config");
			button.setAttribute("oncommand", "ServerButton.connect();");
			button.setAttribute("tooltiptext", "Connect to " + config.host);
			button.disabled=false;
			document.getElementById("menuitem-connect").disabled=false;
		} else if(ServerButton.host) {
			button.setAttribute("config", "true");
			button.setAttribute("oncommand", "ServerButton.openConfig();");
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
	},

	connect: function() {
		var config = domainConfig.get(ServerButton.host);

		if(config != null) {
			var command;
			try {
				command = new Command(config.type);
			} catch(e) {
				alert("Error: No command found for the selected type '" + config.type + "'.");
				return;
			}
			command.setHost(config.host);
			command.setUser(config.user);
			command.setPassword(config.password);
			try {
				command.run();
			} catch(e) {
				alert("Error: Couldn't run the command. Check the configuration.");
				return;
			}
		}
	},

	openConfig: function() {
		var config = domainConfig.get(ServerButton.host);
		var param = {input:config,key:ServerButton.host,output:null};

		window.openDialog("chrome://serverbutton/content/domain_dialog.xul", "serverbutton-domain-dialog", "chrome,dialog,centerscreen,modal", param).focus();
		if(param.output) {
			config = {
				type: param.output.type,
				host: param.output.host,
				user: param.output.user,
				password: param.output.password
			};
			if(config.type) {
				domainConfig.set(ServerButton.host, config);
			} else {
				domainConfig.remove(ServerButton.host);
			}
			domainConfig.save();
			ServerButton.updateButtonState();
		}
	},
};

window.addEventListener("load", ServerButton.init, false);
window.addEventListener("unload", ServerButton.uninit, false);
