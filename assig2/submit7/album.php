<?php
	require("config.php");
?>
<html>
	<head>
		<title>Album</title>
		<meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
		<LINK rel="stylesheet" type="text/css" href="album.css" media="screen">
		<script language="javascript" type="text/javascript" src="album.js">
			
		</script>
	</head>

	<body>
		<script language="javascript" type="text/javascript">
			var username		= "tywong";
			var albumPath 		= "../storage/album/" + username + "/";
			var thumbnailPath 	= albumPath + "thumbnail/";

			
			function appendAlbumTable(){
				if(document.getElementById("centerTag")){
					document.body.removeChild(document.getElementById("centerTag"));
				}
				
				var centerTag  	= document.createElement("center");
				centerTag.id	= "centerTag";
				var albumTable 	= document.createElement("table");
				albumTable.id = "albumTable";
				var albumTr	= document.createElement("tr");
				
				<? 
					$dbh = new PDO('sqlite:../storage/album.db'); // open a sqlite database connection

					// Insert the information into the database
					$query = $dbh->prepare("select * from Album order by timestamp desc;");
					$query->execute(); //execute a prepared statement

					//$result = $query->fetchAll(PDO::FETCH_NUM);
					$photo_count = 0;
					$albumTr = "albumTr";
					echo "console.log(\"".time()."\");\n";
					echo "albumTable.appendChild(albumTr)\n";
					while($result = $query->fetch(PDO::FETCH_ASSOC)){
						echo $albumTr.".appendChild(createTd(\"".$result["filename"]."\", \"".$result["description"]."\", ".$result["thumbnail_width"].", ".$result["thumbnail_height"]."));\n";
						
						$photo_count = $photo_count + 1;
						if((($photo_count) % 4) == 0){
							$albumTr = "albumTr".time();
							echo "var ".$albumTr." = document.createElement(\"tr\");\n";
							echo "albumTable.appendChild(".$albumTr.");\n";
						}
					}

					$dbh = null; 
				?>;
				
				centerTag.appendChild(albumTable);
				document.body.appendChild(centerTag);
				
			}
			
			// Append dropbox
			function appendDropbox(){
				if(document.getElementById("dropbox")){
					document.body.removeChild(document.getElementById("dropbox"));
				}
				
				var dropbox = document.createElement("div");
				dropbox.id = "dropbox";
				dropbox.style.width = "100%";
				dropbox.style.height = "100px";
				dropbox.style.border = "solid 1px";
				dropbox.appendChild(document.createTextNode("Drop file here..."));
				document.body.appendChild(dropbox);
				
				var progressBar = document.createElement("p");
				progressBar.id = "progressBar";
				dropbox.appendChild(progressBar);
				
			}

			// Append background layer
			function appendBackgroundLayer(){
				if(document.getElementById("backgroundLayer")){
					document.body.removeChild(document.getElementById("backgroundLayer"));
				}
				
				var backgroundLayer = document.createElement("div");
				backgroundLayer.id = "backgroundLayer";
				backgroundLayer.style.zIndex = backgroundLayerHiddenZIndex;
				backgroundLayer.style.opacity = backgroundLayerHiddenOpacity;
				document.body.appendChild(backgroundLayer);
				backgroundLayer.addEventListener("click", 
					function(e){
						// Hide the background
						backgroundLayer.style.zIndex = backgroundLayerHiddenZIndex;
						backgroundLayer.style.opacity = backgroundLayerHiddenOpacity;

						// Hide the display layer
						imgDiv.style.opacity = imgDivHiddenOpacity;
						imgDiv.style.zIndex = imgDivHiddenZIndex;
		
						var imgArea = document.getElementById("imgArea");
						imgArea.style.display = "none";

						// Enable mouse wheel
						if(document.addEventListener){ 
							document.onmousewheel = null;
							console.log("Remove the stopWheel");
						}
						// Start reload interval
						isIdle = true;
						isShowingImage = false;
						
						// Show the scroll bar
						document.body.style.overflow = "auto";
					}, 
				false);
				
			}
			// Append the image div
			function appendImgDiv(){
				if(document.getElementById("imgDiv")){
					document.body.removeChild(document.getElementById("imgDiv"));
				}
				
				var imgDiv = document.createElement("div");
				imgDiv.id = "imgDiv";
				document.body.appendChild(imgDiv);
				
				var draggableTable = document.createElement("table");
				draggableTable.id = "draggableTable";
				draggableTable.setAttribute("cellspacing", "0px");

				imgDiv.appendChild(draggableTable);
				// creating all cells
				for (var j = 0; j < 3; j++) {
					// creates a table row
					var row = document.createElement("tr");
				  
					for (var i = 0; i < 3; i++) {
					  // Create a <td> element and a text node
					  var cell = document.createElement("td");
					  cell.id = tdType[j * 3 + i];
					  cell.className = tdClass[j * 3 + i];
					  row.appendChild(cell);
					}
				  
					// add the row to the end of the table body
					draggableTable.appendChild(row);
				}
				
				var imgArea = document.createElement("img");
				imgArea.id = "imgArea";
				imgArea.src = "../storage/pencil.png";
				
				var middle_center = document.getElementById("middle_center");
				middle_center.appendChild(imgArea);
				
			}
			
			function appendUpdteButton(){
				if(document.getElementById("updateButton")){
					document.body.removeChild(document.getElementById("updateButton"));
				}
				
				var updateButton = document.createElement("input");
				updateButton.id = "updateButton";
				updateButton.type = "button";
				updateButton.value = "Turn off update";
				updateButton.addEventListener("click", 
					function(e){
						// Check the mode on or off
						if(updateButton.value == "Turn off update"){
							updateButton.value = "Turn on update";
							isIdle = false;
						} else if (updateButton.value == "Turn on update"){
							updateButton.value = "Turn off update";
							isIdle = true;
						}
					}, 
				false);
				
				document.body.appendChild(updateButton);
			}
			
			// Initialize
			function init(){
				appendBackgroundLayer();
				appendImgDiv();
				appendAlbumTable();
				appendDropbox();
				appendUpdteButton();
				imgDiv = document.getElementById("imgDiv");
				eventInit();
			}
			
			window.addEventListener("load", init, true);
			setInterval(function(){
				if(isIdle){
					sendUpdateRequest();
					if(shouldUpdate){
						updateAlbumTable();
					}
					
				}
			}, 5000); // Call function() every 5 seconds

		</script>
	</body>
</html>