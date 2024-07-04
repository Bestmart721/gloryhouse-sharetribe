import React from 'react';
import loadable from '@loadable/component';

import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

// import FallbackPage, { fallbackSections } from './FallbackPage';
import { ASSET_NAME } from './LemonadePage.duck';
import WhereByRoom from '../../components/VideoView/WhereByRoom';
import ErrorBoundary from './ErrorBoundary';

const PageBuilder = loadable(() =>
	import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

// Presentational component for LemonadePage
const LemonadePageComponent = props => {
	const { pageAssetsData, inProgress, error, user } = props;
	return (
		<PageBuilder
			pageAssetsData={{ sections: [] }}
			inProgress={inProgress}
			error={error}
		>
			<ErrorBoundary>
				<iframe src={`https://app.lemonado.io/shared/sp-3o9jdgair3oyno63s54v?users_userid=${user.id.uuid}`} style={{ width: '100%', height: 600, border: 'none' }} />
			</ErrorBoundary>
		</PageBuilder>
	);
};

LemonadePageComponent.propTypes = {
	pageAssetsData: object,
	inProgress: bool,
	error: propTypes.error,
};

const mapStateToProps = state => {
	const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
	const { currentUser } = state.user || {};
	const user = currentUser;
	return { pageAssetsData, inProgress, error, user };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LemonadePage = compose(connect(mapStateToProps))(LemonadePageComponent);

// const VIDEO_CALL_ASSET_NAME = ASSET_NAME;
export { LemonadePageComponent };

export default LemonadePage;
