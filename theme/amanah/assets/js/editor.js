/**
 * Editor side of every amanah/* block, with no build step.
 * Each block shows a live server-rendered preview; its simple attributes
 * (text, toggles, numbers) become fields in the block sidebar.
 * The list of blocks and fields comes from PHP (window.amanahBlocks).
 */
(function (wp) {
	var el = wp.element.createElement;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var C = wp.components;
	var ServerSideRender = wp.serverSideRender;

	function label(key) {
		return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); });
	}

	function field(key, type, props) {
		var value = props.attributes[key];
		var set = function (v) { var o = {}; o[key] = v; props.setAttributes(o); };
		if (type === 'boolean') {
			return el(C.ToggleControl, { key: key, label: label(key), checked: !!value, onChange: set, __nextHasNoMarginBottom: true });
		}
		if (type === 'number' || type === 'integer') {
			return el(C.TextControl, { key: key, type: 'number', label: label(key), value: value == null ? '' : value, onChange: function (v) { set(v === '' ? undefined : Number(v)); }, __nextHasNoMarginBottom: true });
		}
		return el(C.TextareaControl, { key: key, label: label(key), value: value || '', rows: (value || '').length > 60 ? 3 : 1, onChange: set, __nextHasNoMarginBottom: true });
	}

	Object.keys(window.amanahBlocks || {}).forEach(function (name) {
		var fields = window.amanahBlocks[name];
		var keys = Object.keys(fields);
		wp.blocks.registerBlockType(name, {
			edit: function (props) {
				var blockProps = useBlockProps({ className: 'amanah-editor-preview' });
				return el('div', blockProps,
					keys.length ? el(InspectorControls, null,
						el(C.PanelBody, { title: 'Content', initialOpen: true },
							keys.map(function (k) { return field(k, fields[k], props); })
						)
					) : null,
					el(ServerSideRender, { block: name, attributes: props.attributes, skipBlockSupportAttributes: true })
				);
			},
			save: function () { return null; }
		});
	});
})(window.wp);
