<?php
/**
 * Journey timeline ("From first call to a live rack in days.").
 *
 * steps[]: { time, title, text }
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a     = $attributes;
$amanah_steps = array_values( array_filter( (array) $amanah_a['steps'], 'is_array' ) );
$amanah_h_id  = wp_unique_id( 'j-h-' );
$amanah_wrap  = array(
	'class'           => 'sec',
	'aria-labelledby' => $amanah_h_id,
);
?>
<section <?php echo get_block_wrapper_attributes( $amanah_wrap ); ?>>
	<div class="wrap">
		<div class="head" data-reveal>
			<h2 id="<?php echo esc_attr( $amanah_h_id ); ?>"><?php echo amanah_inline( $amanah_a['heading'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
		</div>
		<?php if ( $amanah_steps ) : ?>
			<ol class="journey">
				<?php foreach ( $amanah_steps as $amanah_i => $amanah_s ) : ?>
					<li data-reveal<?php echo $amanah_i ? ' style="--d:' . (int) min( $amanah_i, 3 ) . '"' : ''; ?>><p class="t"><?php echo esc_html( $amanah_s['time'] ?? '' ); ?></p><h3><?php echo esc_html( $amanah_s['title'] ?? '' ); ?></h3><p><?php echo amanah_inline( $amanah_s['text'] ?? '' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p></li>
				<?php endforeach; ?>
			</ol>
		<?php endif; ?>
	</div>
</section>
