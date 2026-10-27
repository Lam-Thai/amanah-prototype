<?php
/**
 * Small helpers shared by block render files.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

/**
 * Full URL for a site path ("/contact/#tour"). Absolute URLs, anchors and tel:/mailto: pass through.
 * Site paths must go through home_url(): the Playground demo serves WordPress under a sub-path.
 */
function amanah_url( $path ) {
	$path = (string) $path;
	if ( '' === $path || preg_match( '#^(https?:|tel:|mailto:|\#)#', $path ) ) {
		return $path;
	}
	return home_url( '/' . ltrim( $path, '/' ) );
}

/** URL of a file in the theme's assets/ folder. */
function amanah_asset( $path ) {
	return get_theme_file_uri( 'assets/' . ltrim( (string) $path, '/' ) );
}

/** Headline text with a small set of inline tags allowed (emphasis, line breaks, verify marks). */
function amanah_inline( $html ) {
	return wp_kses(
		(string) $html,
		array(
			'em'     => array(),
			'b'      => array(),
			'strong' => array(),
			'br'     => array(),
			'small'  => array(),
			'span'   => array( 'class' => true ),
			'mark'   => array( 'class' => true ),
			'a'      => array( 'href' => true ),
		)
	);
}

/** Inline SVG icon from the sample's icon set. Returns markup safe to echo. */
function amanah_icon( $name, $class = 'icon' ) {
	$paths = array(
		'arrow'  => '<path d="M5 12h14M13 6l6 6-6 6"/>',
		'back'   => '<path d="M19 12H5M11 6l-6 6 6 6"/>',
		'check'  => '<path d="M20 6 9 17l-5-5"/>',
		'plus'   => '<path d="M12 5v14M5 12h14"/>',
		'minus'  => '<path d="M5 12h14"/>',
		'menu'   => '<path d="M4 8h16M4 16h16"/>',
		'lock'   => '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
		'shield' => '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
		'server' => '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
		'office' => '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"/>',
		'phone'  => '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
	);
	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}
	return '<svg class="' . esc_attr( $class ) . '" viewBox="0 0 24 24" aria-hidden="true">' . $paths[ $name ] . '</svg>';
}
