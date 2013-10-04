#!/usr/bin/perl -w

use CGI;
use CGI::Carp qw/fatalsToBrowser warningsToBrowser/;
use DBI;
use strict;

my $q = CGI->new;

my $username_cookie = $q->cookie('username');
my $sessionkey_cookie = $q->cookie('sessionkey');

my $dbh;
my $sth;

if($username_cookie){
	$dbh = DBI->connect("dbi:SQLite:dbname=./db/assig1.db", "", "") or die $DBI::errsrt;
	# $dbh = DBI->connect("DBI:mysql:1155000543;host=137.189.89.74", "1155000543", "SJ3344") or die $DBI::errsrt;
	
	# revoke session
	$sth = $dbh->prepare("delete from Sessions where binary username = '$username_cookie' and binary  sessionkey='$sessionkey_cookie'");
	$sth->execute() or die "Cannot execute: ".$sth->errstr();
	$username_cookie = $q->cookie(-name=>'username', -value=>'', -path=>'.', -expires=>'+9h');
	$sessionkey_cookie = $q->cookie(-name=>'sessionkey', -value=>'', -path=>'.', -expires=>'+9h');
	print $q->redirect(-uri=>'./login.cgi', -cookie=>[$username_cookie, $sessionkey_cookie]);
} else {
	print $q->redirect(-uri=>'./login.cgi');
}

$sth->finish();
$dbh->disconnect();
