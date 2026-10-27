<?php
/**
 * Story: sticky media (desktop) beside scrolling steps, then the carriers band.
 * Markup is the sample's ("What your rack runs on."); view.js switches the active step.
 *
 * steps[]: { key, num, unit, title, text, chips[], image, alt, cap, line: power|waves|audit|net|conv|"" }
 * carriers[]: { name, kind }   carriersMore: { value, label }   Empty carriers hides the band.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a     = $attributes;
$amanah_steps = array_values( array_filter( (array) $amanah_a['steps'], 'is_array' ) );
$amanah_h_id  = wp_unique_id( 'runs-h-' );
$amanah_first = $amanah_steps ? (string) ( $amanah_steps[0]['cap'] ?? '' ) : '';
$amanah_more  = (array) $amanah_a['carriersMore'];

/** Image key used by the sample's data-k (file name without extension). */
$amanah_key = function ( $image ) {
	return sanitize_html_class( pathinfo( (string) $image, PATHINFO_FILENAME ) );
};
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'sec', 'aria-labelledby' => $amanah_h_id ) ); ?>>
	<div class="wrap">
		<div class="head head--split" data-reveal>
			<div style="display:grid;gap:20px">
				<h2 id="<?php echo esc_attr( $amanah_h_id ); ?>"><?php echo amanah_inline( $amanah_a['heading'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
			</div>
			<?php if ( $amanah_a['intro'] ) : ?>
				<p><?php echo amanah_inline( $amanah_a['intro'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
			<?php endif; ?>
		</div>
		<?php if ( $amanah_steps ) : ?>
			<div class="story">
				<div class="story__media">
					<?php foreach ( $amanah_steps as $amanah_i => $amanah_s ) : ?>
						<?php if ( ! empty( $amanah_s['image'] ) ) : ?>
							<picture><img<?php echo 0 === $amanah_i ? ' class="is-on"' : ''; ?> data-i="<?php echo (int) $amanah_i; ?>" data-k="<?php echo esc_attr( $amanah_key( $amanah_s['image'] ) ); ?>" src="<?php echo esc_url( amanah_asset( 'images/' . $amanah_s['image'] ) ); ?>" width="1568" height="1041" loading="lazy" alt="<?php echo esc_attr( $amanah_s['alt'] ?? '' ); ?>"></picture>
						<?php endif; ?>
					<?php endforeach; ?>
					<div class="cap" aria-hidden="true"><span class="story__cap"><?php echo esc_html( $amanah_first ); ?></span><div class="bars"><?php foreach ( $amanah_steps as $amanah_i => $amanah_s ) : ?><i<?php echo 0 === $amanah_i ? ' class="is-on"' : ''; ?>></i><?php endforeach; ?></div></div>
				</div>
				<div class="story__steps">
					<?php foreach ( $amanah_steps as $amanah_i => $amanah_s ) : ?>
						<article class="step<?php echo 0 === $amanah_i ? ' is-on' : ''; ?>" data-i="<?php echo (int) $amanah_i; ?>" data-cap="<?php echo esc_attr( $amanah_s['cap'] ?? '' ); ?>">
							<?php if ( ! empty( $amanah_s['key'] ) ) : ?>
								<p class="k"><?php echo esc_html( $amanah_s['key'] ); ?></p>
							<?php endif; ?>
							<?php if ( isset( $amanah_s['num'] ) && '' !== (string) $amanah_s['num'] ) : ?>
								<span class="num"><?php echo esc_html( $amanah_s['num'] ); ?><?php if ( ! empty( $amanah_s['unit'] ) ) : ?><small><?php echo esc_html( $amanah_s['unit'] ); ?></small><?php endif; ?></span>
							<?php endif; ?>
							<h3><?php echo amanah_inline( $amanah_s['title'] ?? '' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></h3>
							<?php if ( ! empty( $amanah_s['text'] ) ) : ?>
								<p><?php echo amanah_inline( $amanah_s['text'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
							<?php endif; ?>
							<?php if ( ! empty( $amanah_s['chips'] ) ) : ?>
								<ul class="chips"><?php foreach ( (array) $amanah_s['chips'] as $amanah_chip ) : ?><li><?php echo esc_html( $amanah_chip ); ?></li><?php endforeach; ?></ul>
							<?php endif; ?>
							<?php
							switch ( $amanah_s['line'] ?? '' ) {
								case 'power':
									echo '<canvas class="l-power" aria-hidden="true"></canvas>';
									break;
								case 'waves':
									echo '<canvas class="waves" aria-hidden="true"></canvas>';
									break;
								case 'audit':
									echo '<canvas class="sline l-audit2" aria-hidden="true"></canvas>';
									break;
								case 'net':
									echo '<canvas class="l-net" aria-hidden="true"></canvas>';
									break;
								case 'conv':
									echo '<div class="conv"><svg class="sline l-conv" data-line="conv" aria-hidden="true"></svg><span class="conv__pt"><i></i><b class="conv__lbl">' . esc_html( $amanah_a['convLabel'] ) . '</b></span></div>';
									break;
							}
							?>
							<?php if ( ! empty( $amanah_s['image'] ) ) : ?>
								<div class="mimg"><picture><img src="<?php echo esc_url( amanah_asset( 'images/' . $amanah_s['image'] ) ); ?>" width="1568" height="1041" loading="lazy" alt=""></picture></div>
							<?php endif; ?>
						</article>
					<?php endforeach; ?>
				</div>
			</div>
		<?php endif; ?>
		<?php if ( ! empty( $amanah_a['carriers'] ) ) : ?>
			<div class="netband" data-reveal>
				<div>
					<h3><?php echo amanah_inline( $amanah_a['carriersTitle'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></h3>
					<?php if ( $amanah_a['carriersText'] ) : ?>
						<p><?php echo amanah_inline( $amanah_a['carriersText'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
					<?php endif; ?>
				</div>
				<ul class="carriers">
					<?php foreach ( (array) $amanah_a['carriers'] as $amanah_c ) : ?>
						<li><b><?php echo esc_html( $amanah_c['name'] ?? '' ); ?></b><span><?php echo esc_html( $amanah_c['kind'] ?? '' ); ?></span></li>
					<?php endforeach; ?>
					<?php if ( ! empty( $amanah_more['value'] ) ) : ?>
						<li class="more"><b><?php echo esc_html( $amanah_more['value'] ); ?></b><span><?php echo esc_html( $amanah_more['label'] ?? '' ); ?></span></li>
					<?php endif; ?>
				</ul>
			</div>
		<?php endif; ?>
	</div>
</section>
