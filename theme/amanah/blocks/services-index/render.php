<?php
/**
 * Services index: numbered rows that jump to each service's section on the page.
 *
 * items[]: { title, text, price, url }   url is usually an in-page anchor ("#cloud-connect").
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a     = $attributes;
$amanah_items = array_values( array_filter( (array) $amanah_a['items'], 'is_array' ) );
$amanah_h_id  = wp_unique_id( 'sx-h-' );
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'sec paper sx', 'aria-labelledby' => $amanah_h_id ) ); ?>>
	<div class="wrap">
		<div class="head head--split" data-reveal>
			<div style="display:grid;gap:20px">
				<?php if ( $amanah_a['eyebrow'] ) : ?>
					<p class="tag"><?php echo esc_html( $amanah_a['eyebrow'] ); ?></p>
				<?php endif; ?>
				<h2 id="<?php echo esc_attr( $amanah_h_id ); ?>"><?php echo amanah_inline( $amanah_a['heading'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
			</div>
			<?php if ( $amanah_a['intro'] ) : ?>
				<p><?php echo amanah_inline( $amanah_a['intro'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
			<?php endif; ?>
		</div>
		<?php if ( $amanah_items ) : ?>
			<ol class="sx__list">
				<?php foreach ( $amanah_items as $amanah_i => $amanah_it ) : ?>
					<li data-reveal<?php echo $amanah_i ? ' style="--d:' . (int) min( $amanah_i, 4 ) . '"' : ''; ?>>
						<a class="sx__row" href="<?php echo esc_url( amanah_url( $amanah_it['url'] ?? '' ) ); ?>">
							<span class="sx__n" aria-hidden="true"><?php echo esc_html( str_pad( (string) ( $amanah_i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span>
							<h3 class="sx__t"><?php echo esc_html( $amanah_it['title'] ?? '' ); ?></h3>
							<?php if ( ! empty( $amanah_it['text'] ) ) : ?>
								<span class="sx__d"><?php echo amanah_inline( $amanah_it['text'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
							<?php endif; ?>
							<span class="sx__p"><?php echo amanah_inline( $amanah_it['price'] ?? '' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
							<span class="go" aria-hidden="true"><?php echo amanah_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?></span>
						</a>
					</li>
				<?php endforeach; ?>
			</ol>
		<?php endif; ?>
	</div>
</section>
