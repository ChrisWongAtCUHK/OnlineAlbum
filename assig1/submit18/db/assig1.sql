drop table if exists Users;
create table Users (username STRING PRIMARY KEY, password STRING);
insert into Users values ("ChrisWong", "handsome");
insert into Users values ("MingGor", "AOCKING");
insert into Users values ("Cally", "hea");

drop table if exists Sessions;
create table Sessions (username STRING, sessionkey STRING);

drop table if exists Album;
create table Album (filename STRING, filesize INTEGER, timestamp INTEGER, username STRING, description STRING, CONSTRAINT filename_username PRIMARY KEY (filename, username)); 
