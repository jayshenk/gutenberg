/**
 * WordPress dependencies
 */
import { Component, Fragment, compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import InlineInsertionPoint from './inline-insertion-point';
import MediaUpload from '../media-upload';

class InlineBlocks extends Component {
	constructor() {
		super( ...arguments );

		this.insert = this.insert.bind( this );
		this.onSelectMedia = this.onSelectMedia.bind( this );
		this.openMediaLibrary = this.openMediaLibrary.bind( this );
		this.closeMediaLibrary = this.closeMediaLibrary.bind( this );
		this.state = { mediaLibraryOpen: false };
	}

	componentDidMount() {
		// When moving between two different RichText with the keyboard, we need to
		// make sure `setInsertAvailable` is called after `setInsertUnavailable`
		// from previous RichText so that editor state is correct
		setTimeout( this.props.setInsertAvailable );
	}

	componentDidUpdate( prevProps ) {
		if (
			this.props.inlineBlockForInsert &&
			! prevProps.inlineBlockForInsert
		) {
			this.insert();
		}
	}

	componentWillUnmount() {
		this.props.setInsertUnavailable();
	}

	insert() {
		const {
			inlineBlockForInsert,
			completeInsert,
			editor,
		} = this.props;

		if ( inlineBlockForInsert.type === 'image' ) {
			this.openMediaLibrary();
		} else {
			editor.insertContent( inlineBlockForInsert.render() );
			completeInsert();
		}
	}

	onSelectMedia( media ) {
		const {
			editor,
			inlineBlockForInsert,
			completeInsert,
		} = this.props;
		const img = inlineBlockForInsert.render( media );

		editor.insertContent( img );
		completeInsert();
		this.closeMediaLibrary();
	}

	openMediaLibrary() {
		this.setState( { mediaLibraryOpen: true } );
	}

	closeMediaLibrary() {
		this.setState( { mediaLibraryOpen: false } );
	}

	render() {
		const {
			isInlineInsertionPointVisible,
			getInsertPosition,
		} = this.props;
		const { mediaLibraryOpen } = this.state;

		return (
			<Fragment>
				{ isInlineInsertionPointVisible &&
					<InlineInsertionPoint
						style={ getInsertPosition() }
					/>
				}
				{ mediaLibraryOpen &&
					<MediaUpload
						type="image"
						onSelect={ this.onSelectMedia }
						onClose={ this.closeMediaLibrary }
						render={ ( { open } ) => {
							open();
							return null;
						} }
					/>
				}
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			isInlineInsertionPointVisible,
			getInlineBlockForInsert,
		} = select( 'core/editor' );

		return {
			isInlineInsertionPointVisible: isInlineInsertionPointVisible(),
			inlineBlockForInsert: getInlineBlockForInsert(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			setInlineInsertAvailable,
			setInlineInsertUnavailable,
			completeInlineInsert,
		} = dispatch( 'core/editor' );

		return {
			setInsertAvailable: setInlineInsertAvailable,
			setInsertUnavailable: setInlineInsertUnavailable,
			completeInsert: completeInlineInsert,
		};
	} ),
] )( InlineBlocks );