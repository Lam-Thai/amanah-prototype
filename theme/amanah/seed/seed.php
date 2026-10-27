<?php
/**
 * Demo content importer ("content as code").
 *
 * Pages live in seed/pages/<slug>.html and posts in seed/posts/<slug>.html: a header comment
 * `<!-- amanah:page {...json...} -->` followed by block markup. Importing upserts by slug, so it
 * is safe to run any number of times.
 *
 * - Playground boot (blueprint) calls amanah_seed_run() once.
 * - On a local site (WP_ENVIRONMENT_TYPE=local) it re-runs automatically whenever a seed file
 *   changes, so editing a file and reloading the browser shows the change.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

/** Header navigation: label, site path, CSS classes from the sample's nav. */
function amanah_seed_menu() {
	return array(
		array( 'Colocation', '/colocation/', 'lead' ),
		array( 'AI and GPU', '/high-density/', 'nav-ai' ),
		array( 'Services', '/services/', '' ),
		array( 'Data centre', '/data-centre/', '' ),
		array( 'Company', '/about/', '' ),
	);
}

/** Every seed file, keyed by path. */
function amanah_seed_files() {
	$dir = get_theme_file_path( 'seed' );
	return array_merge( glob( $dir . '/pages/*.html' ) ?: array(), glob( $dir . '/posts/*.html' ) ?: array() );
}

/** Fingerprint of all seed input, so local edits trigger a re-import. */
function amanah_seed_hash() {
	$h = md5_file( __FILE__ );
	foreach ( amanah_seed_files() as $file ) {
		$h .= md5_file( $file );
	}
	return md5( $h );
}

/** Split a seed file into [ meta array, block markup with tokens replaced ]. */
function amanah_seed_parse( $file ) {
	$raw  = (string) file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions -- local theme file.
	$meta = array();
	if ( preg_match( '/^\s*<!--\s*amanah:(?:page|post)\s+(\{.*?\})\s*-->\s*/s', $raw, $m ) ) {
		$meta = (array) json_decode( $m[1], true );
		$raw  = substr( $raw, strlen( $m[0] ) );
	}
	$markup = strtr(
		$raw,
		array(
			'{{home}}'  => untrailingslashit( home_url() ),
			'{{theme}}' => untrailingslashit( get_theme_file_uri() ),
		)
	);
	return array( $meta, trim( $markup ) );
}

