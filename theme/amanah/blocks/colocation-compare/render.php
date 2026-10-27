<?php
/**
 * Plan comparison: the colocation plans side by side. A real <table> (one row per plan) that
 * style.css restacks into cards below 1000px using each cell's data-label. Each row's link
 * opens the plan picker on this page with that plan selected (view.js), or reloads with
 * ?plan=<id>#plans when there is no picker.
 *
 * rows[]: { id, name, footprint, access, power, price, best, fill (0..1, share of one cabinet), racks (cabinets drawn, default 1) }
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a    = $attributes;
$amanah_rows = array_values( array_filter( (array) $amanah_a['rows'], 'is_array' ) );
if ( ! $amanah_rows ) {
	return;
}

$amanah_col  = wp_parse_args(
	(array) $amanah_a['columns'],
	array(
		'plan'      => 'Plan',
		'footprint' => 'Footprint',
		'access'    => 'Access',
		'power'     => 'Power',
		'price'     => 'From',
		'best'      => 'Best for',
	)
);
$amanah_keys = array( 'footprint', 'access', 'power', 'price', 'best' );
$amanah_hid  = wp_unique_id( 'cmp-h-' );
$amanah_base = amanah_url( $amanah_a['planUrl'] );
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'sec cmp-sec', 'aria-labelledby' => $amanah_hid ) ); ?>>
<div class="wrap">
<div class="head head--split" data-reveal>
<div style="display:grid;gap:20px">
<?php if ( $amanah_a['eyebrow'] ) : ?><p class="tag"><?php echo esc_html( $amanah_a['eyebrow'] ); ?></p><?php endif; ?>
<h2 id="<?php echo esc_attr( $amanah_hid ); ?>"><?php echo amanah_inline( $amanah_a['heading'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
</div>
<?php if ( $amanah_a['intro'] ) : ?><p><?php echo amanah_inline( $amanah_a['intro'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p><?php endif; ?>
</div>
<div class="cmp" data-reveal style="--d:1">
<table class="cmp__t" aria-labelledby="<?php echo esc_attr( $amanah_hid ); ?>">
<thead>
<tr>
<th scope="col"><?php echo esc_html( $amanah_col['plan'] ); ?></th>
<?php foreach ( $amanah_keys as $amanah_k ) : ?>
<th scope="col" class="cmp__<?php echo esc_attr( $amanah_k ); ?>"><?php echo esc_html( $amanah_col[ $amanah_k ] ); ?></th>
<?php endforeach; ?>
<th scope="col" class="cmp__go"><span class="cmp__sr"><?php echo esc_html( $amanah_a['chooseLabel'] ); ?></span></th>
</tr>
</thead>
<tbody>
<?php
foreach ( $amanah_rows as $amanah_r ) :
	$amanah_id    = sanitize_key( $amanah_r['id'] ?? '' );
	$amanah_fill  = isset( $amanah_r['fill'] ) ? max( 0, min( 1, (float) $amanah_r['fill'] ) ) : 0;
	$amanah_racks = max( 1, min( 4, (int) ( $amanah_r['racks'] ?? 1 ) ) );
	$amanah_href  = $amanah_id ? add_query_arg( 'plan', $amanah_id, $amanah_base ) . '#plans' : $amanah_base;
	?>
<tr data-plan="<?php echo esc_attr( $amanah_id ); ?>">
<th scope="row">
<span class="cmp__name"><?php echo esc_html( $amanah_r['name'] ?? '' ); ?></span>
<?php if ( $amanah_fill ) : ?>
<span class="cmp__rk" aria-hidden="true"><?php for ( $amanah_i = 0; $amanah_i < $amanah_racks; $amanah_i++ ) : ?><i style="--f:<?php echo esc_attr( (string) $amanah_fill ); ?>;--k:<?php echo (int) $amanah_i; ?>"></i><?php endfor; ?></span>
<?php endif; ?>
</th>
<?php foreach ( $amanah_keys as $amanah_k ) : ?>
<td class="cmp__<?php echo esc_attr( $amanah_k ); ?>" data-label="<?php echo esc_attr( $amanah_col[ $amanah_k ] ); ?>"><?php echo amanah_inline( $amanah_r[ $amanah_k ] ?? '' ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></td>
<?php endforeach; ?>
<td class="cmp__go"><a href="<?php echo esc_url( $amanah_href ); ?>" data-plan="<?php echo esc_attr( $amanah_id ); ?>"><span><?php echo esc_html( $amanah_a['chooseLabel'] ); ?><span class="cmp__sr"> <?php echo esc_html( $amanah_r['name'] ?? '' ); ?></span></span><i><?php echo amanah_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?></i></a></td>
</tr>
<?php endforeach; ?>
</tbody>
</table>
<?php if ( $amanah_a['note'] ) : ?><p class="cmp__note"><?php echo amanah_inline( $amanah_a['note'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p><?php endif; ?>
</div>
</div>
</section>
