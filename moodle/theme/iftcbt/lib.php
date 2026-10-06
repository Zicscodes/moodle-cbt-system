<?php
defined('MOODLE_INTERNAL') || die();

function theme_iftcbt_get_extra_scss($theme) {
    $filename = dirname(__FILE__) . '/scss/post.scss';
    return file_get_contents($filename);
}