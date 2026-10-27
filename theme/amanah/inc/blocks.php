<?php
/**
 * Registers every custom block in blocks/<name>/block.json as amanah/<name>.
 * Adding a block = adding a folder; nothing to edit here.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'init',
	function () {
		foreach ( glob( get_theme_file_path( 'blocks/*/block.json' ) ) as $metadata ) {
			register_block_type( dirname( $metadata ) );
		}
	}
);
