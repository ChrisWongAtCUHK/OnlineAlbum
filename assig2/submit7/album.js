// Files
var filename = "";
var username		= "tywong";
var albumPath 		= "../storage/album/" + username + "/";
var thumbnailPath 	= albumPath + "thumbnail/";

var pencilFilename	= "../storage/pencil.png";
var XFilename	= "../storage/X.png";
var databaseObj 		= null;
var shouldUpdate		= false;
var databaseStr 		= "";

// Cell image, edit button, delete button
var imageNodeIndex		= 0;
var editNodeIndex		= 1;
var deleteXNodeIndex	= 2;

// Background layer
var backgroundLayerHiddenZIndex = -2;
var backgroundLayerDisplayZIndex = 4;
var backgroundLayerHiddenOpacity = 0;
var backgroundLayerDisplayOpacity = 0.7;

// boolean to check if the reload should be implemented or not
var isIdle = true;
// Additional boolean to handle mouseout of cell
var isShowingImage = false;

// imgDiv
var imgDiv = null;

var imgDivHiddenZIndex = -1;
var imgDivDisplayZIndex = 5;

var imgDivHiddenOpacity = 0;
var imgDivDisplayOpacity = 1;

// Should be loaded from the database
var imgDiv_WIDTH = 1024;
var imgDiv_HEIGHT = 768;
var diffX = 0;
var diffY = 0;
var padding	= 10;

// Resize
var tdType = ["top_left", "top_center", "top_right", "middle_left", "middle_center", "middle_right", "bottom_left", "bottom_center", "bottom_right"];
var tdClass = ["top left", "top center", "top right", "middle left", "middle center", "middle right", "bottom left", "bottom center", "bottom right"];
// Instanize a XMLHttpRequest
function new_request(){
	var _factories = [
		function () { return new XMLHttpRequest(); },
		function () { return new ActiveXObject("Msxml2.XMLHTTP"); },
		function () { return new ActiveXObject("Microsoft.XMLHTTP"); }
	];

	for(var i = 0; i < _factories.length; i++){
		try {
			var factory = _factories[i];
			var r = factory();
			if(r != null){
				return r;
			}
		}
		catch(e) {
			continue;
		}
	}

	return null;
}
	
// File upload handler
function handleReaderLoadEnd(e) {
	var data = e.target.result.split(',')[1];
	
	var xhr = new new_request();

	// Progress bar handler
	xhr.upload.addEventListener("progress", function(e){
		var percent = e.loaded	/ e.total * 100;
		console.log("Upload: "+ percent);
		console.log("Upload(int): "+ parseInt(percent));
		/* update your progress bar */
		var progressBar = document.getElementById("progressBar");
		progressBar.style.width	= new String(parseInt(percent)) + "%";
		
	}, false);
	
	xhr.open('POST', 'server.php', true);
	xhr.setRequestHeader('COMMAND', 'Upload');
	xhr.setRequestHeader('FILE_NAME', filename);
	xhr.send(data);
	console.log(filename + " is uploading");

	xhr.onreadystatechange = function () {
		if(xhr.readyState == 4){
			if(xhr.status != 200)
				alert("Error code = " + new String(xhr.status));
			else{
				// "IF" represent invalid format
				if(xhr.responseText == "IF"){
					alert("Invalid formatdddd.");
				// "IE" represent invalid extension

				} else if(xhr.responseText == "IE"){
					alert("Extension should be gif, jpg or png.");
				} else {
					alert(filename + " uploaded.");
					// Get the return object and pares as JSON
					databaseObj = JSON.parse(xhr.responseText);
					
					// Update immediately
					updateAlbumTable();
				}
				
				// Reset the progress bar
				var progressBar = document.getElementById("progressBar");
				progressBar.style.width	= "0%";
			}
		}
	};
}
	
// Initialize event handler for dropbox	
function eventInit(){

	var dropbox = document.getElementById("dropbox");
	dropbox.addEventListener("dragenter", function(e){
			e.stopPropagation();
			e.preventDefault();
		}
	 , false);
	dropbox.addEventListener("dragover", function(e){
			e.stopPropagation();
			e.preventDefault();
		}
	, false);
	dropbox.addEventListener("drop", function(e){
		e.stopPropagation();
		e.preventDefault();

		var file = e.dataTransfer.files[0];
		filename = file.name;
		var reader = new FileReader();
		// init the reader event handlers
		reader.onloadend = handleReaderLoadEnd;

		reader.readAsDataURL(file);
	   }
	, false);
}




