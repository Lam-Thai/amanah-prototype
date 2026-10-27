<?php
/**
 * Theme supports, menus, block styles and head clean-up.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'after_setup_theme',
	function () {
		add_theme_support( 'editor-styles' );
		add_theme_support( 'post-thumbnails' );
		add_editor_style( array( 'assets/css/site.css', 'assets/css/editor.css' ) );
		register_nav_menus(
			array(
				'primary' => __( 'Header navigation', 'amanah' ),
			)
		);
	}
);

// The design system's buttons, offered as styles on the core Button block.
add_action(
	'init',
	function () {
		$styles = array(
			'red'   => __( 'Red (primary)', 'amanah' ),
			'ghost' => __( 'Ghost (on dark)', 'amanah' ),
			'ink'   => __( 'Ink (on paper)', 'amanah' ),
			'line'  => __( 'Outline (on paper)', 'amanah' ),
			'ai'    => __( 'AI gradient', 'amanah' ),
		);
		foreach ( $styles as $slug => $label ) {
			register_block_style( 'core/button', array( 'name' => $slug, 'label' => $label ) );
		}
	}
);

add_filter(
	'block_categories_all',
	function ( $categories ) {
		array_unshift( $categories, array( 'slug' => 'amanah', 'title' => __( 'Amanah', 'amanah' ) ) );
		return $categories;
	}
);

// Leaner front end: no emoji polyfill, no oEmbed discovery.
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );

add_action(
	'wp_head',
	function () {
		echo '<meta name="theme-color" content="#171210">' . "\n";

		// Meta description: the page/post excerpt (set in each seed file's header), else the tagline.
		$desc = '';
		if ( is_singular() ) {
			$desc = get_the_excerpt( get_queried_object_id() );
		} elseif ( is_home() && get_option( 'page_for_posts' ) ) {
			$desc = get_the_excerpt( (int) get_option( 'page_for_posts' ) );
		}
		$desc = $desc ? $desc : get_bloginfo( 'description' );
		printf( '<meta name="description" content="%s">' . "\n", esc_attr( wp_strip_all_tags( $desc ) ) );
	},
	1
);

// A linked featured image repeats the title link next to it: hide it from keyboard and screen readers.
add_filter(
	'render_block_core/post-featured-image',
	function ( $html, $block ) {
		if ( ! empty( $block['attrs']['isLink'] ) ) {
			$html = preg_replace( '/<a /', '<a tabindex="-1" aria-hidden="true" ', $html, 1 );
		}
		return $html;
	},
	10,
	2
);
