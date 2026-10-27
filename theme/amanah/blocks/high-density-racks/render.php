<?php
/**
 * Rack density comparison: the same cluster ("servers" × "serverKw") placed in racks with
 * different power budgets. Each row draws the cabinets it needs; filled slots light up
 * bottom-up when the row scrolls into view (CSS only, keyed on site.js's .is-in).
 *
 * rows[]: { label, kw, note, tone: red|muted }
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a       = $attributes;
$amanah_kw_srv  = max( 0.1, (float) $amanah_a['serverKw'] );
$amanah_servers = max( 1, (int) $amanah_a['servers'] );
$amanah_slots   = max( 1, min( 24, (int) $amanah_a['slots'] ) );
$amanah_max_cab = 12;
$amanah_h_id    = wp_unique_id( 'dens-h-' );

// Work out each row: servers per rack (power-bound, then space-bound) and racks needed.
$amanah_rows = array();
$amanah_top  = 0;
foreach ( (array) $amanah_a['rows'] as $amanah_r ) {
	if ( ! is_array( $amanah_r ) ) {
		continue;
	}
	$amanah_kw  = max( 0, (float) ( $amanah_r['kw'] ?? 0 ) );
	$amanah_per = max( 1, min( $amanah_slots, (int) floor( $amanah_kw / $amanah_kw_srv ) ) );
	$amanah_rows[] = array(
		'label' => (string) ( $amanah_r['label'] ?? '' ),
		'note'  => (string) ( $amanah_r['note'] ?? '' ),
		'tone'  => 'red' === ( $amanah_r['tone'] ?? '' ) ? 'red' : 'muted',
		'kw'    => $amanah_kw,
		'per'   => $amanah_per,
		'racks' => (int) ceil( $amanah_servers / $amanah_per ),
	);
	$amanah_top = max( $amanah_top, $amanah_kw );
}

// "4×" when the last row needs clearly more racks than the first.
$amanah_ratio = '';
if ( count( $amanah_rows ) > 1 ) {
	$amanah_x = end( $amanah_rows )['racks'] / max( 1, $amanah_rows[0]['racks'] );
	if ( $amanah_x >= 1.5 ) {
		$amanah_ratio = ( floor( $amanah_x ) == $amanah_x ? (string) (int) $amanah_x : number_format_i18n( $amanah_x, 1 ) ) . '×'; // phpcs:ignore Universal.Operators.StrictComparisons
	}
}

$amanah_num = function ( $n ) {
	return floor( $n ) == $n ? (string) (int) $n : number_format_i18n( $n, 1 ); // phpcs:ignore Universal.Operators.StrictComparisons
};
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'sec paper dens', 'aria-labelledby' => $amanah_h_id ) ); ?>>
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

		<ul class="dens__legend" data-reveal>
			<li><i class="dens-u on" aria-hidden="true"></i><?php echo amanah_inline( $amanah_a['serverLabel'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></li>
			<?php if ( $amanah_a['emptyLabel'] ) : ?>
				<li><i class="dens-u" aria-hidden="true"></i><?php echo amanah_inline( $amanah_a['emptyLabel'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></li>
			<?php endif; ?>
			<li class="dens__count"><?php echo esc_html( sprintf( '%d servers × %s kW', $amanah_servers, $amanah_num( $amanah_kw_srv ) ) ); ?></li>
		</ul>

		<div class="dens__rows">
			<?php foreach ( $amanah_rows as $amanah_i => $amanah_r ) : ?>
				<?php
				$amanah_label = sprintf(
					/* translators: 1: racks, 2: servers per rack, 3: empty slots per rack. */
					'%1$d racks with %2$d servers each, %3$d slots left empty in each',
					$amanah_r['racks'],
					$amanah_r['per'],
					$amanah_slots - $amanah_r['per']
				);
				$amanah_left  = $amanah_servers;
				$amanah_n     = 0;
				?>
				<div class="dens-row dens-row--<?php echo esc_attr( $amanah_r['tone'] ); ?>" data-reveal<?php echo $amanah_i ? ' style="--d:' . (int) min( $amanah_i, 3 ) . '"' : ''; ?>>
					<div class="dens-row__meta">
						<p class="dens-row__k"><?php echo esc_html( $amanah_r['label'] ); ?></p>
						<p class="dens-row__kw"><?php echo esc_html( $amanah_num( $amanah_r['kw'] ) ); ?><small>kW per rack</small></p>
						<span class="dens-meter" aria-hidden="true"><i style="--w:<?php echo esc_attr( $amanah_top ? round( $amanah_r['kw'] / $amanah_top, 3 ) : 0 ); ?>"></i></span>
						<?php if ( $amanah_r['note'] ) : ?>
							<p class="dens-row__note"><?php echo amanah_inline( $amanah_r['note'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
						<?php endif; ?>
					</div>
					<div class="dens-row__racks" role="img" aria-label="<?php echo esc_attr( $amanah_label ); ?>">
						<?php for ( $amanah_c = 0; $amanah_c < min( $amanah_r['racks'], $amanah_max_cab ); $amanah_c++ ) : ?>
							<span class="dens-cab">
								<?php
								$amanah_fill = min( $amanah_r['per'], $amanah_left );
								$amanah_left = max( 0, $amanah_left - $amanah_fill );
								for ( $amanah_s = 0; $amanah_s < $amanah_slots; $amanah_s++ ) {
									if ( $amanah_s < $amanah_fill ) {
										echo '<i class="dens-u on" style="--i:' . (int) min( $amanah_n++, 24 ) . '"></i>';
									} else {
										echo '<i class="dens-u"></i>';
									}
								}
								?>
							</span>
						<?php endfor; ?>
						<?php if ( $amanah_r['racks'] > $amanah_max_cab ) : ?>
							<span class="dens-more">+<?php echo (int) ( $amanah_r['racks'] - $amanah_max_cab ); ?></span>
						<?php endif; ?>
					</div>
					<p class="dens-row__total"><b><?php echo (int) $amanah_r['racks']; ?></b><span><?php echo esc_html( 1 === $amanah_r['racks'] ? 'rack' : 'racks' ); ?></span><span><?php echo esc_html( sprintf( '%d servers per rack', $amanah_r['per'] ) ); ?></span></p>
				</div>
			<?php endforeach; ?>
		</div>

		<?php if ( $amanah_ratio || $amanah_a['footnote'] ) : ?>
			<div class="dens__sum" data-reveal>
				<?php if ( $amanah_ratio ) : ?>
					<p class="dens__ratio"><b><?php echo esc_html( $amanah_ratio ); ?></b> <?php echo amanah_inline( $amanah_a['ratioText'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
				<?php endif; ?>
				<?php if ( $amanah_a['footnote'] ) : ?>
					<p class="dens__foot"><?php echo amanah_inline( $amanah_a['footnote'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</div>
</section>
