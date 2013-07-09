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

Components.utils.import("resource://gre/modules/FileUtils.jsm");

function ConfigFileHandler(f) {

	this.getFile = function() {
		var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
		file.append("serverbutton");
		file.append("config.json");
		return file;
	};

	this.file = f || this.getFile();

	this.read = function() {

		if(!this.file.exists()) {
			this.file.create(0, 0600);
		}
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(this.file, 0x01, 4, null);
		var fileScriptableIO = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream); 
		fileScriptableIO.init(istream);
		istream.QueryInterface(Components.interfaces.nsILineInputStream); 
		var content = "";
		var csize = 0; 
		while ((csize = fileScriptableIO.available()) != 0)
		{
			content += fileScriptableIO.read( csize );
		}
		fileScriptableIO.close();
		istream.close();
		return JSON.parse(content);
	};

	this.write = function(jsonObject) {
		var content = JSON.stringify(jsonObject);
		var stream = FileUtils.openFileOutputStream(this.file, FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE);
		stream.write(content, content.length);
		stream.close();
	};
}
