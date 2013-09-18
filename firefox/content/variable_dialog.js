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

function VariableDialog() {

	this.data = window.arguments[0];

	this.init = function() {
		var typeIndex = {"string": 0, "password": 1, "integer": 2};

		document.getElementById("title-variable").setAttribute("label", this.data.name);
		document.getElementById("serverbutton-variable-label").value = this.data.label;
		document.getElementById("serverbutton-variable-type").selectedIndex = typeIndex[this.data.type];
		document.getElementById("serverbutton-variable-default").value = this.data.defaultValue;
	};

	this.save = function() {
		this.data.label = document.getElementById("serverbutton-variable-label").value;
		this.data.type = document.getElementById("serverbutton-variable-type").selectedItem.getAttribute("label");
		this.data.defaultValue = document.getElementById("serverbutton-variable-default").value;
	};
}
