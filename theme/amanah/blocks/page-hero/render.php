<?php
/**
 * Page hero for inner pages. "facts" is a list of { "value": "25 kW", "label": "per rack" }.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a = $attributes;
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'phero' ) ); ?>>
	<?php if ( $amanah_a['image'] ) : ?>
		<div class="phero__img" aria-hidden="true"><img src="<?php echo esc_url( amanah_asset( 'images/' . $amanah_a['image'] ) ); ?>" alt="" fetchpriority="high" decoding="async"></div>
	<?php endif; ?>
	<div class="wrap">
		<div class="phero__in">
			<?php if ( $amanah_a['eyebrow'] ) : ?>
				<p class="phero__k"><?php echo esc_html( $amanah_a['eyebrow'] ); ?></p>
			<?php endif; ?>
			<h1><?php echo amanah_inline( $amanah_a['title'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h1>
			<?php if ( $amanah_a['lede'] ) : ?>
				<p class="phero__lede"><?php echo amanah_inline( $amanah_a['lede'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
			<?php endif; ?>
			<?php if ( $amanah_a['primaryLabel'] || $amanah_a['secondaryLabel'] ) : ?>
				<div class="phero__cta">
					<?php if ( $amanah_a['primaryLabel'] ) : ?>
						<a class="btn btn--red" href="<?php echo esc_url( amanah_url( $amanah_a['primaryUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['primaryLabel'] ); ?> <?php echo amanah_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
					<?php endif; ?>
					<?php if ( $amanah_a['secondaryLabel'] ) : ?>
						<a class="btn btn--ghost" href="<?php echo esc_url( amanah_url( $amanah_a['secondaryUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['secondaryLabel'] ); ?></a>
					<?php endif; ?>
				</div>
			<?php endif; ?>
			<?php if ( ! empty( $amanah_a['facts'] ) ) : ?>
				<ul class="phero__facts">
					<?php foreach ( (array) $amanah_a['facts'] as $amanah_fact ) : ?>
						<li><b><?php echo amanah_inline( $amanah_fact['value'] ?? '' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></b><span><?php echo esc_html( $amanah_fact['label'] ?? '' ); ?></span></li>
					<?php endforeach; ?>
				</ul>
			<?php endif; ?>
		</div>
	</div>
</section>
