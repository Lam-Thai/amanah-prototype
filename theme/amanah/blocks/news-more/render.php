<?php
/**
 * "More from Amanah": the latest posts as the same cards as the news index, minus the post being read.
 * Renders a core Query Loop so the cards stay identical to templates/home.html; the current post is
 * excluded with a filter that is added just for this one render.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a       = $attributes;
$amanah_count   = max( 1, min( 6, (int) $amanah_a['count'] ) );
$amanah_exclude = is_singular( 'post' ) ? (int) get_queried_object_id() : 0;

// Nothing else to show: render nothing rather than an empty section.
$amanah_others = get_posts(
	array(
		'post_type'      => 'post',
		'post_status'    => 'publish',
		'fields'         => 'ids',
		'posts_per_page' => 1,
		'post__not_in'   => $amanah_exclude ? array( $amanah_exclude ) : array(),
	)
);
if ( ! $amanah_others ) {
	return;
}

$amanah_query = array(
	'perPage'  => $amanah_count,
	'pages'    => 0,
	'offset'   => 0,
	'postType' => 'post',
	'order'    => 'desc',
	'orderBy'  => 'date',
	'inherit'  => false,
);

$amanah_markup = '<!-- wp:query {"query":' . wp_json_encode( $amanah_query ) . '} -->
<div class="wp-block-query"><!-- wp:post-template {"className":"news-grid"} -->
<!-- wp:group {"tagName":"article","className":"news-card"} -->
<article class="wp-block-group news-card"><!-- wp:post-featured-image {"aspectRatio":"3/2","className":"news-card__img"} /-->
<!-- wp:group {"className":"news-card__body"} -->
<div class="wp-block-group news-card__body"><!-- wp:group {"className":"news-meta"} -->
<div class="wp-block-group news-meta"><!-- wp:post-terms {"term":"category"} /-->
<!-- wp:post-date /--></div>
<!-- /wp:group -->
<!-- wp:post-title {"level":3,"isLink":true,"className":"news-card__title"} /-->
<!-- wp:post-excerpt {"excerptLength":40} /--></div>
<!-- /wp:group --></article>
<!-- /wp:group -->
<!-- /wp:post-template --></div>
<!-- /wp:query -->';

$amanah_filter = static function ( $query ) use ( $amanah_exclude ) {
	if ( $amanah_exclude ) {
		$query['post__not_in'] = array_merge( (array) ( $query['post__not_in'] ?? array() ), array( $amanah_exclude ) );
	}
	return $query;
};

add_filter( 'query_loop_block_query_vars', $amanah_filter );
$amanah_cards = do_blocks( $amanah_markup );
remove_filter( 'query_loop_block_query_vars', $amanah_filter );

$amanah_hid = wp_unique_id( 'news-more-h-' );
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'sec paper news-related', 'aria-labelledby' => $amanah_hid ) ); ?>>
	<div class="wrap">
		<div class="head" data-reveal>
			<?php if ( $amanah_a['eyebrow'] ) : ?>
				<p class="tag"><?php echo esc_html( $amanah_a['eyebrow'] ); ?></p>
			<?php endif; ?>
			<h2 id="<?php echo esc_attr( $amanah_hid ); ?>"><?php echo amanah_inline( $amanah_a['heading'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
		</div>
		<?php echo $amanah_cards; // phpcs:ignore WordPress.Security.EscapeOutput -- core block output. ?>
	</div>
</section>
