<?php
/**
 * Plan picker (sample: section#plans). The first plan is rendered here so the section reads
 * without JavaScript and in the editor preview; view.js takes over from the data-plans JSON
 * (tabs, stepper, 3D rack via window.Rack3D with the 2D rack as fallback, quote link).
 *
 * Plan data: id, tab, from, name, badge, who, list[], pricing {mode: perUnit|fixed|quoted,
 * amount, unit}, optional step {min, max, start, label, unitWord, one}, and for the
 * rack diagram either comps/open/word/size (sections of one cabinet) or suite:true.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_a     = $attributes;
$amanah_plans = array_values( array_filter( (array) $amanah_a['plans'], 'is_array' ) );
if ( ! $amanah_plans ) {
	return;
}

$amanah_uid   = wp_unique_id( 'plans-' );
$amanah_first = $amanah_plans[0];
$amanah_step  = ! empty( $amanah_first['step'] ) ? (array) $amanah_first['step'] : null;
$amanah_qty   = $amanah_step ? (int) ( $amanah_step['start'] ?? $amanah_step['min'] ?? 1 ) : 0;

// Same wording as view.js price()/unit().
$amanah_price = function ( $p, $n ) {
	$pr     = isset( $p['pricing'] ) ? (array) $p['pricing'] : array();
	$mode   = $pr['mode'] ?? 'quoted';
	$amount = (float) ( $pr['amount'] ?? 0 );
	if ( 'perUnit' === $mode ) {
		$word = $p['step']['unitWord'] ?? 'U';
		return array(
			'$' . number_format( $amount * $n ),
			$n > 1 ? sprintf( 'CAD / month, %d %s at $%s each', $n, $word, number_format( $amount ) ) : 'CAD / month',
		);
	}
	if ( 'fixed' === $mode ) {
		return array( '$' . number_format( $amount ), $pr['unit'] ?? 'CAD / month' );
	}
	return array( $pr['label'] ?? 'Quoted', $pr['unit'] ?? '' );
};
list( $amanah_p0, $amanah_u0 ) = $amanah_price( $amanah_first, $amanah_qty );

$amanah_wrapper = array(
	'class'           => 'sec paper',
	'aria-labelledby' => $amanah_uid . '-h',
);
if ( empty( $amanah_a['anchor'] ) ) {
	$amanah_wrapper['id'] = 'plans';
}

$amanah_contact = amanah_url( $amanah_a['contactUrl'] );
$amanah_query   = array( 'plan' => rawurlencode( (string) ( $amanah_first['id'] ?? '' ) ) );
if ( $amanah_step ) {
	$amanah_query['qty'] = $amanah_qty;
}
$amanah_cta = add_query_arg( $amanah_query, $amanah_contact );
?>
<section <?php echo get_block_wrapper_attributes( $amanah_wrapper ); ?>>
<div class="wrap">
<div class="head head--split" data-reveal>
<div style="display:grid;gap:20px">
<h2 id="<?php echo esc_attr( $amanah_uid ); ?>-h"><?php echo amanah_inline( $amanah_a['heading'] ); // phpcs:ignore WordPress.Security.EscapeOutput -- kses-filtered. ?></h2>
</div>
<?php if ( $amanah_a['intro'] ) : ?><p><?php echo amanah_inline( $amanah_a['intro'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p><?php endif; ?>
</div>
<div class="plans" data-plans="<?php echo esc_attr( wp_json_encode( $amanah_plans ) ); ?>" data-contact-url="<?php echo esc_url( $amanah_contact ); ?>">
<div class="plans__tabs" role="tablist" aria-label="<?php esc_attr_e( 'Colocation plans', 'amanah' ); ?>" data-reveal>
<?php foreach ( $amanah_plans as $amanah_i => $amanah_p ) : ?>
<button type="button" role="tab" id="<?php echo esc_attr( $amanah_uid . '-tab-' . ( $amanah_p['id'] ?? $amanah_i ) ); ?>" aria-controls="<?php echo esc_attr( $amanah_uid ); ?>-panel" aria-selected="<?php echo 0 === $amanah_i ? 'true' : 'false'; ?>" tabindex="<?php echo 0 === $amanah_i ? '0' : '-1'; ?>"><b><?php echo esc_html( $amanah_p['tab'] ?? '' ); ?></b><span><?php echo esc_html( $amanah_p['from'] ?? '' ); ?></span></button>
<?php endforeach; ?>
</div>
<div class="plan" id="<?php echo esc_attr( $amanah_uid ); ?>-panel" role="tabpanel" aria-labelledby="<?php echo esc_attr( $amanah_uid . '-tab-' . ( $amanah_first['id'] ?? 0 ) ); ?>" data-reveal style="--d:1">
<div class="plan__media rkm">
<div class="r3" role="img" aria-label="<?php esc_attr_e( 'Rack diagram', 'amanah' ); ?>"><div class="r3lab" aria-hidden="true"></div></div>
<div class="rkstage" role="img" aria-label="<?php esc_attr_e( 'Rack diagram', 'amanah' ); ?>"></div>
<p class="rkcap" aria-live="polite"></p>
<span class="badge"><?php echo esc_html( $amanah_first['badge'] ?? '' ); ?></span>
</div>
<div class="plan__body">
<div style="display:grid;gap:12px">
<h3 class="plan__name"><?php echo esc_html( $amanah_first['name'] ?? '' ); ?></h3>
<p class="plan__who"><?php echo esc_html( $amanah_first['who'] ?? '' ); ?></p>
</div>
<div class="plan__price" aria-live="polite"><b><?php echo esc_html( $amanah_p0 ); ?></b><span><?php echo esc_html( $amanah_u0 ); ?></span></div>
<div class="stepper"<?php echo $amanah_step ? '' : ' hidden'; ?>>
<p><?php echo esc_html( $amanah_step['label'] ?? '' ); ?></p>
<button type="button" data-step="-1" aria-label="<?php echo esc_attr( 'Remove one ' . ( $amanah_step['one'] ?? '' ) ); ?>"><?php echo amanah_icon( 'minus' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?></button>
<output aria-live="polite"><?php echo esc_html( $amanah_step ? $amanah_qty . ' ' . ( $amanah_step['unitWord'] ?? '' ) : '' ); ?></output>
<button type="button" data-step="1" aria-label="<?php echo esc_attr( 'Add one ' . ( $amanah_step['one'] ?? '' ) ); ?>"><?php echo amanah_icon( 'plus' ); // phpcs:ignore WordPress.Security.EscapeOutput -- static SVG. ?></button>
</div>
<ul class="plan__list">
<?php foreach ( (array) ( $amanah_first['list'] ?? array() ) as $amanah_li ) : ?>
<li><?php echo amanah_icon( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $amanah_li ); ?></li>
<?php endforeach; ?>
</ul>
<?php if ( $amanah_a['priceMatch'] ) : ?>
<div class="pm"><?php echo amanah_icon( 'shield' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><p><?php echo amanah_inline( $amanah_a['priceMatch'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p></div>
<?php endif; ?>
<div class="plan__cta">
<a class="btn btn--ink plan__quote" href="<?php echo esc_url( $amanah_cta . '#quote' ); ?>"><?php echo esc_html( $amanah_a['ctaLabel'] ); ?> <?php echo amanah_icon( 'arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
<?php if ( $amanah_a['compareLabel'] ) : ?>
<a class="btn btn--line" href="<?php echo esc_url( amanah_url( $amanah_a['compareUrl'] ) ); ?>"><?php echo esc_html( $amanah_a['compareLabel'] ); ?></a>
<?php endif; ?>
</div>
<?php if ( $amanah_a['note'] ) : ?><p class="plan__note"><?php echo amanah_inline( $amanah_a['note'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></p><?php endif; ?>
</div>
</div>
</div>
</div>
</section>
