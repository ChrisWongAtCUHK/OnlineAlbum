#!/usr/bin/perl -w
#

use CGI;
use CGI::Carp qw/fatalsToBrowser warningsToBrowser/;
use DBI;
use strict;

# file picking interface

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
	print $q->header();
	print <<__LOGIN_SUCCESS_1__;
<html>
	<head>
		<title>File Picking Interface</title></head>
		<style>
			.dimension {
				width:30pt;
				height:20pt;
				font-size:10pt;
			}
		</style>
		<body style="font-family:verdana, sans-serif;">
			<h2>File Picking Interface</h2>
			<form method="post" action="./file_upload.cgi" enctype="multipart/form-data">
				<table cellspacing="5pt" cellpadding="10pt" style="border:1pt solid #7777ff;">
					<tr>
						<td>
							File
						</td>
						<td>
							<input type="file" name="upfile">
						</td>
					</tr>
					<tr>
						<td>
							Description
						</td>
						<td>
__LOGIN_SUCCESS_1__

							print $q->textfield(-name=>'description', -maxlength=>50);
print <<__LOGIN_SUCCESS_2__;
						</td>
					</tr>
					<tr>
						<td>
						</td>
						<td>
							<input type="submit" name="upload" value="Upload">
						</td>
					</tr>
					<tr>
						<td>
						</td>
						<td>
							<a href="./display.cgi">Back to Display Panel</a>
						</td>
					</tr>
				</table>
			</form>
	</body>
</html>

__LOGIN_SUCCESS_2__
} else {
	print $q->redirect(-uri=>'login.cgi');
}

$sth->finish();
$dbh->disconnect();