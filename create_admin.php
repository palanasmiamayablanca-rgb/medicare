<?php
if(PHP_SAPI!=='cli'){http_response_code(403);exit('CLI only');}
require __DIR__.'/lib.php';
if($argc!==3){fwrite(STDERR,"Usage: php create_admin.php 'Admin Name' admin@example.com\nPassword will be requested interactively.\n");exit(1);}
$name=trim($argv[1]); $email=strtolower(trim($argv[2]));
if(!$name || strlen($name)>100 || !filter_var($email,FILTER_VALIDATE_EMAIL) || strlen($email)>190){fwrite(STDERR,"Invalid name or email.\n");exit(1);}
echo "Password (at least 10 characters; visible while typing): "; $password=rtrim(fgets(STDIN),"\r\n");
if(strlen($password)<10){fwrite(STDERR,"Password too short.\n");exit(1);}
try {q('INSERT INTO users(name,email,password_hash,role) VALUES (?,?,?,?)',[$name,$email,password_hash($password,PASSWORD_DEFAULT),'admin']);echo "Admin created.\n";}catch(Throwable $e){fwrite(STDERR,"Could not create admin (check database and whether email already exists).\n");exit(1);}
