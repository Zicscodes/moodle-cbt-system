<?php
define('CLI_SCRIPT', true);
require('/var/www/html/config.php');
$theme = theme_config::load('iftcbt');
$css = $theme->get_css_content();
echo 'CSS LENGTH: ' . strlen($css) . PHP_EOL;
echo (strpos($css, 'iftcbt-header') !== false) ? 'FOUND IT!' : 'NOT FOUND';
echo PHP_EOL;