// Create a cell to display image, edit button and delete button
function createTd(filename, description, thumbnailWidth, thumbnailHeight){
	var albumTd = document.createElement("td");
	albumTd.style.width = "100px";
	albumTd.style.height = "100px";
	var cell	= document.createElement("div");
	cell.className	= "cell";
	cell.imageFilename	= filename;
	cell.style.width	=  new String(thumbnailWidth) + "px";
	cell.style.height	=  new String(thumbnailHeight) + "px";
	
	var image	= document.createElement("div");
	image.id	= "image";

	var photo 	= document.createElement("img");
	photo.className	= "photo";
	photo.src	= thumbnailPath + filename;
	
	// appendChild do the conversion automatically
	var replace1 = description.replace(/&amp;/g, '&');
	var replace2 = replace1.replace(/&lt;/g, '<');
	var replace3 = replace2.replace(/&gt;/g, '>');
	var replace4 = replace3.replace(/&quot;/g, '"');
	var replace5 = replace4.replace(/&#39;/g, '\'');

	photo.title	= new String(replace5);
	image.appendChild(photo);
	cell.appendChild(image);
	
	var edit	= document.createElement("div");
	edit.id		= "edit";
	edit.imageFilename	= filename;
	var pencil 	= document.createElement("img");
	pencil.src	= pencilFilename;

	edit.appendChild(pencil);
	editImage(edit);
	cell.appendChild(edit);
	
	var deleteX	= document.createElement("div");
	deleteX.id	= "deleteX";
	deleteX.imageFilename	= filename;
	var Ximage 	= document.createElement("img");
	Ximage.src	= XFilename;

	deleteX.appendChild(Ximage);
	deleteImage(deleteX);
	cell.appendChild(deleteX);

	cell.addEventListener('mouseover', 
		function(){
			// Display edit button and delete button
			var childNodes = cell.childNodes;
			
			var edit 	= childNodes[editNodeIndex];
			var deleteX = childNodes[deleteXNodeIndex];
			
			edit.style.display = "inline";
			deleteX.style.display = "inline";
			
			// Stop reload interval
			isIdle = false;
		}, 
	false);
	
	cell.addEventListener('mouseout', 
		function(){
			// Hide edit button and delete button
			var childNodes = cell.childNodes;
			
			var edit 	= childNodes[editNodeIndex];
			var deleteX = childNodes[deleteXNodeIndex];

			edit.style.display = "none";
			deleteX.style.display = "none";
			
			// Start reload interval
			if(!isShowingImage)
				isIdle = true;

		}, 
	false);
	
	showImage(cell);
	
	albumTd.appendChild(cell);
	return albumTd;
}

// Update the album with respect to database object
function updateAlbumTable(){

	if(databaseObj){
		var albumTable = document.getElementById("albumTable");
		if(albumTable){
			// Clear album table
			albumTable.innerHTML = '';
			var tdPerRow = 4;
			var rowTotal = databaseObj.length/tdPerRow;

			for(var i = 0; i < rowTotal; i++){

				var albumTr	= document.createElement("tr");
				albumTable.appendChild(albumTr);
				for(var j = 0; j < tdPerRow; j++){

					// Break if all photos are loaded
					if((i * tdPerRow + j) >= databaseObj.length)
						break;
					var description = databaseObj[i * tdPerRow + j].description;

					if(description == ""){
						description = "";
					}
					
					albumTr.appendChild(createTd(databaseObj[i * tdPerRow + j].filename, description, databaseObj[i * tdPerRow + j].thumbnail_width, databaseObj[i * tdPerRow + j].thumbnail_height));
					
				}
			}
		}
	}else{
		console.log(new Date());
	}
}

// Send the request for update
function sendUpdateRequest(){
	var xhr = new new_request();

	xhr.open('POST', 'server.php', true);
	xhr.setRequestHeader('COMMAND', 'Update');

	xhr.send(null);
	xhr.onreadystatechange = function () {
		if(xhr.readyState == 4){
			if(xhr.status != 200)
				alert("Error code = " + new String(xhr.status));
			else{
				
				// Get the return object and pares as JSON
				if(xhr.responseText != databaseStr){
					databaseStr = xhr.responseText;
					databaseObj = JSON.parse(xhr.responseText);
					shouldUpdate =  true;
				} else {
					shouldUpdate =  false;
				}
			}
		}
	};

}

// Get the filename of image with given url 
function getImageFilename(url){
	var strings=url.split("/");
	return strings[strings.length-1];
}
			
// Function to delete image
function deleteImage(deleteX){
	var imageFilename = deleteX.imageFilename;
	deleteX.addEventListener("click", function(e){
		
		// Stop reload interval
		isIdle = false;
		
		var deleteConfirm = confirm("Delete " + imageFilename + "?");
		
		// Start reload interval
		isIdle = true;
		
		if(deleteConfirm == true){
			e.stopPropagation();
			e.preventDefault();

			var deleteRequest = new_request();
			deleteRequest.open("GET", "server.php", true);
			deleteRequest.setRequestHeader('COMMAND', "Delete");
			deleteRequest.setRequestHeader('FILE_NAME', imageFilename);
			deleteRequest.send(null);

			deleteRequest.onreadystatechange = function () {
				if(deleteRequest.readyState == 4)
				{
					if(deleteRequest.status != 200)
						alert("Error code = " + new String(deleteRequest.status));
					else
					{
						// Get the return object and pares as JSON
						databaseObj = JSON.parse(deleteRequest.responseText);
						
						updateAlbumTable();
						console.log(databaseObj[0]);
						console.log("Delete complete");
					}
				}
			};
		} else {
			
		}
	}
	, false);
}

// Function to edit image
function editImage(edit){
	var imageFilename = edit.imageFilename;
	edit.addEventListener("click", function(e){
		e.stopPropagation();
		e.preventDefault();
		
		// Stop reload interval
		isIdle = false;

		var description = new String();
		
		// Check the prompt length
		while(description = prompt("Edit: " + imageFilename), description.length > 50){}
		
		// Start reload interval
		isIdle = true;

		var editRequest = new_request();
		editRequest.open("POST", "server.php", true);
		editRequest.setRequestHeader('COMMAND', "Edit");
		editRequest.setRequestHeader('FILE_NAME', imageFilename);

		editRequest.setRequestHeader('DESCRIPTION', description);
		editRequest.send(null);
		
		editRequest.onreadystatechange = function () {
			if(editRequest.readyState == 4){
				if(editRequest.status != 200)
					alert("Error code = " + new String(editRequest.status));
				else{
					// Get the return object and pares as JSON
					databaseObj = JSON.parse(editRequest.responseText);

					updateAlbumTable();
				}
			}
		};
		
	}
	, false);
}

// For drag and drop the image
function upHandler(e){
	e.preventDefault();
	e.stopPropagation();

	window.removeEventListener("mouseup", upHandler, false);
	window.removeEventListener("mousemove", moveHandler, false);
	console.log("upHandler");
	imgDiv.style.cursor = "";

}

// For drag and drop the image
function moveHandler(e){
	e.preventDefault();
	e.stopPropagation();

	var trueX 			= e.clientX - diffX;
	var trueY 			= e.clientY - diffY;
	var left_bound		= 0 - padding + window.pageXOffset;
	var top_bound		= 0 - padding + window.pageYOffset;
	var right_bound 	= window.innerWidth + padding + window.pageXOffset;
	var bottom_bound 	= window.innerHeight + padding + window.pageYOffset;
	var divW 			= parseInt(imgDiv.style.width.replace("px", ""));
	var divH			= parseInt(imgDiv.style.height.replace("px", ""));
	
	if(trueX < left_bound){
		imgDiv.style.left = new String(left_bound) + "px";
		diffX = e.clientX - imgDiv.offsetLeft;
	} else if((trueX + divW + 2) > right_bound){
		imgDiv.style.left = new String(right_bound - divW - 2) + "px";
		diffX = e.clientX - imgDiv.offsetLeft;
	} else {
		imgDiv.style.left = new String(trueX) + "px";
	}
	
	if(trueY < top_bound){
		imgDiv.style.top = new String(top_bound) + "px";
		diffY = e.clientY - imgDiv.offsetTop;
	} else if((trueY + divH + 2) > bottom_bound){
		imgDiv.style.top = new String(bottom_bound - divH - 2) + "px";
		diffY = e.clientY - imgDiv.offsetTop;
	} else {
		imgDiv.style.top = new String(e.clientY - diffY) + "px";
	}
	

}

// For drag and drop the image
function downHandler(e){
	e.preventDefault();
	e.stopPropagation();

	diffX = e.clientX - imgDiv.offsetLeft;
	diffY = e.clientY - imgDiv.offsetTop;

	window.addEventListener("mouseup", upHandler, false);
	window.addEventListener("mousemove", moveHandler, false);
	imgDiv.style.cursor = "move";

}

// startX1 is the leftmost of imgDiv 
// startX2 is the rightmost of imgDiv 
// startY1 is the top of imgDiv 
// startY2 is the bottom of imgDiv 
function resizeMousedownHandler(e){
	e.stopPropagation();
	e.preventDefault();
	document.body.style.overflow = "hidden";
	switch (e.srcElement.id){
		
		// n-resize
		case tdType[1]:
			startY1 = e.clientY;
			startY2 = e.clientY + parseInt(imgDiv.style.height.split("px")[0]);
			resizeType = tdType[1];
			document.getElementsByTagName("body")[0].style.cursor = "n-resize";
			break;
		
		// e-resize
		case tdType[5]:
			startX1 = e.clientX - parseInt(imgDiv.style.width.split("px")[0]);
			startX2 = e.clientX;
			
			resizeType = tdType[5];
			document.getElementsByTagName("body")[0].style.cursor = "e-resize";
			break;
			
		// s-resize
		case  tdType[7]:
			startY1 = e.clientY - parseInt(imgDiv.style.height.split("px")[0]);
			startY2 = e.clientY;
			
			resizeType = tdType[7];
			document.getElementsByTagName("body")[0].style.cursor = "s-resize";
			break;
			
		// w-resize
		case  tdType[3]:
			startX1 = e.clientX;
			startX2 = e.clientX + parseInt(imgDiv.style.width.split("px")[0]);
			
			resizeType = tdType[3];
			document.getElementsByTagName("body")[0].style.cursor = "w-resize";
			break;
			
		// ne-resize
		case tdType[2]:
			startX1 = e.clientX - parseInt(imgDiv.style.width.split("px")[0]);
			startX2 = e.clientX;
			startY1 = e.clientY;
			startY2 = e.clientY + parseInt(imgDiv.style.height.split("px")[0]);
			
			resizeType = tdType[2];
			document.getElementsByTagName("body")[0].style.cursor = "ne-resize";
			break;
			
		// se-resize
		case tdType[8]:
			startX1 = e.clientX - parseInt(imgDiv.style.width.split("px")[0]);
			startX2 = e.clientX;
			startY1 = e.clientY - parseInt(imgDiv.style.height.split("px")[0]);
			startY2 = e.clientY;
			
			resizeType = tdType[8];
			document.getElementsByTagName("body")[0].style.cursor = "se-resize";
			break;
			
		// sw-resize
		case tdType[6]:
			startX1 = e.clientX;
			startX2 = e.clientX + parseInt(imgDiv.style.width.split("px")[0]);
			startY1 = e.clientY - parseInt(imgDiv.style.height.split("px")[0]);
			startY2 = e.clientY;
			
			resizeType = tdType[6];
			document.getElementsByTagName("body")[0].style.cursor = "sw-resize";
			break;
			
		// nw-resize
		case tdType[0]:
			startX1 = e.clientX;
			startX2 = e.clientX + parseInt(imgDiv.style.width.split("px")[0]);
			
			startY1 = e.clientY;
			startY2 = e.clientY + parseInt(imgDiv.style.height.split("px")[0]);
			
			resizeType = tdType[0];
			document.getElementsByTagName("body")[0].style.cursor = "nw-resize";
			break;
				
		default:
			break;
	}
	window.addEventListener("mouseup", resizeMouseupEventHandler, false);
	window.addEventListener("mousemove", resizeMousemoveEventHandler, false);
	
}

function resizeMousemoveEventHandler(e) {
	if(resizeType){
		
		e.stopPropagation();
		e.preventDefault();
		var left_bound		= 0 - padding;
		var top_bound		= 0 - padding;
		var right_bound 	= window.innerWidth + padding;
		var bottom_bound 	= window.innerHeight + padding;
	
		var imgArea = document.getElementById("imgArea");
		switch (resizeType){
			// n-resize
			case tdType[1]:
				var newHeight = startY2 - e.clientY;
				if(newHeight >= 0 && e.clientY >= top_bound && e.clientY <= window.innerHeight && imgDiv){
					imgDiv.style.top = e.clientY;
					imgDiv.style.height = new String(newHeight + padding * 2) + "px";

					if(newHeight <= 0)
						newHeight = 0;
					imgArea.style.height = new String(newHeight)+"px";

				} else if(e.clientY <= top_bound && imgDiv){
					imgDiv.style.top = top_bound;
					imgDiv.style.height = startY2;
				}
				break;
			// e-resize
			case tdType[5]:
				var newWidth =  e.clientX - startX1;
				if(newWidth >= 0 && e.clientX >= 0 && e.clientX <= window.innerWidth && imgDiv){
					imgDiv.style.width = new String(newWidth) + "px";
					imgArea.style.width = new String(newWidth - padding * 2)+"px";

				} else if(e.clientX >= window.innerWidth && imgDiv){
					imgDiv.style.width	= new String(window.innerWidth - startX1) + "px";
					imgArea.style.width = new String(window.innerWidth - startX1 - padding * 2 + 2)+"px";
				}
				break;
				
			// s-resize
			case tdType[7]:
				var newHeight = e.clientY - startY1;
				
				if(newHeight >= 0 && e.clientY >= 0 && e.clientY <= window.innerHeight && imgDiv){
					imgDiv.style.height = new String(newHeight + padding) + "px";
					
					if(newHeight <= 0)
						newHeight = 0;
					imgArea.style.height = new String(newHeight)+"px";

				} else if(e.clientY > window.innerHeight && imgDiv){
					imgDiv.style.height = new String(window.innerHeight - startY1) + "px";
					imgArea.style.height = new String(window.innerHeight - startY1 - padding)+"px";
				}
				break;
				
			// w-resize
			case  tdType[3]:
				var newWidth =  startX2 - e.clientX;
				if(newWidth >= 0 && e.clientX >= 0 && e.clientX <= window.innerWidth && imgDiv){
					imgDiv.style.left = e.clientX;
					imgDiv.style.width = new String(newWidth) + "px";
					imgArea.style.width = new String(newWidth - padding * 2)+"px";
				} else if (e.clientX < 0){
					imgDiv.style.left = 0 - padding;
					imgDiv.style.width	= new String(startX2) + "px";
					imgArea.style.width = new String(startX2 - padding * 2)+"px";
				}
				break;
				
			// ne-resize
			case tdType[2]:
				var newWidth =  e.clientX - startX1;
				if(newWidth >= 0 && e.clientX >= 0 && e.clientX <= window.innerWidth && imgDiv){
					imgDiv.style.width = new String(newWidth) + "px";
					imgArea.style.width = new String(newWidth - padding * 2)+"px";

				} else if(e.clientX >= window.innerWidth && imgDiv){
					imgDiv.style.width	= new String(window.innerWidth - startX1) + "px";
					imgArea.style.width = new String(window.innerWidth - startX1 - padding * 2)+"px";
				}
				
				var newHeight = startY2 - e.clientY;
				if(newHeight >= 0 && e.clientY >= top_bound && e.clientY <= window.innerHeight && imgDiv){
					imgDiv.style.top = e.clientY;
					imgDiv.style.height = new String(newHeight + padding * 2) + "px";

					if(newHeight <= 0)
						newHeight = 0;
					imgArea.style.height = new String(newHeight)+"px";

				} else if(e.clientY <= top_bound && imgDiv){
					imgDiv.style.top = top_bound;
					imgDiv.style.height = startY2;
				}
				break;
				
			// se-resize
			case tdType[8]:
				var newWidth =  e.clientX - startX1;
				if(newWidth >= 0 && e.clientX >= 0 && e.clientX <= window.innerWidth && imgDiv){
					imgDiv.style.width = new String(newWidth) + "px";
					imgArea.style.width = new String(newWidth - padding * 2)+"px";

				} else if(e.clientX >= window.innerWidth && imgDiv){
					imgDiv.style.width	= new String(window.innerWidth - startX1) + "px";
					imgArea.style.width = new String(window.innerWidth - startX1 - padding * 2)+"px";
				}
				
				var newHeight = e.clientY - startY1;
				if(newHeight >= 0 && e.clientY >= 0 && e.clientY <= window.innerHeight && imgDiv){
					imgDiv.style.height = new String(newHeight + padding) + "px";

					if(newHeight <= 0)
						newHeight = 0;
					imgArea.style.height = new String(newHeight)+"px";

				} else if(e.clientY > window.innerHeight && imgDiv){
					imgDiv.style.height = new String(window.innerHeight - startY1) + "px";
					imgArea.style.height = new String(window.innerHeight - startY1 - padding)+"px";
				}
				
				break;
				
			// sw-resize
			case tdType[6]:
				var newWidth =  startX2 - e.clientX;
				if(newWidth >= 0 && e.clientX >= 0 && e.clientX <= window.innerWidth && imgDiv){
					imgDiv.style.left = e.clientX;
					imgDiv.style.width = new String(newWidth) + "px";
					imgArea.style.width = new String(newWidth - padding * 2)+"px";
				} else if (e.clientX < 0){
					imgDiv.style.left = 0 - padding;
					imgDiv.style.width	= new String(startX2) + "px";
					imgArea.style.width = new String(startX2 - padding * 2)+"px";
				}
				
				var newHeight = e.clientY - startY1;
				if(newHeight >= 0 && e.clientY >= 0 && e.clientY <= window.innerHeight && imgDiv){
					imgDiv.style.height = new String(newHeight + padding) + "px";

					if(newHeight <= 0)
						newHeight = 0;
					imgArea.style.height = new String(newHeight)+"px";

				} else if(e.clientY > window.innerHeight && imgDiv){
					imgDiv.style.height = new String(window.innerHeight - startY1) + "px";
					imgArea.style.height = new String(window.innerHeight - startY1 - padding)+"px";
				}
				break;
				
			// nw-resize
			case tdType[0]:
				var newWidth =  startX2 - e.clientX;
				if(newWidth >= 0 && e.clientX >= 0 && e.clientX <= window.innerWidth && imgDiv){
					imgDiv.style.left = e.clientX;
					imgDiv.style.width = new String(newWidth) + "px";
					imgArea.style.width = new String(newWidth - padding * 2)+"px";
				} else if (e.clientX < 0){
					imgDiv.style.left = 0 - padding;
					imgDiv.style.width	= new String(startX2) + "px";
					imgArea.style.width = new String(startX2 - padding * 2)+"px";
				}
				
				var newHeight = startY2 - e.clientY;
				if(newHeight >= 0 && e.clientY >= top_bound && e.clientY <= window.innerHeight && imgDiv){
					imgDiv.style.top = e.clientY;
					imgDiv.style.height = new String(newHeight + padding * 2) + "px";

					if(newHeight <= 0)
						newHeight = 0;
					imgArea.style.height = new String(newHeight)+"px";

				} else if(e.clientY <= top_bound && imgDiv){
					imgDiv.style.top = top_bound;
					imgDiv.style.height = startY2;
				}
				break;
				
			default:
				break;
		}
	}
}

function resizeMouseupEventHandler(e){
	if(resizeType){
		e.preventDefault();
		e.stopPropagation();
		window.removeEventListener("mouseup", resizeMouseupEventHandler, false);
		window.removeEventListener("mousemove", resizeMousemoveEventHandler, false);
		resizeType = null;
		document.getElementsByTagName("body")[0].style.cursor = "";
	}
}

// Function to show image
function showImage(cell){
	var imageFilename = cell.imageFilename;
	
	cell.addEventListener("click", function(e){
		e.stopPropagation();
		e.preventDefault();

		// Hidden the scroll bar
		document.body.style.overflow = "hidden";
		
		// Call function to disable mouse wheel
		document.onmousewheel = function(){ stopWheel(); }; 
				
		// Stop reload interval
		isIdle = false;
		isShowingImage = true;
		
		// Show the background layer
		var backgroundLayer = document.getElementById("backgroundLayer");

		backgroundLayer.style.left = window.pageXOffset;
		backgroundLayer.style.top = window.pageYOffset;
		backgroundLayer.style.zIndex = backgroundLayerDisplayZIndex;
		backgroundLayer.style.opacity = backgroundLayerDisplayOpacity;
		
		// Send request to server
		var showImageRequest = new_request();
		showImageRequest.open("POST", "server.php", true);
		showImageRequest.setRequestHeader('COMMAND', "ShowImage");
		showImageRequest.setRequestHeader('FILE_NAME', imageFilename);
		showImageRequest.send(null);
		
		showImageRequest.onreadystatechange = function () {
			if(showImageRequest.readyState == 4){
				if(showImageRequest.status != 200)
					console.log("Error code = " + new String(showImageRequest.status));
				else{
					// Get the return object and pares as JSON
					var dimensionObj = JSON.parse(showImageRequest.responseText);

					imgDiv_WIDTH = dimensionObj[0].width;
					imgDiv_HEIGHT = dimensionObj[0].height;
					console.log("imgDiv_WIDTH="+imgDiv_WIDTH);
					console.log("imgDiv_HEIGHT="+imgDiv_HEIGHT);
					
					var ratio = 1.0;
					var width_ratio = 1.0;
					var height_ratio = 1.0;
					
					// Check the dimension of the image
					if(parseInt(imgDiv_WIDTH) >= (innerWidth * 0.7)){
						width_ratio = (innerWidth * 0.7) / imgDiv_WIDTH;
					} 
					
					if(parseInt(imgDiv_HEIGHT) >= (innerHeight * 0.7)){ 
						height_ratio = (innerHeight * 0.7) / imgDiv_HEIGHT;
					}
					
					if(width_ratio < height_ratio) {
						ratio = width_ratio;
					} else if (width_ratio > height_ratio) {
						ratio = height_ratio;
					}
					
					imgDiv_WIDTH = imgDiv_WIDTH * ratio;
					imgDiv_HEIGHT = imgDiv_HEIGHT * ratio;

					// Set the dimension of imgDiv
					imgDiv.style.width = new String(imgDiv_WIDTH + padding * 2) + "px";
					imgDiv.style.height = new String(imgDiv_HEIGHT + padding) + "px";
					
					// Show the display layer
					imgDiv.style.opacity = imgDivDisplayOpacity;
					imgDiv.style.zIndex = imgDivDisplayZIndex;
					
					// Set the dimension of imgArea
					var imgArea = document.getElementById("imgArea");
					imgArea.style.width = new String(imgDiv_WIDTH)+"px";
					imgArea.style.height = new String(imgDiv_HEIGHT)+"px";
					
					// Show imgArea
					imgArea.src = albumPath + imageFilename;
					imgArea.style.display = "inline";
					
					// Set the position of the imgDiv to center
					imgDiv.style.left	= new String((window.innerWidth + window.pageXOffset - imgDiv_WIDTH)/ 2) + "px";
					imgDiv.style.top	= new String((window.innerHeight + window.pageYOffset - imgDiv_HEIGHT)/ 2) + "px";
					
					// Drag and drop 
					imgDiv.addEventListener("mousedown", downHandler, false);
					
					// Resize
					for(var i = 0; i < 4; i++)
						document.getElementById(tdType[i]).addEventListener("mousedown", resizeMousedownHandler, false);
					for(var i = 5; i < tdType.length; i++)
						document.getElementById(tdType[i]).addEventListener("mousedown", resizeMousedownHandler, false);
				}
			}
		};
		

		
	}, false);
	
}

// Disable mouse wheel
function stopWheel(e){
	if(!e){ e = window.event; }
	if(e.preventDefault) { 
		e.preventDefault(); 
	} 
}
