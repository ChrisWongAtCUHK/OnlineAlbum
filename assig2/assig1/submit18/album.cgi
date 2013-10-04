#!/usr/bin/perl -w

use CGI;
use CGI::Carp qw/fatalsToBrowser warningsToBrowser/;
use DBI;
use strict;

do "./include.pl";

my $q = CGI->new;

# default username is the first one in the database
my $username;
my $username_cookie = $q->cookie('username');
my $sessionkey_cookie = $q->cookie('sessionkey');

my $is_login = 0;
my $dbh = DBI->connect("DBI:mysql:1155000543;host=137.189.89.74", "1155000543", "SJ3344") or die $DBI::errsrt;
my $sth;

if($username_cookie){
	$sth = $dbh->prepare("select sessionkey from Sessions where binary username = '$username_cookie' and binary sessionkey = '$sessionkey_cookie'");
	$sth->execute() or die "Cannot execute: ".$sth->errstr();
	my @row;
	
	if (@row = $sth->fetchrow_array()) {
		$is_login = 1;
		$username = $username_cookie;
	}
}

if(!$is_login){
	$sth = $dbh->prepare("select binary username from Users");
	$sth->execute() or die "Cannot execute: ".$sth->errstr();
	my @row;
	
	if (@row = $sth->fetchrow_array()) {
		$username = $row[0];
	}
}

print $q->header();
`mkdir -p ../storage/album/$username`;
`mkdir -p ../storage/album/$username/thumbnail`;

### do operation starts ###
my $row = $q->param("row");
my $column = $q->param("column");
my $sort_by = $q->param("sort_by");
my $order = $q->param("order");
my $page = $q->param("page");
my $albumBtn = $q->param("albumBtn");
my $change;
my $remove_selected;
my $go_to_page;


if($albumBtn eq "Change"){
    $change = 1;
}elsif ($albumBtn eq "Remove selected"){
    $remove_selected = 1;
}elsif ($albumBtn eq "Go to page") {
    $go_to_page = 1;
}

#default row=2 & column=4 & sort by filename ascendingly
if(!$row) {
	$row = 2;
	$column = 4;
	$sort_by = "filename";
	$order = "asc";
}

#default page=1
# After any change in the sorting configuration or any change in the array dimension,
# the album display interface will be showing the first page.
if(!$page or $change or $remove_selected) {
	$page = 1;
} 

# Changing the page number must not change the sorting configuration nor the array dimension.
if($go_to_page){
	$row = $q->param("row_not_change");
	$column = $q->param("column_not_change");
	$sort_by = $q->param("sort_by_not_change");
	$order = $q->param("order_not_change");
}

my $img_per_page = $row * $column;
my $total_page = 1;

# remove the check images
if ($remove_selected){
    my @remove = $q->param("remove");
    if(@remove){
        my $len = scalar @remove;
        for(my $i = 0 ;$i < $len; $i++){
            # remove images file from user folder and thumbnail folder
            `rm -f ../storage/album/$username/${remove[$i]}`;
            `rm -f ../storage/album/$username/thumbnail/${remove[$i]}`;
            
            # update database
            $sth = $dbh->prepare("delete from Album where binary username = '$username' and binary filename = '${remove[$i]}'");
            $sth->execute() or die "Cannot execute: ".$sth->errstr();
        }
    }
}

# find the total page which is the count of image of the user divided by images per page
$sth = $dbh->prepare("select count(*) from Album where binary username = '$username'");
$sth->execute() or die "Cannot execute: ".$sth->errstr();
my @sth_row;
my $img_count = 0;
if (@sth_row = $sth->fetchrow_array()) {
	$img_count = $sth_row[0];
}

{
	# integer operation
	use integer;
	$total_page = $img_count/$img_per_page;
	# ceiling
	if(($img_count % $img_per_page)){
		$total_page++;
	}
}

### do operation ends ###
print_album_head($row, $column, $sort_by, $order);

# find all paths and descriptions of the specified user
my @images_name = ();
my @images_description = ();
my $start = ($page - 1) * ($img_per_page);
my $end = $img_per_page;

$sth = $dbh->prepare("select filename, description from Album where binary username = '$username' order by $sort_by $order limit $start, $end");
$sth->execute() or die "Cannot execute: ".$sth->errstr();
@sth_row;

while(@sth_row = $sth->fetchrow_array()) {
	push(@images_name, $sth_row[0]);
	push(@images_description, $sth_row[1]);
}

my $len = scalar @images_name;
print_album_photos($is_login, $username, $column, $len, @images_name, @images_description);
print_album_tail($is_login, $row, $column, $sort_by, $order, $page, $total_page);

$sth->finish();
$dbh->disconnect();
