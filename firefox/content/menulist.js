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

function MenuList(id) {

	this.list = document.getElementById(id);

	this.getItems = function() {
		return this.list.getElementsByTagName("listitem");
	};

	this.clear = function() {
		var items = this.getItems();
		for(var i = items.length-1; i >= 0; i--) {
			this.list.removeChild(items[i]);
		}
	};

	this.addRow = function(labels) {
		var row = document.createElement("listitem");

		for(var i = 0; i < labels.length; i++) {
			var cell = document.createElement("listcell");
			cell.setAttribute("label", labels[i]);
			row.appendChild(cell);
		}

		this.list.appendChild(row);
	};

	this.selectFirst = function() {
		this.list.selectedIndex = 0;
	};

	this.removeSelected = function() {
		this.list.removeChild(this.list.selectedItem);
	};

	this.moveSelectedUp = function() {
		var selected = this.list.selectedItem;
		if(!selected) {
			return;
		}
		var previous = selected.previousSibling;

		if(previous && previous.tagName === "listitem") {
			this.list.removeChild(selected);
			this.list.insertBefore(selected, previous);
			this.list.selectedItem = selected;
		}
	};

	this.moveSelectedDown = function() {
		var selected = this.list.selectedItem;
		if(!selected) {
			return;
		}
		var next = selected.nextSibling;

		if(next && next.tagName === "listitem") {
			this.list.removeChild(selected);
			if(next.nextSibling) {
				this.list.insertBefore(selected, next.nextSibling);
			} else {
				this.list.appendChild(selected);
			}
			this.list.selectedItem = selected;
		}
	};

	this.getSelectedItem = function() {
		return this.list.selectedItem;
	};
}
