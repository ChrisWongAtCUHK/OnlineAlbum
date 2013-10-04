# generate session key
sub gen_session_key{
	my $username = shift;
	my $key = "";

	if(!$username) {
		return 0;
	}

	for(my $i = 0; $i < length($username); $i++) {
		$key .= substr($username, $i, 1).int(rand() * 10);
	}
    my $now = time;
    $key .= $now;
	return $key;
}

# description conversion
sub description_convert{
	my $description = shift;
	$$description =~ s/&/&amp;/g;
	$$description =~ s/</&lt;/g;
	$$description =~ s/>/&gt;/g;
	$$description =~ s/"/&quot;/g;
	$$description =~ s/'/&#39;/g;

	# $$description =~ s/ /&nbsp;/g;
}

# check the extension of the file if it is jpg, gif or png
sub check_ext{
	my @extensions = (".jpg", ".gif", ".png");
	my $upfile = shift;
	my $correct_ext = 0;
	$_ = $upfile;
	
    # i for case insensitive
	foreach my $i (@extensions){
		if(/^.+$i$/i){
            # check the file name
            if(/^[a-zA-Z0-9_]+$i$/i){
                $correct_ext = $i;
                $correct_ext =~ s/\.//;     # remove .
            } else {
                $correct_ext = "invalid";
            }
			last;
		}
	}
	return $correct_ext;
}

# check identify
sub check_identify{
    my $upfile = shift;
    my $correct_ext = shift;
    my $val = 0;
    my $identify = `identify ./tmp/$upfile`;
    if($identify){
        my @array = split(/ /, $identify );
        my $format = lc $array[1];
        my $dimension = $array[2];
        my @dimension_array = split(/x/, $dimension);
        my $width = $dimension_array[0];
        my $height = $dimension_array[1];
        
        if($format eq "jpeg"){
            $format = "jpg";
        }
       
        if($format ne $correct_ext){
            $val = 0;
        } else {
            if($width > 100 or $height > 100){
                $val = "resize";
            } else {
                $val = $format;
            }
        }
    }
    
    return $val;
    
}

# print login html
sub print_login_html{
    my $login_fail = shift;
	print <<__LOGIN_HTML__;
	<html>
		<head><title>Login Interface</title></head>
		<body style="font-family:verdana, sans-serif;">
			<h2>Login Interface</h2>
            <span style="color:red; font-size:30pt">$login_fail</span>
			<form method="post" action="./login_check.cgi">
				<table cellspacing="5pt" cellpadding="10pt" style="border:1pt solid #7777ff;">
					<tr>
						<td>Username</td>
						<td><input type="text" size=20 name="username"></td>
					</tr>

					<tr>
						<td>Password</td>
						<td><input type="password" size=20 name="passwd"></td>
					</tr>

					<tr>
						<td></td>
						<td><input type="submit" value="Submit"></td>
					</tr>
					
					<tr>
						<td><a href="./album.cgi">View album (read-only)</a></td>
					</tr>
				</table>
			</form>
		</body>
	</html>

__LOGIN_HTML__
}

# print the upload fail message
sub print_upload_fail{
	my $fail_msg = shift;
	print <<__LOGIN_SUCCESS__;
		<html>
			<head><title>File Checking Interface</title></head>
			<body style="font-family:verdana, sans-serif;">
				<h2>File Checking Interface</h2>
				<table cellspacing="5pt" cellpadding="10pt" style="border:1pt solid #7777ff;">
					<tr>
						<td><b>Fail to upload:</b> $fail_msg</td>
					</tr>
					<tr>
						<td><a href="./fpi.cgi">Back to File Picking Interface</a></td>
					</tr>
				</table>
			</body>
		</html>

__LOGIN_SUCCESS__
}

