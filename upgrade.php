<?php
// Upgrade existing MediCare database without deleting accounts, medication or history.
if (PHP_SAPI !== 'cli') { http_response_code(403); exit('CLI only'); }
require __DIR__.'/lib.php';
try {
 $columns=q('SHOW COLUMNS FROM doses')->fetchAll(); $map=[]; foreach($columns as $col) $map[$col['Field']]=$col;
 if (!isset($map['status'])) throw new RuntimeException('The doses table is not the expected MediCare table. Check config.php and database name.');
 $type=strtolower($map['status']['Type']);
 if (strpos($type,"'skipped'")===false) {
   if ($type!=="enum('pending','taken','missed')") throw new RuntimeException('Unexpected dose status type; no changes made. Ask for help before continuing.');
   db()->exec("ALTER TABLE doses MODIFY COLUMN status ENUM('pending','taken','missed','skipped') NOT NULL DEFAULT 'pending'");
   echo "Added skipped status.\n";
 }
 if (!isset($map['remind_at'])) { db()->exec('ALTER TABLE doses ADD COLUMN remind_at DATETIME NULL AFTER status'); echo "Added snooze field.\n"; }
 echo "Upgrade complete. Existing data was kept.\n";
} catch(Throwable $e) { fwrite(STDERR,"Upgrade failed: ".$e->getMessage()."\nCheck that MySQL is running, the original schema was imported, and config.php has the correct database settings.\n"); exit(1); }
