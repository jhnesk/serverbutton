Server Button
=============

This is a simple firefox extension to launch a command depending on the
domain loaded in the current tab. It's intended purpose is to login to
the webserver. That can be really useful when you need quick access to
many different servers.

Security:
---------

Since this extension runs external commands there are a few security
concerns. Other extensions or plugins could potentially change the
preferences to run malicious code as the current user. This shouldn't
be an issue, since a malicious extension could do this anyway, but if
there are a bug in firefox or any extension which allows an attacker to
change preferences, this might become a problem.

Another issue is that Server Button saves your passwords in plain text
in a file in the firefox profile directory. I plan to add some kind of
encryption option to solve this.

Known issues:
-------------

- Can't run executables with whitespaces in their path or filename.

License:
--------

> Server Button is free software: you can redistribute it and/or modify
> it under the terms of the GNU General Public License as published by
> the Free Software Foundation, either version 3 of the License, or (at
> your option) any later version.

> Server Button is distributed in the hope that it will be useful, but
> WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
> or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
> for more details.

> You should have received a copy of the GNU General Public License along
> with Server Button. If not, see <http://www.gnu.org/licenses/>.

Copyright 2013 Johan Ask.
E-mail: jhnesk@gmail.com
