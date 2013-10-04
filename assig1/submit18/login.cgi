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
	# $dbh = DBI->connect("DBI:mysql:1155000543;host=137.189.89.74", "1155000543", "SJ3344") or die $DBI::errsrt;
	$dbh = DBI->connect("dbi:SQLite:dbname=./db/assig1.db", "", "") or die $DBI::errsrt;

	$sth = $dbh->prepare("select sessionkey from Sessions where binary username = '$username_cookie' and binary sessionkey='$sessionkey_cookie'");	
    $sth->execute() or die "Cannot execute: ".$sth->errstr();
	my @row;
	
	if (@row = $sth->fetchrow_array()) {
		$is_login = 1;
	}
	$sth->finish();
	$dbh->disconnect();
}

if($is_login){
	print $q->redirect(-uri=>'./display.cgi');
    `mkdir -p ../storage/album`;
} else {
	print $q->header();
    `mkdir -p ../storage/album`;
    my $login_fail = $q->param('login_fail');
	print_login_html($login_fail);
}
