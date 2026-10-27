<?php
/**
 * Site header. Links come from the "Header navigation" menu so the client edits them in wp-admin.
 * Ids (#hdr, #drawer, #menuBtn) are used by assets/js/site.js; the block allows one instance.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_items = array();
$amanah_locs  = get_nav_menu_locations();
if ( ! empty( $amanah_locs['primary'] ) ) {
	foreach ( (array) wp_get_nav_menu_items( $amanah_locs['primary'] ) as $amanah_item ) {
		if ( empty( $amanah_item->menu_item_parent ) ) {
			$amanah_items[] = $amanah_item;
		}
	}
}

// Current page URL, for aria-current. The news index and its posts count as "News".
if ( is_front_page() ) {
	$amanah_here = home_url( '/' );
} elseif ( is_home() || is_singular( 'post' ) ) {
	$amanah_here = (string) get_permalink( (int) get_option( 'page_for_posts' ) );
} else {
	$amanah_here = is_singular() ? (string) get_permalink( get_queried_object_id() ) : '';
}
$amanah_is_current = function ( $url ) use ( $amanah_here ) {
	return '' !== $amanah_here && trailingslashit( strtok( $url, '?#' ) ) === trailingslashit( $amanah_here );
};
?>
<header class="hdr" id="hdr">
	<div class="wrap hdr__in">
		<a class="logo" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="<?php esc_attr_e( 'Amanah, home', 'amanah' ); ?>"><img src="<?php echo esc_url( amanah_asset( 'images/logo-dark.png' ) ); ?>" width="775" height="128" alt=""></a>
		<nav aria-label="<?php esc_attr_e( 'Primary', 'amanah' ); ?>">
			<ul class="nav">
				<?php foreach ( $amanah_items as $amanah_item ) : ?>
					<?php $amanah_class = implode( ' ', array_filter( (array) $amanah_item->classes ) ); ?>
					<li><a<?php echo $amanah_class ? ' class="' . esc_attr( $amanah_class ) . '"' : ''; ?> href="<?php echo esc_url( $amanah_item->url ); ?>"<?php echo $amanah_is_current( $amanah_item->url ) ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $amanah_item->title ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</nav>
		<div class="hdr__act">
			<a class="portal" href="<?php echo esc_url( amanah_url( $attributes['portalUrl'] ) ); ?>"><?php echo esc_html( $attributes['portalLabel'] ); ?></a>
			<a class="btn btn--red btn--sm" href="<?php echo esc_url( amanah_url( $attributes['ctaUrl'] ) ); ?>"><?php echo esc_html( $attributes['ctaLabel'] ); ?></a>
			<button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="drawer" aria-label="<?php esc_attr_e( 'Open menu', 'amanah' ); ?>"><?php echo amanah_icon( 'menu' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?></button>
		</div>
	</div>
</header>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Menu', 'amanah' ); ?>">
	<?php foreach ( $amanah_items as $amanah_item ) : ?>
		<a href="<?php echo esc_url( $amanah_item->url ); ?>"><?php echo esc_html( $amanah_item->title ); ?> <?php echo amanah_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
	<?php endforeach; ?>
	<a href="<?php echo esc_url( amanah_url( $attributes['portalUrl'] ) ); ?>"><?php echo esc_html( $attributes['portalLabel'] ); ?> <?php echo amanah_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
	<a class="btn btn--red" href="<?php echo esc_url( amanah_url( $attributes['ctaUrl'] ) ); ?>"><?php echo esc_html( $attributes['ctaLabel'] ); ?></a>
</div>
