<?php
/**
 * Closing CTA band (sample: section.finale.finale--type) with the decorative aerial crop and pin.
 * The crop and the pin's ping are pure CSS (site.css .fin__*), so there is no view script.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a   = $attributes;
$amanah_hid = wp_unique_id( 'fin-h-' );
$amanah_img = (string) $amanah_a['image'];
if ( '' !== $amanah_img && ! preg_match( '#^(https?:)?//#', $amanah_img ) ) {
	$amanah_img = amanah_asset( 'images/' . ltrim( $amanah_img, '/' ) );
}
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'finale finale--type', 'aria-labelledby' => $amanah_hid ) ); ?>>
<?php if ( $amanah_img ) : ?>
<div class="fin__img" aria-hidden="true"><div class="fin__pan"><picture><img src="<?php echo esc_url( $amanah_img ); ?>" width="1780" height="1000" loading="lazy" decoding="async" alt=""></picture><?php if ( $amanah_a['pinLabel'] ) : ?><span class="fin__pin"><i></i><b><?php echo esc_html( $amanah_a['pinLabel'] ); ?></b></span><?php endif; ?></div></div>
<?php endif; ?>
<div class="wrap">
<h2 id="<?php echo esc_attr( $amanah_hid ); ?>" data-reveal><?php echo amanah_inline( $amanah_a['title'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
<div class="finale__row" data-reveal style="--d:1">
<div style="display:grid;gap:24px">
<?php if ( $amanah_a['text'] ) : ?><p><?php echo amanah_inline( $amanah_a['text'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p><?php endif; ?>
<?php if ( $amanah_a['primaryLabel'] || $amanah_a['secondaryLabel'] ) : ?>
<div style="display:flex;flex-wrap:wrap;gap:12px">
<?php if ( $amanah_a['primaryLabel'] ) : ?>
<a class="btn btn--red" href="<?php echo esc_url( amanah_url( $amanah_a['primaryUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['primaryLabel'] ); ?> <?php echo amanah_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?></a>
<?php endif; ?>
<?php if ( $amanah_a['secondaryLabel'] ) : ?>
<a class="btn btn--ghost" href="<?php echo esc_url( amanah_url( $amanah_a['secondaryUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['secondaryLabel'] ); ?></a>
<?php endif; ?>
</div>
<?php endif; ?>
</div>
<?php if ( $amanah_a['priceMatch'] ) : ?>
<div class="pm"><?php echo amanah_icon( 'shield' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><p><?php echo amanah_inline( $amanah_a['priceMatch'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p></div>
<?php endif; ?>
</div>
</div>
</section>
