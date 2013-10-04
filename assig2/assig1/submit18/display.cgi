#!/usr/bin/perl -w

use CGI;
use CGI::Carp qw/fatalsToBrowser warningsToBrowser/;
use DBI;
use strict;


my $q = CGI->new;

my $sessionkey = $q->cookie('sessionkey');

use CGI;
use CGI::Carp qw/fatalsToBrowser warningsToBrowser/;
use DBI;
use lib '/uac/y10/wcwong0/perl/lib/perl/5.10.1';
use strict;

my $q = CGI->new;

my $username_cookie = $q->cookie('username');
my $sessionkey_cookie = $q->cookie('sessionkey');

my $is_login = 0;
if($username_cookie){
	# $dbh = DBI->connect("dbi:SQLite:dbname=./db/assig1.db", "", "") or die $DBI::errsrt;
	my $dbh = DBI->connect("DBI:mysql:1155000543;host=137.189.89.74", "1155000543", "SJ3344") or die $DBI::errsrt;
	my $sth = $dbh->prepare("select sessionkey from Sessions where binary username = '$username_cookie' and binary sessionkey='$sessionkey_cookie'");
	$sth->execute() or die "Cannot execute: ".$sth->errstr();
	my @row;
	
	if (@row = $sth->fetchrow_array()) {
		if($sessionkey_cookie eq $row[0]){
			$is_login = 1;
		}
	}
	$sth->finish();
	$dbh->disconnect();
}

if($is_login){
	print $q->header();

	print <<__LOGIN_SUCCESS__;
		<html>
			<head><title>Display Panel</title></head>
			<body style="font-family:verdana, sans-serif;">
				<h2>Display Panel</h2>
				<form method="post" action="./login_check.cgi">
				<table cellspacing="5pt" cellpadding="10pt" style="border:1pt solid #7777ff;">
					<tr>
						<td><a href="./album.cgi">View album</a></td>
					</tr>
					
					<tr>
						<td><a href="./fpi.cgi">Upload photos</a></td>
					</tr>
					
					<tr>
						<td><a href="./logout.cgi">Logout</a></td>
					</tr>
				</table>
			</body>
		</html>

__LOGIN_SUCCESS__
} else {
	print $q->redirect(-uri=>'login.cgi');
}
