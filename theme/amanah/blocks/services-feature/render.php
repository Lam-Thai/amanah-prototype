<?php
/**
 * Service feature: one service as a full section, copy beside a visual.
 *
 * Visual: a photo (image + alt, optional chip) or, with no image, a stack of rows adding up to
 * a total (stack[]: { k, v }, stackTotal: { k, v }). Either can carry a network part below it:
 * a line graphic from assets/js/lines.js (line: net | conv | "") and a grid of networks
 * (nodes[]: { name, kind }, more: { value, label }).
 * bullets[] are strings (inline <em>/<mark class="verify"> allowed).
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a       = $attributes;
$amanah_h_id    = wp_unique_id( 'sf-h-' );
$amanah_paper   = ! empty( $amanah_a['paper'] );
$amanah_image   = (string) $amanah_a['image'];
$amanah_stack   = array_values( array_filter( (array) $amanah_a['stack'], 'is_array' ) );
$amanah_total   = (array) $amanah_a['stackTotal'];
$amanah_nodes   = array_values( array_filter( (array) $amanah_a['nodes'], 'is_array' ) );
$amanah_more    = (array) $amanah_a['more'];
$amanah_line    = in_array( $amanah_a['line'], array( 'net', 'conv' ), true ) ? $amanah_a['line'] : '';
$amanah_bullets = array_values( array_filter( (array) $amanah_a['bullets'], 'is_string' ) );
$amanah_has_net = $amanah_line || $amanah_nodes;
$amanah_arrow   = amanah_icon( 'arrow' );

$amanah_class = 'sec sf' . ( $amanah_paper ? ' paper' : '' ) . ( ! empty( $amanah_a['flip'] ) ? ' sf--flip' : '' );
$amanah_media = 'sf__media' . ( $amanah_image ? '' : ' sf__media--panel' ) . ( $amanah_has_net ? ' sf__media--net' : '' );
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => $amanah_class, 'aria-labelledby' => $amanah_h_id ) ); ?>>
	<div class="wrap">
		<div class="sf__grid">
			<div class="sf__copy" data-reveal>
				<?php if ( $amanah_a['eyebrow'] ) : ?>
					<p class="tag"><?php echo esc_html( $amanah_a['eyebrow'] ); ?></p>
				<?php endif; ?>
				<h2 id="<?php echo esc_attr( $amanah_h_id ); ?>"><?php echo amanah_inline( $amanah_a['title'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
				<?php if ( $amanah_a['text'] ) : ?>
					<p class="sf__text"><?php echo amanah_inline( $amanah_a['text'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
				<?php endif; ?>
				<?php if ( '' !== (string) $amanah_a['price'] ) : ?>
					<p class="sf__price">
						<?php if ( $amanah_a['priceLead'] ) : ?><span class="sf__lead"><?php echo amanah_inline( $amanah_a['priceLead'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><?php endif; ?>
						<b><?php echo amanah_inline( $amanah_a['price'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></b>
						<?php if ( $amanah_a['priceUnit'] ) : ?><span><?php echo amanah_inline( $amanah_a['priceUnit'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><?php endif; ?>
					</p>
				<?php endif; ?>
				<?php if ( $amanah_bullets ) : ?>
					<ul class="sf__list">
						<?php foreach ( $amanah_bullets as $amanah_b ) : ?>
							<li><?php echo amanah_icon( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?><span><?php echo amanah_inline( $amanah_b ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
				<?php if ( $amanah_a['ctaLabel'] || $amanah_a['secondaryLabel'] ) : ?>
					<div class="sf__cta">
						<?php if ( $amanah_a['ctaLabel'] ) : ?>
							<a class="btn <?php echo $amanah_paper ? 'btn--ink' : 'btn--red'; ?>" href="<?php echo esc_url( amanah_url( $amanah_a['ctaUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['ctaLabel'] ); ?> <?php echo $amanah_arrow; // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?></a>
						<?php endif; ?>
						<?php if ( $amanah_a['secondaryLabel'] ) : ?>
							<a class="btn <?php echo $amanah_paper ? 'btn--line' : 'btn--ghost'; ?>" href="<?php echo esc_url( amanah_url( $amanah_a['secondaryUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['secondaryLabel'] ); ?></a>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>

			<div class="<?php echo esc_attr( $amanah_media ); ?>" data-reveal style="--d:1">
				<?php if ( $amanah_image ) : ?>
					<figure class="sf__frame">
						<picture><img src="<?php echo esc_url( amanah_asset( 'images/' . ltrim( $amanah_image, '/' ) ) ); ?>" width="1568" height="1041" loading="lazy" decoding="async" alt="<?php echo esc_attr( $amanah_a['alt'] ); ?>"></picture>
						<?php if ( $amanah_a['chipValue'] ) : ?>
							<figcaption class="sf__chip"><b><?php echo esc_html( $amanah_a['chipValue'] ); ?></b><?php if ( $amanah_a['chipLabel'] ) : ?><span><?php echo esc_html( $amanah_a['chipLabel'] ); ?></span><?php endif; ?></figcaption>
						<?php endif; ?>
					</figure>
				<?php elseif ( $amanah_stack ) : ?>
					<div class="sf__stack" aria-hidden="true">
						<?php
						$amanah_d = 0;
						foreach ( $amanah_stack as $amanah_i => $amanah_row ) :
							if ( $amanah_i ) :
								?>
								<i class="sf__op" data-reveal style="--d:<?php echo (int) ++$amanah_d; ?>">+</i>
							<?php endif; ?>
							<span class="sf__row" data-reveal style="--d:<?php echo (int) ( $amanah_i ? ++$amanah_d : $amanah_d ); ?>"><?php echo esc_html( $amanah_row['k'] ?? '' ); ?> <b><?php echo esc_html( $amanah_row['v'] ?? '' ); ?></b></span>
						<?php endforeach; ?>
						<?php if ( ! empty( $amanah_total['v'] ) ) : ?>
							<i class="sf__op" data-reveal style="--d:<?php echo (int) ++$amanah_d; ?>">=</i>
							<span class="sf__row sf__row--total" data-reveal style="--d:<?php echo (int) ++$amanah_d; ?>"><?php echo esc_html( $amanah_total['k'] ?? '' ); ?> <b><?php echo esc_html( $amanah_total['v'] ); ?></b></span>
						<?php endif; ?>
					</div>
				<?php endif; ?>

				<?php if ( $amanah_has_net ) : ?>
					<div class="sf__net">
						<?php if ( $amanah_a['nodesTitle'] ) : ?>
							<p class="sf__k"><?php echo esc_html( $amanah_a['nodesTitle'] ); ?></p>
						<?php endif; ?>
						<?php if ( 'net' === $amanah_line ) : ?>
							<canvas class="l-net" aria-hidden="true"></canvas>
						<?php elseif ( 'conv' === $amanah_line ) : ?>
							<div class="conv"><svg class="sline l-conv" data-line="conv" aria-hidden="true"></svg><span class="conv__pt" aria-hidden="true"><i></i><b class="conv__lbl"><?php echo esc_html( $amanah_a['lineLabel'] ); ?></b></span></div>
						<?php endif; ?>
						<?php if ( $amanah_nodes ) : ?>
							<ul class="carriers">
								<?php foreach ( $amanah_nodes as $amanah_n ) : ?>
									<li><b><?php echo esc_html( $amanah_n['name'] ?? '' ); ?></b><span><?php echo esc_html( $amanah_n['kind'] ?? '' ); ?></span></li>
								<?php endforeach; ?>
								<?php if ( ! empty( $amanah_more['value'] ) ) : ?>
									<li class="more"><b><?php echo esc_html( $amanah_more['value'] ); ?></b><span><?php echo esc_html( $amanah_more['label'] ?? '' ); ?></span></li>
								<?php endif; ?>
							</ul>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>
		</div>
	</div>
</section>
