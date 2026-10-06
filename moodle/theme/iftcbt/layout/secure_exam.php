<?php
defined('MOODLE_INTERNAL') || die();

// Load our exam lockdown script
$PAGE->requires->js('/theme/iftcbt/javascript/exam_lockdown.js', false);

$bodyattributes = $OUTPUT->body_attributes();

$templatecontext = [
    'output'         => $OUTPUT,
    'bodyattributes' => $bodyattributes,
];

echo $OUTPUT->render_from_template('theme_iftcbt/secure_exam', $templatecontext);