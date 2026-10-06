<?php
defined('MOODLE_INTERNAL') || die();

$THEME->name = 'iftcbt';
$THEME->sheets = [];
$THEME->parents = ['boost'];

$THEME->scss = function($theme) {
    return theme_boost_get_main_scss_content($theme);
};

$THEME->extrascsscallback = 'theme_iftcbt_get_extra_scss';

$THEME->rendererfactory = 'theme_overridden_renderer_factory';

$THEME->layouts = [
    'secure' => [
        'file'    => 'secure_exam.php',
        'regions' => [],
        'options' => [
            'nofooter'             => true,
            'nonavbar'             => true,
            'nocourseheaderfooter' => true,
        ],
    ],
    'login' => [
        'file'    => 'login.php',
        'regions' => [],
        'options' => [
            'nofooter' => true,
            'nonavbar' => true,
        ],
    ],
];