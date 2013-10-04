<?php

	`rm ../storage/assig2.db`;
	`sqlite3 ../storage/album.db < assig2.sql`;

	`rm ../storage/album/tywong/*.gif`;
	`rm ../storage/album/tywong/*.jpg`;
	`rm ../storage/album/tywong/*.png`;
	`rm ../storage/album/tywong/thumbnail/*.gif`;
	`rm ../storage/album/tywong/thumbnail/*.jpg`;
	`rm ../storage/album/tywong/thumbnail/*.png`;

?>