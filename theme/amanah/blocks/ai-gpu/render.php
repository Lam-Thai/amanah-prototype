<?php
/**
 * AI and GPU: dark section with badge, gradient headline, CTAs, framed image and spec rows
 * whose line graphics (power arc, fibre) come from assets/js/lines.js.
 *
 * specs[]: { num, unit, title, text, line: power|net|waves|audit|"" }
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a     = $attributes;
$amanah_h_id  = wp_unique_id( 'ai-h-' );
$amanah_arrow = amanah_icon( 'arrow' );
$amanah_wrap  = array(
	'class'           => 'ai',
	'aria-labelledby' => $amanah_h_id,
);
?>
<section <?php echo get_block_wrapper_attributes( $amanah_wrap ); ?>>
	<div class="ai__rule" aria-hidden="true"></div>
	<div class="wrap">
		<div class="ai__top">
			<div class="ai__copy" data-reveal>
				<?php if ( $amanah_a['badge'] ) : ?>
					<p><span class="ai-badge"><span class="ai-dot" aria-hidden="true"></span><?php echo esc_html( $amanah_a['badge'] ); ?></span></p>
				<?php endif; ?>
				<h2 id="<?php echo esc_attr( $amanah_h_id ); ?>"><?php echo amanah_inline( $amanah_a['title'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
				<?php if ( $amanah_a['text'] ) : ?>
					<p><?php echo amanah_inline( $amanah_a['text'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
				<?php endif; ?>
				<?php if ( $amanah_a['primaryLabel'] || $amanah_a['secondaryLabel'] ) : ?>
					<div class="ai__cta">
						<?php if ( $amanah_a['primaryLabel'] ) : ?>
							<a class="btn btn--red" href="<?php echo esc_url( amanah_url( $amanah_a['primaryUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['primaryLabel'] ); ?> <?php echo $amanah_arrow; // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?></a>
						<?php endif; ?>
						<?php if ( $amanah_a['secondaryLabel'] ) : ?>
							<a class="btn btn--ai" href="<?php echo esc_url( amanah_url( $amanah_a['secondaryUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['secondaryLabel'] ); ?></a>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>
			<?php if ( $amanah_a['image'] ) : ?>
				<figure class="ai__visual" data-reveal style="--d:1">
					<div class="frame">
						<picture><img src="<?php echo esc_url( amanah_asset( 'images/' . $amanah_a['image'] ) ); ?>" width="1800" height="1195" loading="lazy" alt="<?php echo esc_attr( $amanah_a['imageAlt'] ); ?>"></picture>
						<div class="glow" aria-hidden="true"></div>
						<?php if ( $amanah_a['chipValue'] ) : ?>
							<p class="chip chip--b"><b><?php echo esc_html( $amanah_a['chipValue'] ); ?></b><span><?php echo esc_html( $amanah_a['chipLabel'] ); ?></span></p>
						<?php endif; ?>
					</div>
				</figure>
			<?php endif; ?>
		</div>
		<?php if ( ! empty( $amanah_a['specs'] ) ) : ?>
			<ol class="specs2">
				<?php foreach ( (array) $amanah_a['specs'] as $amanah_s ) : ?>
					<?php
					if ( ! is_array( $amanah_s ) ) {
						continue;
					}
					?>
					<li class="srow" data-reveal>
						<p class="srow__n"><?php echo esc_html( $amanah_s['num'] ?? '' ); ?><?php if ( ! empty( $amanah_s['unit'] ) ) : ?><small><?php echo esc_html( $amanah_s['unit'] ); ?></small><?php endif; ?></p>
						<div class="srow__t"><h3><?php echo esc_html( $amanah_s['title'] ?? '' ); ?></h3><?php if ( ! empty( $amanah_s['text'] ) ) : ?><p><?php echo amanah_inline( $amanah_s['text'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p><?php endif; ?></div>
						<?php
						$amanah_lines = array(
							'power' => 'l-power',
							'net'   => 'l-net',
							'waves' => 'waves',
							'audit' => 'l-audit2',
						);
						$amanah_line  = $amanah_s['line'] ?? '';
						if ( isset( $amanah_lines[ $amanah_line ] ) ) {
							echo '<canvas class="' . esc_attr( $amanah_lines[ $amanah_line ] ) . '" aria-hidden="true"></canvas>';
						}
						?>
					</li>
				<?php endforeach; ?>
			</ol>
		<?php endif; ?>
		<?php if ( $amanah_a['endText'] || $amanah_a['endLabel'] ) : ?>
			<div class="specs2__end" data-reveal>
				<p><?php echo amanah_inline( $amanah_a['endText'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
				<?php if ( $amanah_a['endLabel'] ) : ?>
					<a class="btn btn--red" href="<?php echo esc_url( amanah_url( $amanah_a['endUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['endLabel'] ); ?> <?php echo $amanah_arrow; // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</section>
