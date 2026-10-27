<?php
/**
 * Scroll-scrubbed video hero (sample: section.aw). view.js extracts frames from the
 * video and paints them to the canvas as the visitor scrolls through three "beats".
 * Beat 1's headline is the page h1; beats 2–3 are paragraphs styled the same.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a = $attributes;

// A media field takes a full URL or a file name in assets/images/.
$amanah_media = function ( $value ) {
	$value = (string) $value;
	if ( '' === $value || preg_match( '#^(https?:)?//#', $value ) ) {
		return $value;
	}
	return amanah_asset( 'images/' . ltrim( $value, '/' ) );
};

$amanah_hid   = wp_unique_id( 'aw-h-' );
$amanah_beats = array(
	array( $amanah_a['eyebrow1'], $amanah_a['title1'], true ),
	array( $amanah_a['eyebrow2'], $amanah_a['title2'], false ),
	array( $amanah_a['eyebrow3'], $amanah_a['title3'], true ),
);

$amanah_cta = function () use ( $amanah_a ) {
	if ( ! $amanah_a['primaryLabel'] && ! $amanah_a['secondaryLabel'] ) {
		return;
	}
	echo '<div class="aw__cta">';
	if ( $amanah_a['primaryLabel'] ) {
		echo '<a class="btn btn--red" href="' . esc_url( amanah_url( $amanah_a['primaryUrl'] ) ) . '">' . esc_html( $amanah_a['primaryLabel'] ) . ' ' . amanah_icon( 'arrow' ) . '</a>'; // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG.
	}
	if ( $amanah_a['secondaryLabel'] ) {
		echo '<a class="btn btn--ghost" href="' . esc_url( amanah_url( $amanah_a['secondaryUrl'] ) ) . '">' . esc_html( $amanah_a['secondaryLabel'] ) . '</a>';
	}
	echo '</div>';
};

$amanah_poster_d = $amanah_media( $amanah_a['posterDesktop'] );
$amanah_poster_m = $amanah_media( $amanah_a['posterMobile'] );
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'aw', 'aria-labelledby' => $amanah_hid ) ); ?>>
<div class="aw__st">
<picture><?php if ( $amanah_poster_d ) : ?><source media="(min-aspect-ratio: 6/5)" srcset="<?php echo esc_url( $amanah_poster_d ); ?>" width="1564" height="880"><?php endif; ?><img class="aw__poster" src="<?php echo esc_url( $amanah_poster_m ? $amanah_poster_m : $amanah_poster_d ); ?>" width="1924" height="1076" fetchpriority="high" alt="<?php echo esc_attr( $amanah_a['posterAlt'] ); ?>"></picture>
<video class="aw__v" muted playsinline preload="auto" crossorigin="anonymous" data-d="<?php echo esc_url( $amanah_media( $amanah_a['videoDesktop'] ) ); ?>" data-m="<?php echo esc_url( $amanah_media( $amanah_a['videoMobile'] ? $amanah_a['videoMobile'] : $amanah_a['videoDesktop'] ) ); ?>" aria-hidden="true" tabindex="-1"></video>
<canvas class="aw__cv" aria-hidden="true"></canvas>
<div class="aw__vig" aria-hidden="true"></div>
<div class="wrap aw__body">
<div class="aw__copy">
<?php foreach ( $amanah_beats as $amanah_i => $amanah_beat ) : ?>
<div class="aw__beat<?php echo 0 === $amanah_i ? ' is-on' : ''; ?>">
<?php if ( $amanah_beat[0] ) : ?><p class="aw__k"><?php echo esc_html( $amanah_beat[0] ); ?></p><?php endif; ?>
<?php if ( 0 === $amanah_i ) : ?>
<h1 id="<?php echo esc_attr( $amanah_hid ); ?>" class="aw__h"><?php echo amanah_inline( $amanah_beat[1] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h1>
<?php else : ?>
<p class="aw__h"><?php echo amanah_inline( $amanah_beat[1] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></p>
<?php endif; ?>
<?php
if ( $amanah_beat[2] ) {
	$amanah_cta();
}
?>
</div>
<?php endforeach; ?>
</div>
</div>
<?php if ( $amanah_a['cue'] ) : ?><div class="aw__cue" aria-hidden="true"><?php echo esc_html( $amanah_a['cue'] ); ?></div><?php endif; ?>
<?php if ( $amanah_a['note'] ) : ?><p class="aw__note" aria-hidden="true"><?php echo esc_html( $amanah_a['note'] ); ?></p><?php endif; ?>
</div>
</section>
