#!/usr/bin/perl -w

use strict;
use DBI;

# To clean up the database and album
# WARN: don't access it if you don't know what will happen
print "Content-type: text/html\n\n";

`rm -f ../storage/album/tywong/*.jpg`;
`rm -f ../storage/album/tywong/thumbnail/*.jpg`;

`rm -f ../storage/album/tywong/*.png`;
`rm -f ../storage/album/tywong/thumbnail/*.png`;

`rm -f ../storage/album/tywong/*.gif`;
`rm -f ../storage/album/tywong/thumbnail/*.gif`;

my $dbh = DBI->connect("dbi:SQLite:dbname=./db/assig1.db", "", "") or die $DBI::errsrt;
# my $dbh = DBI->connect("DBI:mysql:1155000543;host=137.189.89.74", "1155000543", "SJ3344") or die $DBI::errsrt;
$dbh->do("delete from Album");
$dbh->disconnect();
