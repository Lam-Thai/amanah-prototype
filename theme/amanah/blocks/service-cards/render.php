<?php
/**
 * Service cards ("Add to your colocation."): each card is one link.
 *
 * items[]: { type: image|stack, title, text, price, url, image, alt, width, height, stack: [ { k, v } ] }
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a     = $attributes;
$amanah_items = array_values( array_filter( (array) $amanah_a['items'], 'is_array' ) );
$amanah_h_id  = wp_unique_id( 'also-h-' );
$amanah_wrap  = array(
	'class'           => 'sec',
	'aria-labelledby' => $amanah_h_id,
);
?>
<section <?php echo get_block_wrapper_attributes( $amanah_wrap ); ?>>
	<div class="wrap">
		<div class="head" data-reveal>
			<?php if ( $amanah_a['eyebrow'] ) : ?>
				<p class="cap"><?php echo esc_html( $amanah_a['eyebrow'] ); ?></p>
			<?php endif; ?>
			<h2 id="<?php echo esc_attr( $amanah_h_id ); ?>"><?php echo amanah_inline( $amanah_a['heading'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
		</div>
		<?php if ( $amanah_items ) : ?>
			<div class="also">
				<?php foreach ( $amanah_items as $amanah_i => $amanah_c ) : ?>
					<?php $amanah_stack = 'stack' === ( $amanah_c['type'] ?? '' ); ?>
					<a class="svc<?php echo $amanah_stack ? ' svc--type' : ''; ?>" href="<?php echo esc_url( amanah_url( $amanah_c['url'] ?? '' ) ); ?>" data-reveal<?php echo $amanah_i ? ' style="--d:' . (int) min( $amanah_i, 3 ) . '"' : ''; ?>>
						<?php if ( $amanah_stack ) : ?>
							<div class="svc__img" aria-hidden="true"><div class="stack"><?php foreach ( (array) ( $amanah_c['stack'] ?? array() ) as $amanah_row ) : ?><span><?php echo esc_html( $amanah_row['k'] ?? '' ); ?> <b><?php echo esc_html( $amanah_row['v'] ?? '' ); ?></b></span><?php endforeach; ?></div></div>
						<?php elseif ( ! empty( $amanah_c['image'] ) ) : ?>
							<div class="svc__img"><picture><img src="<?php echo esc_url( amanah_asset( 'images/' . $amanah_c['image'] ) ); ?>" width="<?php echo (int) ( $amanah_c['width'] ?? 1800 ); ?>" height="<?php echo (int) ( $amanah_c['height'] ?? 1195 ); ?>" loading="lazy" alt="<?php echo esc_attr( $amanah_c['alt'] ?? '' ); ?>"></picture></div>
						<?php endif; ?>
						<div class="svc__body"><h3><?php echo esc_html( $amanah_c['title'] ?? '' ); ?></h3><?php if ( ! empty( $amanah_c['text'] ) ) : ?><p><?php echo esc_html( $amanah_c['text'] ); ?></p><?php endif; ?><p class="price"><span><?php echo esc_html( $amanah_c['price'] ?? '' ); ?></span><span class="go" aria-hidden="true"><?php echo amanah_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?></span></p></div>
					</a>
				<?php endforeach; ?>
			</div>
		<?php endif; ?>
	</div>
</section>
