<?php
/**
 * "Back to news" link. Points at the posts page, so it follows the page if it is renamed.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_page = (int) get_option( 'page_for_posts' );
$amanah_href = $amanah_page ? get_permalink( $amanah_page ) : home_url( '/' );
?>
<p <?php echo get_block_wrapper_attributes( array( 'class' => 'news-back' ) ); ?>><a href="<?php echo esc_url( $amanah_href ); ?>"><?php echo amanah_icon( 'back' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?><span><?php echo esc_html( $attributes['label'] ); ?></span></a></p>
