<?php
/**
 * Category chips: "All" (the posts page) + each category with posts. The current view gets aria-current.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_page    = (int) get_option( 'page_for_posts' );
$amanah_all     = $amanah_page ? get_permalink( $amanah_page ) : home_url( '/' );
$amanah_cats    = get_categories( array( 'hide_empty' => true, 'orderby' => 'name' ) );
$amanah_current = is_category() ? (int) get_queried_object_id() : 0;
$amanah_total   = (int) wp_count_posts( 'post' )->publish;
?>
<nav <?php echo get_block_wrapper_attributes( array( 'class' => 'news-filter', 'aria-label' => $attributes['ariaLabel'] ) ); ?>>
	<ul>
		<li><a href="<?php echo esc_url( $amanah_all ); ?>"<?php echo is_home() ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $attributes['allLabel'] ); ?> <span class="mono"><?php echo (int) $amanah_total; ?></span></a></li>
		<?php foreach ( $amanah_cats as $amanah_cat ) : ?>
			<li><a href="<?php echo esc_url( get_category_link( $amanah_cat ) ); ?>"<?php echo $amanah_current === (int) $amanah_cat->term_id ? ' aria-current="page"' : ''; ?>><?php echo esc_html( $amanah_cat->name ); ?> <span class="mono"><?php echo (int) $amanah_cat->count; ?></span></a></li>
		<?php endforeach; ?>
	</ul>
</nav>
