import React, { Component } from 'react';
import { bool, string } from 'prop-types';
import { compose } from 'redux';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { injectIntl, intlShape } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
 
import css from './AvailabilitySettingsForm.module.css';
import EditListingAvailabilityPlanForm from '../../EditListingPage/EditListingWizard/EditListingAvailabilityPanel/EditListingAvailabilityPlanForm';

const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset


class AvailabilitySettingsFormComponent extends Component {
  constructor(props) {
    super(props);

    this.uploadDelayTimeoutId = null;
    this.state = { uploadDelay: false };
    this.submittedValues = {};
  }

  componentDidUpdate(prevProps) {
    // Upload delay is additional time window where Avatar is added to the DOM,
    // but not yet visible (time to load image URL from srcset)
    if (prevProps.uploadInProgress && !this.props.uploadInProgress) {
      this.setState({ uploadDelay: true });
      this.uploadDelayTimeoutId = window.setTimeout(() => {
        this.setState({ uploadDelay: false });
      }, UPLOAD_CHANGE_DELAY);
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.uploadDelayTimeoutId);
  }
  render() {
    return (
      <FinalForm
        {...this.props}
        mutators={{ ...arrayMutators }}
        render={fieldRenderProps => {

          return (
            <EditListingAvailabilityPlanForm
              listingTitle={this.props.initialValues.displayName || this.props.initialValues.firstName}
              weekdays={['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']}
              fetchErrors={{}}
              onSubmit={values => {console.log('submit with values:', values);}}
            />
          );
        }}
      />
    );
  }
}

AvailabilitySettingsFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  formId: null,
  uploadImageError: null,
  updateProfileError: null,
  updateProfileReady: false,
};

AvailabilitySettingsFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  formId: string,

  uploadImageError: propTypes.error,
  uploadInProgress: bool.isRequired,
  updateInProgress: bool.isRequired,
  updateProfileError: propTypes.error,
  updateProfileReady: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const AvailabilitySettingsForm = compose(injectIntl)(AvailabilitySettingsFormComponent);

AvailabilitySettingsForm.displayName = 'AvailabilitySettingsForm';

export default AvailabilitySettingsForm;
