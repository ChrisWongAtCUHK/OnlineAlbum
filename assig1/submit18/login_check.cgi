#!/usr/bin/perl -w

use CGI;
use CGI::Carp qw/fatalsToBrowser warningsToBrowser/;
use DBI;
use strict;


do "./include.pl";
my $q = CGI->new;

# get login username
my $username = $q->param("username");

# get login passwd
my $passwd = $q->param("passwd");


# mysql
# my 	$dbh = DBI->connect("DBI:mysql:1155000543;host=137.189.89.74", "1155000543", "SJ3344") or die $DBI::errsrt;
# sqlite3
my $dbh = DBI->connect("dbi:SQLite:dbname=./db/assig1.db", "", "") or die $DBI::errsrt;
my $sth = $dbh->prepare("select * from Users where binary username='$username' and binary password='$passwd'");
$sth->execute() or die "Cannot execute: ".$sth->errstr();

# if $id is equal to zero, no match user is found
my @row;
my $is_login = 0;
if (@row = $sth->fetchrow_array()) {
		$is_login = 1;
}

my $username_cookie;
my $sessionkey_cookie;

if($is_login){
	# generate the session and store it into the cookie
	my $sessionkey = gen_session_key($username);
	$username_cookie = $q->cookie(-name=>'username', -value=>$username, -path=>'.', -expires=>'+9h');
	$sessionkey_cookie = $q->cookie(-name=>'sessionkey', -value=>$sessionkey, -path=>'.', -expires=>'+9h');
	
	# store the session into the database
	$sth = $dbh->prepare("insert into Sessions values('$username', '$sessionkey')");
	$sth->execute() or die "Cannot execute: ".$sth->errstr();
}

if($is_login){
	print $q->redirect(-uri=>'display.cgi', -cookie=>[$username_cookie, $sessionkey_cookie]);
} else {
	print $q->redirect(-uri=>'login.cgi?login_fail=Login fail');

}

$sth->finish();
$dbh->disconnect();
