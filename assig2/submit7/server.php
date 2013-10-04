<?php
	$storage_path	= '../storage/';
	$album_path		= $storage_path.'album/';
	$username 		= 'tywong';
	$path 			= $album_path.$username.'/';
	$thumbnail_path	= $path.'thumbnail/';
	$sqlite_conn	= 'sqlite:../storage/album.db';
	// Check the identify
	function check_identify($filename){
		$array				= array();
		$identify 			= `identify $filename`;
		$identify_arr		= explode(" ", $identify);
		$array["ext"]		= $identify_arr[1];
		if(strcmp($array["ext"], "JPEG") == 0){
			$array["ext"] = "JPG";
		}
		
		$dimension 			= explode("x", $identify_arr[2]);
		
		$array["width"] 	= $dimension[0];
		$array["height"] 	= $dimension[1];
		return $array;
	}

	// Check the extension if it is gif, jpg, png 
	function check_ext($filename){
		$filename_array = explode(".", $filename);
		// case the extension to uppercase for further checking
		$ext			= strtoupper($filename_array[count($filename_array) - 1]);
		if(strcmp($ext, "GIF") != 0 && strcmp($ext, "JPG") != 0 && strcmp($ext, "PNG") != 0)
			$ext = "";
		return $ext;
	}
	

	// Convert the description to verbatim output(appendChild do the conversion automatically, but do this to handle php syntax)
	function description_convert($description){
		$patterns = array();
		$patterns[0] = '/&/';
		$patterns[1] = '/</';
		$patterns[2] = '/>/';
		$patterns[3] = '/"/';
		$patterns[4] = '/\'/';
		$replacements = array();
		$replacements[4] = '&amp;';
		$replacements[3] = '&lt;';
		$replacements[2] = '&gt;';
		$replacements[1] = '&quot;';
		$replacements[0] = '&#39;';
		return preg_replace($patterns, $replacements, $description);
	}
	
	$command = $_SERVER['HTTP_COMMAND'];
	
	
	// Get the file name
	$filename = $_SERVER['HTTP_FILE_NAME'];
	
	switch($command ){
		case "Upload":
			// Get the raw data
			$raw_data = file_get_contents('php://input');
			
			// Decode the result
			$data = base64_decode($raw_data);
			
			// Write the raw data to the temporary folder
			file_put_contents("./tmp/".$filename, $data);
			//file_put_contents("../storage/album/tywong/".$filename, $data);
			$identify = check_identify("./tmp/".$filename);

			$extention = check_ext($filename);
			if($extention){
				if(strcmp($identify["ext"], $extention) == 0){
					
					$timestamp = time();
					$width = $identify["width"];
					$height = $identify["height"];
					
					// Move the image file from temporary folder to the permanent storage, overwrite the old file with same name by default
					`mv ./tmp/$filename ../storage/album/$username/$filename`;
					/* Debug */
					$myFile = "test.txt";
					$fh = fopen($myFile, 'w') or die("can't open file");
					$stringData = "username = $username\nfilename=$filename\n";
					fwrite($fh, $stringData);
					fclose($fh);
					/* Debug */
					
					`convert -resize 100x100 ../storage/album/$username/$filename ../storage/album/$username/thumbnail/$filename`;
					
					// Store the thumbnail information as well
					$thumbnail_identify = check_identify("../storage/album/$username/thumbnail/".$filename);
					$thumbnail_width = $thumbnail_identify["width"];
					$thumbnail_height = $thumbnail_identify["height"];
					$dbh = new PDO($sqlite_conn); // open a sqlite database connection
					
					$query = $dbh->prepare("select * from Album where filename = '$filename';");
					$query->execute(); //execute a prepared statement
					
					$result = $query->fetchAll(PDO::FETCH_ASSOC);
					
					if($result){
						// Update the exist information
						$query = $dbh->prepare("update Album set timestamp = $timestamp, width = $width, height = $height, thumbnail_width = $thumbnail_width, thumbnail_height = $thumbnail_height where filename = '$filename';");
					}else {
						// Insert the information into the database
						$query = $dbh->prepare("insert into Album values('$filename', $timestamp, '$username', '', $width, $height, $thumbnail_width, $thumbnail_height)");
					}
					$query->execute(); //execute a prepared statement

					$query = $dbh->prepare("select * from Album order by timestamp desc;");
					$query->execute(); //execute a prepared statement
					
					echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
					$dbh = null;
					
					// TODO: the following two lines should be deleted?
					`chmod 644 ../storage/album/$username/$filename`;
					`chmod 644 ../storage/album/$username/thumbnail/$filename`;
				} else {
					echo "IF";								// Invalid format.
					`rm ./tmp/$filename`;
				}
			} else {
				echo "IE";									//Extension should be gif, jpg or png.
				`rm ./tmp/$filename`;
			}
			break;
		case "Update":
			$db_arr = array();
			$dbh = new PDO($sqlite_conn); // open a sqlite database connection

			// Insert the information into the database
			$query = $dbh->prepare("select * from Album order by timestamp desc;");
			$query->execute(); //execute a prepared statement

			echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
			$dbh = null; 
			
			break;
		case "Delete":
			
			// Connect the database
			$dbh = new PDO($sqlite_conn); // open a sqlite database connection
			
			// Delete the information from the database
			$query = $dbh->prepare("delete from Album where filename = '$filename'");
			$query->execute(); //execute a prepared statement
			
			$query = $dbh->prepare("select * from Album order by timestamp desc;");
			$query->execute(); //execute a prepared statement
			
			echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
			
			$dbh = null;
			
			// Remove the photo from file system
			`rm ../storage/album/$username/$filename`;
			`rm ../storage/album/$username/thumbnail/$filename`;
			
			break;
		case "Edit":
			// Get and convert the description
			$description = $_SERVER['HTTP_DESCRIPTION'];
			$converted_description = description_convert($description);
			
			// Connect the database
			$dbh = new PDO($sqlite_conn); // open a sqlite database connection
			
			// Update the information in the database

			$query = $dbh->prepare("update Album set description = '$converted_description' where filename = '$filename'");
			$query->execute(); //execute a prepared statement
			
			$query = $dbh->prepare("select * from Album order by timestamp desc;");
			$query->execute(); //execute a prepared statement
			
			echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
			$dbh = null;

			break;
		case "ShowImage";
		
			// Connect the database
			$dbh = new PDO($sqlite_conn); // open a sqlite database connection
			
			$query = $dbh->prepare("select width, height from Album where filename = '$filename';");
			$query->execute(); //execute a prepared statement
			
			echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));
			
			$dbh = null;
			break;
		default:
			break;

	}
?>