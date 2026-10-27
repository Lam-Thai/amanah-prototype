<?php
/**
 * Script metadata WordPress reads for view.js: no dependencies, bust cache on edit.
 *
 * @package Amanah
 */

return array(
	'dependencies' => array(),
	'version'      => (string) filemtime( __DIR__ . '/view.js' ),
);
