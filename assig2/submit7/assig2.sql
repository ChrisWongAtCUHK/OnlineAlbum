drop table if exists Sessions;
create table Sessions (username STRING, sessionkey STRING, CONSTRAINT username_sessionkey PRIMARY KEY(username, sessionkey));

drop table if exists Album;
create table Album (filename STRING COLLATE NOCASE, timestamp INTEGER, username STRING, description VARCHAR(300), width INTEGER, height INTEGER, thumbnail_width INTEGER, thumbnail_height INTEGER, CONSTRAINT filename_username PRIMARY KEY (filename, username)); 
