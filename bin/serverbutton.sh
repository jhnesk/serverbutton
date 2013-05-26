#!/bin/sh
#
# Copyright 2013 Johan Ask.
# E-mail: jhnesk@gmail.com
#
# This file is part of serverbutton.
#
# serverbutton is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# serverbutton is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with serverbutton.  If not, see <http://www.gnu.org/licenses/>.

TERMINAL=urxvt

TYPE=$1
HOST=$2
USER=$3
PASSWORD=$4

case "$TYPE" in
	"rdesktop" )
		rdesktop -u $USER -p $PASSWORD -g 1280x960 $HOST & disown
		;;
	"ssh" )
		$TERMINAL -e ssh $USER@$HOST & disown
		;;
	"vmware" )
		vmware-view --serverURL=$HOST --userName=$USER --password=$PASSWORD -q & disown
		;;
	"ftp" )
		gftp ftp://$USER:$PASS@$HOST & disown
		;;
esac
