#!/usr/bin/perl -w

use CGI;
use CGI::Carp qw/fatalsToBrowser warningsToBrowser/;
use DBI;
use strict;

do "./include.pl";

my $q = CGI->new;

my $username_cookie = $q->cookie('username');
my $sessionkey_cookie = $q->cookie('sessionkey');

my $is_login = 0;
my $dbh;
my $sth;
if($username_cookie){
	$dbh = DBI->connect("DBI:mysql:1155000543;host=137.189.89.74", "1155000543", "SJ3344") or die $DBI::errsrt;
	$sth = $dbh->prepare("select sessionkey from Sessions where binary username = '$username_cookie' and binary sessionkey='$sessionkey_cookie'");	
    $sth->execute() or die "Cannot execute: ".$sth->errstr();
	my @row;
	
	if (@row = $sth->fetchrow_array()) {
		$is_login = 1;
	}
}

if($is_login){
	
	my $duplication = $q->param("duplication");
	
	
	if($duplication){
		print $q->header();
		my $upfile = $q->param("filename");
		my $file_size = $q->param("file_size");
		my $description = $q->param("description");
		my $new_filename = $q->param("new_filename");
		
		# description conversion
		description_convert(\$description);
		
		if($duplication eq "cancel"){
			# if the user chooses to cancel
			print_upload_result("Upload Cancelled", "");
		} else {
            # check the file extension
            my $correct_ext;
            if($duplication eq "rename"){
                $correct_ext = check_ext($new_filename);
            } elsif($duplication eq "overwrite"){
                $correct_ext = check_ext($upfile);
            }
            
           if($correct_ext){
				if($correct_ext ne "invalid"){
					# check if the uploaded file is valid image
					my $identify;
					# move the image file to relate directory
					if($duplication eq "rename"){
						`mv ./tmp/$upfile ./tmp/$new_filename`;
						$identify = check_identify("$new_filename", $correct_ext);
					} elsif ($duplication eq "overwrite") {
						$identify = check_identify("$upfile", $correct_ext);
					}
					
					if($identify){
						
						my $now = time;
						if($duplication eq "rename"){
							# if the user chooses to rename
							# check the file name duplication, DBI
							$sth = $dbh->prepare("select filename from Album where binary username = '$username_cookie' and binary filename = '$new_filename'");

							$sth->execute() or die "Cannot execute: ".$sth->errstr();
							if(my @row = $sth->fetchrow_array()){
								# print the duplication handling interface
								print_dhi("$new_filename",  $file_size, "$description");
							} else {
								# move the image file to relate directory
								`mv ./tmp/$new_filename ../storage/album/$username_cookie/$new_filename`;
							
                                # generate thumbnail if the size is larger than 100x100
                                if($identify eq "resize"){
                                    `convert -resize 100x100 ../storage/album/$username_cookie/$new_filename ../storage/album/$username_cookie/thumbnail/$new_filename`;
                                } else {
                                    `cp ../storage/album/$username_cookie/$new_filename ../storage/album/$username_cookie/thumbnail/$new_filename`;
                                }
                            
								# update database
								$dbh->do("insert into Album values('$new_filename', $file_size, $now, '$username_cookie', '$description')");
								print_upload_result("File uploaded:", "$new_filename");
							}
						} else {
							# if the user chooses to overwrite
							
							# move the image file to relate directory
							`mv ./tmp/$upfile ../storage/album/$username_cookie/$upfile`;
							
							# generate thumbnail if the size is larger than 100x100
                            if($identify eq "resize"){
                                `convert -resize 100x100 ../storage/album/$username_cookie/$upfile ../storage/album/$username_cookie/thumbnail/$upfile`;
                            } else {
                                `cp ../storage/album/$username_cookie/$upfile ../storage/album/$username_cookie/thumbnail/$upfile`;
                            }
							
							# update database
							$dbh->do("update Album set filesize = $file_size, timestamp = $now, username = '$username_cookie', description='$description' where username = '$username_cookie' and filename = '$upfile'");
							print_upload_result("File uploaded:", "$upfile");
						}
					
					} else {
						if($duplication eq "rename"){
							`rm -f ./tmp/$new_filename`;
							print_upload_result("Invalid file type:", "$new_filename");
						} elsif ($duplication eq "overwrite") {
							`rm -f ./tmp/$upfile`;
							print_upload_result("Invalid file type:", "$upfile");
						}
					}
				} else {
					print_upload_fail("The filename of the photo only contains alphabet (both
upper and lower-cases), digits, and underscores");
				}
            } else {
                print_upload_fail("The filename of the uploaded file must only carry one of the following extensions: jpg, gif, or png.");
            }
		}
	} else {
		print $q->redirect(-uri=>'file_upload.cgi');
	}
} else {
	print $q->redirect(-uri=>'login.cgi');
}

if($username_cookie){
	$sth->finish();
	$dbh->disconnect();
}