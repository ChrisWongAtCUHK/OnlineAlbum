#!/usr/bin/perl -w
#

use CGI;
use CGI::Carp qw/fatalsToBrowser warningsToBrowser/;
use DBI;
use strict;

do "./include.pl";

my $canUpload = 0; #debug, should be 0 at the beginning

my $q = CGI->new;

my $username_cookie = $q->cookie('username');
my $sessionkey_cookie = $q->cookie('sessionkey');

my $is_login = 0;
my $dbh;
my $sth;
if($username_cookie){
	$dbh = DBI->connect("dbi:SQLite:dbname=./db/assig1.db", "", "") or die $DBI::errsrt;
	# $dbh = DBI->connect("DBI:mysql:1155000543;host=137.189.89.74", "1155000543", "SJ3344") or die $DBI::errsrt;
	$sth = $dbh->prepare("select sessionkey from Sessions where binary username = '$username_cookie' and binary sessionkey='$sessionkey_cookie'");	
    $sth->execute() or die "Cannot execute: ".$sth->errstr();
	my @row;
	
	if (@row = $sth->fetchrow_array()) {
		$is_login = 1;
	}
}

if($is_login){
	
    # get the filename
	my $upfile = $q->param('upfile');
	
	# check the length of description
	my $description = $q->param('description');
	if(length($description) > 50){
		# if the length of the description is longer than maximum
		print $q->header();
		print_upload_fail("Description is too long. The maximum length is 50 characters.");
	} else {
		# if the length of the description is less than or equal to maximum
		
		
		# file handler
		my $fh = $q->upload('upfile');
		if (! $fh ) {
			print $q->redirect(-url=>"./fpi.cgi");
		}
		
		# check the file size
		my $file_size = -s $fh;

		if($file_size > 1000000){
			# if the file size is larger than 1000,000 bytes
			print $q->header();
			print_upload_fail("The maximum file size of each photo is restricted to be 1,000,000 bytes.");
		} else {
			# check the file extension
			my $correct_ext = check_ext($upfile);
			
			if($correct_ext){
				if($correct_ext ne "invalid"){
					print $q->header();
					# check the file name whether it is duplicate
					
					if (! open(OUTFILE, ">./tmp/$upfile") ) {
						# print "Can't open ./tmp/$upfile for writing - $!";
						exit(-1);
					}

					my $buffer = "";

					while (read($fh, $buffer, 1024)) {
						print OUTFILE $buffer;
					}

					close(OUTFILE);
					
					# check the file name duplication, DBI
					$sth = $dbh->prepare("select filename from Album where binary username = '$username_cookie' and binary filename = '$upfile'");

					$sth->execute() or die "Cannot execute: ".$sth->errstr();
					if(my @row = $sth->fetchrow_array()){
						# print the duplication handling interface
						print_dhi("$upfile",  $file_size, "$description");
					} else {
						# check if the uploaded file is valid image
						my $identify = check_identify($upfile, $correct_ext);

						if($identify){
							
							# move the image file to relate directory
							`mv ./tmp/$upfile ../storage/album/$username_cookie/$upfile`;
							
							# generate thumbnail if the size is larger than 100x100
                            if($identify eq "resize"){
                                `convert -resize 100x100 ../storage/album/$username_cookie/$upfile ../storage/album/$username_cookie/thumbnail/$upfile`;
                            } else {
                                `cp ../storage/album/$username_cookie/$upfile ../storage/album/$username_cookie/thumbnail/$upfile`;
                            }
							
							# update database
							my $now = time;
							
							# description conversion
							description_convert(\$description);
							$dbh->do("insert into Album values('$upfile', $file_size, $now, '$username_cookie', '$description')");
							
							print_upload_result("File uploaded:", "$upfile");
						} else {
							`rm -f ./tmp/$upfile`;
							print_upload_result("Invalid file type:", "$upfile");
						}
					} 
				} else {
					print $q->header();
					print_upload_fail("The filename of the photo only contains alphabet (both upper and lower-cases), digits, and underscores.");
				}
			} else {
				print $q->header();
				print_upload_fail("The filename of the uploaded file must only carry one of the following extensions: jpg, gif, or png.");
			}
		}
	}


	

} else{
	print $q->redirect(-uri=>'login.cgi');
}

if($username_cookie){
	$sth->finish();
	$dbh->disconnect();
}
