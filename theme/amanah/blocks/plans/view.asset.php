<?php
/**
 * Script metadata WordPress reads for view.js: run after the 3D rack library, bust cache on edit.
 *
 * @package Amanah
 */

return array(
	'dependencies' => array( 'amanah-rack3d' ),
	'version'      => (string) filemtime( __DIR__ . '/view.js' ),
);
