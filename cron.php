<?php
// CLI only: do not expose a web-triggered maintenance endpoint.
if(PHP_SAPI!=='cli'){http_response_code(403);exit('CLI only');}
require __DIR__.'/lib.php';
try { process_reminders(); echo "Reminder processing complete: ".date('c').PHP_EOL; } catch(Throwable $e) {fwrite(STDERR,"Reminder processing failed: ".$e->getMessage().PHP_EOL);exit(1);}
