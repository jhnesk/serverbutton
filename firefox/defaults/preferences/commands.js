pref("extensions.serverbutton.command.ssh", "/usr/bin/urxvt -e ssh $USER@$HOST");
pref("extensions.serverbutton.command.ftp", "/usr/bin/gftp ftp://$USER:$PASSWORD@$HOST");
pref("extensions.serverbutton.command.rdesktop", "/usr/bin/rdesktop -u $USER -p $PASSWORD -g 1280x960 $HOST");
pref("extensions.serverbutton.command.vmware", "/usr/bin/vmware-view --serverURL=$HOST --userName=$USER --password=$PASSWORD -q");
