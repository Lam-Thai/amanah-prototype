<?php
/**
 * Site footer: the sample's four columns, pointed at the consolidated page set.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

$amanah_cols = array(
	__( 'Colocation', 'amanah' )    => array(
		__( 'All plans', 'amanah' )     => '/colocation/#plans',
		__( 'Shared rack', 'amanah' )   => '/colocation/?plan=shared#plans',
		__( 'Full rack', 'amanah' )     => '/colocation/?plan=full#plans',
		__( 'Private cage', 'amanah' )  => '/colocation/?plan=suite#plans',
		__( 'AI and GPU', 'amanah' )    => '/high-density/',
	),
	__( 'More services', 'amanah' ) => array(
		__( 'Dedicated servers', 'amanah' ) => '/services/#dedicated-servers',
		__( 'Cloud Connect', 'amanah' )     => '/services/#cloud-connect',
		__( 'À La Carte', 'amanah' )        => '/services/#a-la-carte',
		__( 'Cross connects', 'amanah' )    => '/services/#cross-connects',
		__( 'Remote hands', 'amanah' )      => '/services/#remote-hands',
	),
);
$amanah_legal = array(
	__( 'Acceptable use', 'amanah' )           => '/legal/#acceptable-use',
	__( 'Service level agreement', 'amanah' )  => '/legal/#sla',
	__( 'Privacy', 'amanah' )                  => '/legal/#privacy',
	__( 'Data centre', 'amanah' )              => '/data-centre/',
	__( 'About', 'amanah' )                    => '/about/',
	__( 'News', 'amanah' )                     => '/news/',
	__( 'Careers', 'amanah' )                  => '/about/#careers',
);
$amanah_tel = 'tel:' . preg_replace( '/[^0-9+]/', '', $attributes['phone'] );
?>
<footer class="ftr">
	<div class="wrap">
		<div class="ftr__cols">
			<div>
				<p class="fh"><?php esc_html_e( 'Talk to sales', 'amanah' ); ?></p>
				<ul>
					<li><a class="tel" href="<?php echo esc_url( $amanah_tel ); ?>"><?php echo esc_html( $attributes['phone'] ); ?></a></li>
					<li><a href="<?php echo esc_url( amanah_url( '/contact/#quote' ) ); ?>"><?php esc_html_e( 'Get a quote', 'amanah' ); ?></a></li>
					<li><a href="<?php echo esc_url( amanah_url( '/contact/#tour' ) ); ?>"><?php esc_html_e( 'Book a tour', 'amanah' ); ?></a></li>
				</ul>
			</div>
			<?php foreach ( $amanah_cols as $amanah_head => $amanah_links ) : ?>
				<div>
					<p class="fh"><?php echo esc_html( $amanah_head ); ?></p>
					<ul>
						<?php foreach ( $amanah_links as $amanah_label => $amanah_path ) : ?>
							<li><a href="<?php echo esc_url( amanah_url( $amanah_path ) ); ?>"><?php echo esc_html( $amanah_label ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endforeach; ?>
			<div>
				<p class="fh"><?php esc_html_e( 'Data centre', 'amanah' ); ?></p>
				<address>151 Front Street West, Suite 341<br>Toronto, ON M5J 2N1</address>
				<p class="fh" style="margin-top:32px"><?php esc_html_e( 'Head office', 'amanah' ); ?></p>
				<address>123 Front Street West, Suite 1206<br>Toronto, ON M5J 2M2</address>
			</div>
		</div>
		<div class="ftr__big" aria-hidden="true"><?php echo esc_html( $attributes['bigWord'] ); ?></div>
		<div class="ftr__legal">
			<span>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> Amanah Tech Inc.</span>
			<?php foreach ( $amanah_legal as $amanah_label => $amanah_path ) : ?>
				<a href="<?php echo esc_url( amanah_url( $amanah_path ) ); ?>"><?php echo esc_html( $amanah_label ); ?></a>
			<?php endforeach; ?>
		</div>
	</div>
</footer>