# print the duplication handling interface
sub print_dhi{
	my $upfile = shift;
	my $file_size = shift;
	my $description = shift;
    description_convert(\$description);
print <<__DUPLICATION_HANDLER__;
		<html>
			<head><title>File Checking Interface</title></head>
			<body style="font-family:verdana, sans-serif;">
				<h2>File Checking Interface</h2>
				<form method="post" action="./duplication_handler.cgi">
					<table cellspacing="5pt" cellpadding="10pt" style="border:1pt solid #7777ff;">
						<tr>
							<td><input type="radio" name="duplication" value="overwrite" checked >Overwrite the exisiting file.</td>
						</tr>
						<tr>
							<td><input type="radio" name="duplication" value="rename">Rename the uploading file.</td>
						</tr>
						<tr>
							<td>&nbsp;&nbsp;&nbsp;New filename <input type="text" name="new_filename"></td>
						</tr>
						<tr>
							<td><input type="radio" name="duplication" value="cancel">Cancel the current upload.</td>
						</tr>
						<tr>
							<td>
								<input type="submit" name="process" value="Process">
								<input type="hidden" name="filename" value='$upfile'>
								<input type="hidden" name="file_size" value=$file_size>
								<input type="hidden" name="description" value='$description'>
							</td>
						</tr>
					</table>
				</form>
			</body>
		</html>

__DUPLICATION_HANDLER__
}

# print the display of success upload
sub print_upload_result{
	my $upload_msg = shift;
	my $upfile = shift;
print <<__UPLOAD_RESULT__;
		<html>
			<head><title>File Checking Interface</title></head>
			<body style="font-family:verdana, sans-serif;">
				<h2>File Checking Interface</h2>
				<table cellspacing="5pt" cellpadding="10pt" style="border:1pt solid #7777ff;">
					<tr>
						<td><b>$upload_msg</b> $upfile</td>
					</tr>
					<tr>
						<td><a href="./fpi.cgi">Back to File Picking Interface</a></td>
					</tr>
				</table>
			</body>
		</html>

__UPLOAD_RESULT__
}

# print the head of album display interface
sub print_album_head{
	my $row = shift;
	my $column = shift;
	my $sort_by = shift;
	my $order = shift;
	
	my @sort_by_value = ("filesize", "filename", "timestamp");
	my @sort_by_text = ("File size", "Name", "Upload time");
	
	my @order_value = ("asc", "desc");
	my @order_text = ("Ascending", "Descending");
	
print <<__ALBUM_HEAD1__;
<html>
	<head>
		<title>Ablum Display Interface</title>
		<style>
			.dimension {
				width:30pt;
				height:20pt;
				font-size:10pt;
			}
			
			.sort_by {
				width:100pt;
				height:20pt;
				font-size:10pt;
			}
			
			.order {
				width:100pt;
				height:20pt;
				font-size:10pt;
			}
		</style>
	</head>
	
	<body style="font-family:verdana, sans-serif;">
		<h2>Ablum Display Interface</h2>
		<form method="post" action="./album.cgi">
			<table cellspacing="5pt" cellpadding="10pt" style="border:1pt solid #7777ff;">
				<!-- table of head starts -->
				<tr>
					<td>
						<table width="100%">
							<tr>
								<td>
								</td>
								<td>
									<span style="font-size:15pt;">Sort By</span>
								</td>
								<td>
									<span style="font-size:15pt;">Order</span>
								</td>
							</tr>

							<tr>
								<td>
									<span style="font-size:20pt;">Dimension </span>
									<select name="row" class="dimension">
__ALBUM_HEAD1__

# update the row selected
for(my $i = 1; $i <= 9; $i++){
	if($i == $row){
		print "<option value=$i selected >$i</option>\n";
	}
	else {
		print "<option value=$i>$i</option>\n";
	}
}

print <<__ALBUM_HEAD2__;
									</select>
									X
									<select name="column" class="dimension">
__ALBUM_HEAD2__

# update the column selected
for(my $i = 1; $i <= 9; $i++){
	if($i == $column){
		print "<option value=$i selected >$i</option>\n";
	}
	else {
		print "<option value=$i>$i</option>\n";
	}
}

print <<__ALBUM_HEAD3__;
									</select>
								</td>
								<td>
									<select name="sort_by" class="sort_by">
__ALBUM_HEAD3__

# update the sort by selected
for(my $i = 0; $i < 3; $i++){
	if($sort_by_value[$i] eq $sort_by){
		print "<option value=$sort_by_value[$i] selected >$sort_by_text[$i]</option>\n";
	}
	else {
		print "<option value=$sort_by_value[$i] >$sort_by_text[$i]</option>\n";
	}
}

print <<__ALBUM_HEAD4__;
									</select>
								</td>
								<td>
									<select name="order" class="order">
__ALBUM_HEAD4__

# update the order selected
for(my $i = 0; $i < 2; $i++){
	if($order_value[$i] eq $order){
		print "<option value=$order_value[$i] selected >$order_text[$i]</option>\n";
	}
	else {
		print "<option value=$order_value[$i] >$order_text[$i]</option>\n";
	}
}

print <<__ALBUM_HEAD5__;
									</select>
								</td>
								<td>
									<input type="submit" name="albumBtn" value="Change">
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<!-- table of head ends -->
__ALBUM_HEAD5__
}