/** Copy a theme image into the Media Library once; returns the attachment id. */
function amanah_seed_attachment( $filename ) {
	$found = get_posts(
		array(
			'post_type'   => 'attachment',
			'post_status' => 'inherit',
			'meta_key'    => '_amanah_seed_src', // phpcs:ignore WordPress.DB.SlowDBQuery -- one-off import.
			'meta_value'  => $filename, // phpcs:ignore WordPress.DB.SlowDBQuery
			'fields'      => 'ids',
			'numberposts' => 1,
		)
	);
	if ( $found ) {
		return (int) $found[0];
	}
	$src = get_theme_file_path( 'assets/images/' . basename( $filename ) );
	if ( ! file_exists( $src ) ) {
		return 0;
	}
	$upload = wp_upload_bits( basename( $src ), null, (string) file_get_contents( $src ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	if ( ! empty( $upload['error'] ) ) {
		return 0;
	}
	$type = wp_check_filetype( $upload['file'] );
	$id   = wp_insert_attachment(
		array(
			'post_title'     => sanitize_title( pathinfo( $src, PATHINFO_FILENAME ) ),
			'post_mime_type' => $type['type'] ? $type['type'] : 'image/avif',
			'post_status'    => 'inherit',
		),
		$upload['file']
	);
	if ( $id && ! is_wp_error( $id ) ) {
		update_post_meta( $id, '_amanah_seed_src', $filename );
		return (int) $id;
	}
	return 0;
}

/** Create or update one page/post from its seed file. Returns the post id. */
function amanah_seed_upsert( $file, $type ) {
	list( $meta, $content ) = amanah_seed_parse( $file );
	$slug     = basename( $file, '.html' );
	$existing = get_page_by_path( $slug, OBJECT, $type );

	$post = array(
		'post_type'    => $type,
		'post_name'    => $slug,
		'post_title'   => isset( $meta['title'] ) ? $meta['title'] : ucwords( str_replace( '-', ' ', $slug ) ),
		'post_content' => $content,
		'post_excerpt' => isset( $meta['excerpt'] ) ? $meta['excerpt'] : '',
		'post_status'  => 'publish',
		'menu_order'   => isset( $meta['order'] ) ? (int) $meta['order'] : 0,
		'post_author'  => 1,
	);
	if ( 'post' === $type && ! empty( $meta['date'] ) ) {
		$post['post_date'] = $meta['date'] . ' 09:00:00';
	}
	if ( $existing ) {
		$post['ID'] = $existing->ID;
	}
	// wp_insert_post() unslashes its input; slash first so "<" in block attributes survives.
	$id = wp_insert_post( wp_slash( $post ), true );
	if ( is_wp_error( $id ) ) {
		return 0;
	}
	update_post_meta( $id, '_amanah_seed_file', $type . 's/' . $slug . '.html' );
	if ( 'post' === $type && ! empty( $meta['category'] ) ) {
		$term = term_exists( $meta['category'], 'category' );
		$term = $term ? $term : wp_insert_term( $meta['category'], 'category' );
		if ( ! is_wp_error( $term ) ) {
			wp_set_post_categories( $id, array( (int) $term['term_id'] ) );
		}
	}
	if ( ! empty( $meta['image'] ) ) {
		$att = amanah_seed_attachment( $meta['image'] );
		if ( $att ) {
			set_post_thumbnail( $id, $att );
		}
	}
	return (int) $id;
}

/** Rebuild the header menu and assign it to the "primary" location. */
function amanah_seed_nav() {
	$menu = wp_get_nav_menu_object( 'Header navigation' );
	$id   = $menu ? (int) $menu->term_id : (int) wp_create_nav_menu( 'Header navigation' );
	foreach ( (array) wp_get_nav_menu_items( $id ) as $item ) {
		wp_delete_post( $item->ID, true );
	}
	foreach ( amanah_seed_menu() as $i => $row ) {
		list( $label, $path, $class ) = $row;
		$page = get_page_by_path( trim( $path, '/' ) );
		$args = array(
			'menu-item-title'    => $label,
			'menu-item-classes'  => $class,
			'menu-item-status'   => 'publish',
			'menu-item-position' => $i + 1,
		);
		if ( $page ) {
			$args += array( 'menu-item-object' => 'page', 'menu-item-object-id' => $page->ID, 'menu-item-type' => 'post_type' );
		} else {
			$args += array( 'menu-item-url' => amanah_url( $path ), 'menu-item-type' => 'custom' );
		}
		wp_update_nav_menu_item( $id, 0, $args );
	}
	$locations            = (array) get_theme_mod( 'nav_menu_locations', array() );
	$locations['primary'] = $id;
	set_theme_mod( 'nav_menu_locations', $locations );
}

/** Import everything. Safe to repeat. */
function amanah_seed_run() {
	// Seed markup contains canvas/svg/data attributes that post kses would strip when no admin is logged in.
	kses_remove_filters();

	update_option( 'blogname', 'Amanah' );
	update_option( 'blogdescription', 'Toronto colocation at 151 Front Street West' );
	update_option( 'timezone_string', 'America/Toronto' );
	update_option( 'blog_public', '0' ); // Prototype: ask search engines not to index it.
	if ( '/%postname%/' !== get_option( 'permalink_structure' ) ) {
		update_option( 'permalink_structure', '/%postname%/' );
		flush_rewrite_rules( false );
	}

	foreach ( array( 'hello-world' => 'post', 'sample-page' => 'page' ) as $slug => $type ) {
		$default = get_page_by_path( $slug, OBJECT, $type );
		if ( $default ) {
			wp_delete_post( $default->ID, true );
		}
	}

	$dir = get_theme_file_path( 'seed' );
	foreach ( glob( $dir . '/pages/*.html' ) ?: array() as $file ) {
		amanah_seed_upsert( $file, 'page' );
	}
	foreach ( glob( $dir . '/posts/*.html' ) ?: array() as $file ) {
		amanah_seed_upsert( $file, 'post' );
	}

	// Remove pages/posts this importer created whose seed file has since been deleted.
	// Compare against glob(): on Playground mounts file_exists() can still see deleted files.
	$present = array();
	foreach ( amanah_seed_files() as $file ) {
		$present[ basename( dirname( $file ) ) . '/' . basename( $file ) ] = true;
	}
	$seeded = get_posts(
		array(
			'post_type'   => array( 'page', 'post' ),
			'post_status' => 'any',
			'meta_key'    => '_amanah_seed_file', // phpcs:ignore WordPress.DB.SlowDBQuery -- small, local import.
			'numberposts' => -1,
		)
	);
	foreach ( $seeded as $old ) {
		if ( empty( $present[ get_post_meta( $old->ID, '_amanah_seed_file', true ) ] ) ) {
			wp_delete_post( $old->ID, true );
		}
	}

	$home = get_page_by_path( 'home' );
	$news = get_page_by_path( 'news' );
	if ( $home ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $home->ID );
	}
	if ( $news ) {
		update_option( 'page_for_posts', $news->ID );
	}

	amanah_seed_nav();
	update_option( 'amanah_seed_hash', amanah_seed_hash(), false );
	kses_init();
}

// Local only: re-import when any seed file changed. A short lock stops parallel requests importing twice.
add_action(
	'init',
	function () {
		if ( 'local' !== wp_get_environment_type() || wp_doing_ajax() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		if ( get_option( 'amanah_seed_hash' ) === amanah_seed_hash() ) {
			return;
		}
		$lock = (int) get_option( 'amanah_seed_lock', 0 );
		if ( $lock && time() - $lock < 60 ) {
			return;
		}
		update_option( 'amanah_seed_lock', time(), false );
		amanah_seed_run();
		delete_option( 'amanah_seed_lock' );
	},
	20
);
