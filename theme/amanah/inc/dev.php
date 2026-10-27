<?php
/**
 * Local development conveniences. Loaded only when WP_ENVIRONMENT_TYPE is "local"
 * (set by blueprint.json); never active on the public Playground link or a real host.
 *
 * Keeps the browser signed in as the admin on wp-admin/wp-login, so editor checks
 * work without typing a password. Playground's own auto-login fires once per browser.
 *
 * @package Amanah
 */

defined( 'ABSPATH' ) || exit;

add_action(
	'init',
	function () {
		if ( is_user_logged_in() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- only matched below.
		if ( ! preg_match( '#/(wp-admin|wp-login\.php)#', $uri ) || false !== strpos( $uri, 'action=logout' ) ) {
			return;
		}
		$admin = get_user_by( 'id', 1 );
		if ( ! $admin ) {
			return;
		}
		wp_set_current_user( $admin->ID );
		wp_set_auth_cookie( $admin->ID, true );
		$to = isset( $_GET['redirect_to'] ) ? wp_unslash( $_GET['redirect_to'] ) : $uri; // phpcs:ignore WordPress.Security.NonceVerification, WordPress.Security.ValidatedSanitizedInput
		wp_safe_redirect( false !== strpos( $to, 'wp-login.php' ) ? admin_url() : $to );
		exit;
	},
	2
);