# print out the photos in album
sub print_album_photos{
	my $is_login = shift;
	my $username = shift;
	my $column = shift;
	my $len = shift;
	
	# get the names of images
	my @images_name = ();
	for(my $i = 0; $i < $len; $i++){
		push(@images_name, shift);
	}
	
	# get the descriptions of images
	my @images_description = ();
	for(my $i = 0; $i < $len; $i++){
		push(@images_description, shift);
	}
print <<__IMAGE_TABLE_HEAD__;
				<!-- table of images starts -->
				<tr align="center">
					<td align="center">
						<table width="100%">
							<!-- a row of images starts -->
							<tr align="center">
__IMAGE_TABLE_HEAD__

# print the images(thumbnail & image link) row by row
for(my $i = 0; $i < $len; $i++){
print <<__SINGLE_IMG_HEAD__;
								<!-- table of single image starts -->
								<td align="center">
									<table align="center">
										<tr align="center">
											<td align="center">
												<a href="../storage/album/${username}/${images_name[${i}]}" target="_blank" ><img src="../storage/album/${username}/thumbnail/${images_name[${i}]}" title="${images_description[${i}]}" ></a>
											</td>
										</tr>
										
										<tr align="center">
											<td align="center">
__SINGLE_IMG_HEAD__

if($is_login){
	print "<input type=\"checkbox\" name=\"remove\" value=\"${images_name[${i}]}\">${images_name[${i}]}";
} else {
	print "${images_name[${i}]}";
}

print <<__SINGLE_IMG_TAIL__;
											</td>
										</tr>
									</table>
								</td>
								<!-- table of single image ends -->
__SINGLE_IMG_TAIL__

	if(((($i % $column) + 1) == $column) or ($i == ($len - 1))){
		print <<__IMG_ROW_END__;
		</tr>
		<!-- a row of images ends -->
__IMG_ROW_END__
	}
}

print <<__IMAGE_TABLE_TAIL__;
							</tr>
							<!-- a row of images ends -->
						</table>
					</td>
				</tr>
				<!-- table of images ends -->
__IMAGE_TABLE_TAIL__
}

# print the tail of album display interface
sub print_album_tail{
	my $is_login = shift;
	my $row = shift;
	my $column = shift;
	my $sort_by = shift;
	my $order = shift;
	my $page = shift;
	my $total_page = shift;
	
print <<__ALBUM_TAIL1__;
<!-- table of tail starts -->
				<tr align="center">
					<td align="center">
						<table width="100%">
							<tr>
								<td align="left">
__ALBUM_TAIL1__

	if($is_login){
		print "<input type=\"submit\" name=\"albumBtn\" value=\"Remove selected\">";
	}
print <<__ALBUM_TAIL2__;
								</td>
								<td align="right">
									<span>Page </span>
									<select name="page">
__ALBUM_TAIL2__

for(my $i = 1; $i <= $total_page; $i++){
	if($i == $page){
		print "<option value=$i selected>$i</option>\n";
	} else {
		print "<option value=$i>$i</option>\n";
	}
}

print "</select>\n";
print "<span> of $total_page</span>\n";

print <<__ALBUM_TAIL3__;
								</td>
								<td align="center">

__ALBUM_TAIL3__

# Changing the page number must not change the sorting configuration nor the array dimension.
print "<input type=\"hidden\" name=\"row_not_change\" value=$row>\n";
print "<input type=\"hidden\" name=\"column_not_change\" value=$column>\n";
print "<input type=\"hidden\" name=\"sort_by_not_change\" value=${sort_by}>\n";
print "<input type=\"hidden\" name=\"order_not_change\" value=${order}>\n";

print <<__ALBUM_TAIL4__;
									<input type="submit" name="albumBtn" value="Go to page">
								</td>
							</tr>
						</table>
					</td>
				</td>
				<!-- table of tail ends -->
				<tr align="center">
						<td>
							<a href="./display.cgi">Back to Display Panel</a>
						</td>
				</tr>
			</table>
		</form>
	</body>
</html>
__ALBUM_TAIL4__
}
