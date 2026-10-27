<?php
/**
 * Location: aerial map with pins + landmark, and the location cards. view.js zooms and
 * spotlights the chosen place ("location spotlight" in the sample).
 *
 * places[]: { title, kind, icon: server|office, text, tip, label (pin's screen-reader name),
 *             x, y (pin, % of image), fx, fy (zoom focus, defaults to x/y), zoom, r (spotlight %),
 *             color: red|lake }
 * landmark: { label, x, y }  (empty label hides it)
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a      = $attributes;
$amanah_places = array_values( array_filter( (array) $amanah_a['places'], 'is_array' ) );
$amanah_h_id   = wp_unique_id( 'loc-h-' );
$amanah_lm     = (array) $amanah_a['landmark'];
$amanah_num    = function ( $v, $fallback ) {
	return is_numeric( $v ) ? (float) $v : (float) $fallback;
};
$amanah_color  = function ( $c ) {
	return 'lake' === $c ? 'var(--lake)' : 'var(--red)';
};
$amanah_wrap   = array(
	'class'           => 'loc',
	'aria-labelledby' => $amanah_h_id,
);
?>
<section <?php echo get_block_wrapper_attributes( $amanah_wrap ); ?>>
	<div class="wrap">
		<div class="loc__head" data-reveal>
			<div style="display:grid;gap:20px"><h2 id="<?php echo esc_attr( $amanah_h_id ); ?>"><?php echo amanah_inline( $amanah_a['heading'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2></div>
			<?php if ( $amanah_a['intro'] ) : ?>
				<p><?php echo amanah_inline( $amanah_a['intro'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
			<?php endif; ?>
		</div>
		<div class="loc__map" data-reveal>
			<div class="loc__pan"><div class="loc__dim" aria-hidden="true"></div><picture><img src="<?php echo esc_url( amanah_asset( 'images/' . $amanah_a['image'] ) ); ?>" width="1780" height="1000" decoding="async" fetchpriority="low" alt="<?php echo esc_attr( $amanah_a['imageAlt'] ); ?>"></picture>
				<?php if ( ! empty( $amanah_lm['label'] ) ) : ?>
					<span class="lmark" aria-hidden="true" style="--x:<?php echo esc_attr( $amanah_num( $amanah_lm['x'] ?? null, 50 ) ); ?>%;--y:<?php echo esc_attr( $amanah_num( $amanah_lm['y'] ?? null, 50 ) ); ?>%"><svg viewBox="0 0 24 24"><path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3M16 19l2 3"/></svg><?php echo esc_html( $amanah_lm['label'] ); ?></span>
				<?php endif; ?>
				<?php foreach ( $amanah_places as $amanah_k => $amanah_p ) : ?>
					<?php
					$amanah_x     = $amanah_num( $amanah_p['x'] ?? null, 50 );
					$amanah_y     = $amanah_num( $amanah_p['y'] ?? null, 50 );
					$amanah_style = '--x:' . $amanah_x . '%;--y:' . $amanah_y . '%' . ( 'lake' === ( $amanah_p['color'] ?? '' ) ? ';--c:var(--lake)' : '' );
					$amanah_label = ! empty( $amanah_p['label'] ) ? $amanah_p['label'] : trim( ( $amanah_p['title'] ?? '' ) . ', ' . ( $amanah_p['kind'] ?? '' ), ', ' );
					?>
					<button class="lpin" type="button" data-k="<?php echo (int) $amanah_k; ?>" data-fx="<?php echo esc_attr( $amanah_num( $amanah_p['fx'] ?? null, $amanah_x ) ); ?>" data-fy="<?php echo esc_attr( $amanah_num( $amanah_p['fy'] ?? null, $amanah_y ) ); ?>" data-z="<?php echo esc_attr( $amanah_num( $amanah_p['zoom'] ?? null, 1.12 ) ); ?>" data-r="<?php echo esc_attr( $amanah_num( $amanah_p['r'] ?? null, 20 ) ); ?>" style="<?php echo esc_attr( $amanah_style ); ?>" aria-pressed="false" aria-label="<?php echo esc_attr( $amanah_label ); ?>"><?php if ( ! empty( $amanah_p['tip'] ) ) : ?><span class="tip"><?php echo esc_html( $amanah_p['tip'] ); ?></span><?php endif; ?></button>
				<?php endforeach; ?>
			</div>
			<?php if ( $amanah_a['captionStart'] || $amanah_a['captionEnd'] ) : ?>
				<p class="loc__cap" aria-hidden="true"><span><?php echo esc_html( $amanah_a['captionStart'] ); ?></span><span><?php echo esc_html( $amanah_a['captionEnd'] ); ?></span></p>
			<?php endif; ?>
		</div>
		<?php if ( $amanah_places ) : ?>
			<ul class="lc">
				<?php foreach ( $amanah_places as $amanah_k => $amanah_p ) : ?>
					<li><button type="button" data-k="<?php echo (int) $amanah_k; ?>" aria-pressed="<?php echo 0 === $amanah_k ? 'true' : 'false'; ?>" style="--c:<?php echo esc_attr( $amanah_color( $amanah_p['color'] ?? '' ) ); ?>"><span class="lc__k"><?php echo amanah_icon( 'office' === ( $amanah_p['icon'] ?? '' ) ? 'office' : 'server' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?><?php echo esc_html( $amanah_p['kind'] ?? '' ); ?></span><b><?php echo esc_html( $amanah_p['title'] ?? '' ); ?></b><?php if ( ! empty( $amanah_p['text'] ) ) : ?><span class="lc__d"><?php echo esc_html( $amanah_p['text'] ); ?></span><?php endif; ?></button></li>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
	</div>
</section>
