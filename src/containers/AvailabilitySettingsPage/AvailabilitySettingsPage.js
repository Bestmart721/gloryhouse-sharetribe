import React, { useState, useEffect } from 'react';
import { bool, func, object, shape, string } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { ensureCurrentUser } from '../../util/data';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { H3, Page, UserNav, NamedLink, LayoutSingleColumn } from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import AvailabilitySettingsForm from './AvailabilitySettingsForm/AvailabilitySettingsForm';

import css from './AvailabilitySettingsPage.module.css';
import { initialValuesForUserFields, pickUserFieldsData } from '../../util/userHelpers';
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = momentLocalizer(moment)

const MyCalendar = (props) => (
  <div>
    <Calendar
      localizer={localizer}
      // events={myEventsList}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600 }}
      {...props}
    />
  </div>
)

const onImageUploadHandler = (values, fn) => {
  const { id, imageId, file } = values;
  if (file) {
    fn({ id, imageId, file });
  }
};

export const AvailabilitySettingsPageComponent = props => {
  const config = useConfiguration();
  const {
    currentUser,
    image,
    onImageUpload,
    onUpdateProfile,
    scrollingDisabled,
    updateInProgress,
    updateProfileError,
    uploadImageError,
    uploadInProgress,
    intl,
  } = props;

  const { userFields, userTypes = [] } = config.user;

  const handleSubmit = (values, userType) => {
    const { firstName, lastName, displayName, bio: rawBio, ...rest } = values;

    const displayNameMaybe = displayName
      ? { displayName: displayName.trim() }
      : { displayName: null };

    // Ensure that the optional bio is a string
    const bio = rawBio || '';

    const profile = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      ...displayNameMaybe,
      bio,
      publicData: {
        ...pickUserFieldsData(rest, 'public', userType, userFields),
      },
      protectedData: {
        ...pickUserFieldsData(rest, 'protected', userType, userFields),
      },
      privateData: {
        ...pickUserFieldsData(rest, 'private', userType, userFields),
      },
    };
    const uploadedImage = props.image;

    // Update profileImage only if file system has been accessed
    const updatedValues =
      uploadedImage && uploadedImage.imageId && uploadedImage.file
        ? { ...profile, profileImageId: uploadedImage.imageId }
        : profile;

    onUpdateProfile(updatedValues);
  };

  const user = ensureCurrentUser(currentUser);
  const {
    firstName,
    lastName,
    displayName,
    bio,
    publicData,
    protectedData,
    privateData,
  } = user?.attributes.profile;
  const { userType } = publicData || {};
  const profileImageId = user.profileImage ? user.profileImage.id : null;
  const profileImage = image || { imageId: profileImageId };
  const userTypeConfig = userTypes.find(config => config.userType === userType);
  const isDisplayNameIncluded = userTypeConfig?.defaultUserFields?.displayName !== false;
  // AvailabilitySettingsForm decides if it's allowed to show the input field.
  const displayNameMaybe = isDisplayNameIncluded && displayName ? { displayName } : {};

  const availabilitySettingsForm = user.id ? (
    <AvailabilitySettingsForm
      className={css.form}
      currentUser={currentUser}
      initialValues={{
        firstName,
        lastName,
        ...displayNameMaybe,
        bio,
        profileImage: user.profileImage,
        ...initialValuesForUserFields(publicData, 'public', userType, userFields),
        ...initialValuesForUserFields(protectedData, 'protected', userType, userFields),
        ...initialValuesForUserFields(privateData, 'private', userType, userFields),
      }}
      profileImage={profileImage}
      onImageUpload={e => onImageUploadHandler(e, onImageUpload)}
      uploadInProgress={uploadInProgress}
      updateInProgress={updateInProgress}
      uploadImageError={uploadImageError}
      updateProfileError={updateProfileError}
      onSubmit={values => handleSubmit(values, userType)}
      marketplaceName={config.marketplaceName}
      userFields={userFields}
      userTypeConfig={userTypeConfig}
    />
  ) : null;

  const title = intl.formatMessage({ id: 'ProfileSettingsPage.title' });

  const [events, setEvents] = useState([
    {
      title: 'Initial Event',
      start: new Date(),
      end: new Date(),
    },
  ]);

  // Helper function to add recurring events
  const generateRecurringEvents = (event, recurrenceRule) => {
    const { start, end, title } = event;
    const recurringEvents = [];

    if (recurrenceRule === 'Daily') {
      for (let i = 1; i <= 30; i++) {
        recurringEvents.push({
          title,
          start: moment(start).add(i, 'days').toDate(),
          end: moment(end).add(i, 'days').toDate(),
        });
      }
    } else if (recurrenceRule === 'Weekly') {
      for (let i = 1; i <= 10; i++) {
        recurringEvents.push({
          title,
          start: moment(start).add(i, 'weeks').toDate(),
          end: moment(end).add(i, 'weeks').toDate(),
        });
      }
    } else if (recurrenceRule === 'Monthly') {
      for (let i = 1; i <= 12; i++) {
        recurringEvents.push({
          title,
          start: moment(start).add(i, 'months').toDate(),
          end: moment(end).add(i, 'months').toDate(),
        });
      }
    }

    return recurringEvents;
  };

  // Function to handle event creation
  const handleSelectSlot = ({ start, end }) => {
    const title = window.prompt('New Event name');
    if (title) {
      const recurrenceRule = window.prompt('Recurrence (None, Daily, Weekly, Monthly)', 'None');
      const newEvent = { start, end, title };
      const recurringEvents = recurrenceRule !== 'None' ? generateRecurringEvents(newEvent, recurrenceRule) : [];

      setEvents((prevEvents) => [
        ...prevEvents,
        newEvent,
        ...recurringEvents,
      ]);
    }
  };

  // Function to handle event editing
  const handleSelectEvent = (event) => {
    const newTitle = window.prompt('Edit Event name', event.title);
    if (newTitle) {
      const newStartStr = window.prompt('Edit Start Time (YYYY-MM-DD HH:mm)', moment(event.start).format('YYYY-MM-DD HH:mm'));
      const newEndStr = window.prompt('Edit End Time (YYYY-MM-DD HH:mm)', moment(event.end).format('YYYY-MM-DD HH:mm'));

      const newStart = new Date(newStartStr);
      const newEnd = new Date(newEndStr);

      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt === event ? { ...evt, title: newTitle, start: newStart, end: newEnd } : evt
        )
      );
    }
  };

  const dayOfWeekMap = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6
  };

  useEffect(() => {
    const events = [];

    // Number of weeks to generate events for
    const weeksToGenerate = 4;
    
    for (let i = 0; i < weeksToGenerate; i++) {
      const today = new Date();
      const startDate = new Date(today);
      const endDate = new Date(today);
    
      // Set start date to the beginning of the current week
      startDate.setDate(today.getDate() - today.getDay() + 7 * i);
      // Set end date to the end of the current week
      endDate.setDate(today.getDate() - today.getDay() + 6 + 7 * i);
    
      props.transactions?.forEach(listing => {
        const { id, attributes } = listing;
        const { title, availabilityPlan } = attributes;
    
        if (availabilityPlan && availabilityPlan.entries) {
          availabilityPlan.entries.forEach(entry => {
            const { dayOfWeek, startTime, endTime } = entry;
            const targetDay = new Date(startDate);
    
            // Calculate the target day of the week for the current entry
            const diff = (dayOfWeekMap[dayOfWeek] - startDate.getDay() + 7) % 7;
            targetDay.setDate(startDate.getDate() + diff);
    
            const start = new Date(targetDay);
            const end = new Date(targetDay);
    
            const [startHour, startMinute] = startTime.split(":").map(Number);
            const [endHour, endMinute] = endTime.split(":").map(Number);
    
            start.setHours(startHour, startMinute);
            end.setHours(endHour, endMinute);
    
            events.push({
              id: id.uuid,
              title: title,
              start: start,
              end: end,
              allDay: false
            });
          });
        }
      });
    }

    setEvents(events)
  }, [props.listings])

  return (
    <Page className={css.root} title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn
        topbar={
          <>
            <TopbarContainer />
            <UserNav currentPage="AvailabilitySettingsPage" />
          </>
        }
        footer={<FooterContainer />}
      >
        <div className={css.content}>
          <MyCalendar selectable events={events} onSelectSlot={handleSelectSlot} onSelectEvent={handleSelectEvent} />
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

AvailabilitySettingsPageComponent.defaultProps = {
  currentUser: null,
  uploadImageError: null,
  updateProfileError: null,
  image: null,
  config: null,
};

AvailabilitySettingsPageComponent.propTypes = {
  currentUser: propTypes.currentUser,
  image: shape({
    id: string,
    imageId: propTypes.uuid,
    file: object,
    uploadedImage: propTypes.image,
  }),
  scrollingDisabled: bool.isRequired,
  updateProfileError: propTypes.error,
  uploadImageError: propTypes.error,

  // from useConfiguration()
  config: object,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  const {
    currentPageResultIds,
  } = state.ManageListingsPage;
  const {
    transactions,
    uploadImageError,
    uploadInProgress,
    updateInProgress,
    updateProfileError,
  } = state.AvailabilitySettingsPage;
  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentPageResultIds,
    transactions,
  };
};

const mapDispatchToProps = dispatch => ({
  // onImageUpload: data => dispatch(uploadImage(data)),
  // onUpdateProfile: data => dispatch(updateProfile(data)),
});

const AvailabilitySettingsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(AvailabilitySettingsPageComponent);

export default AvailabilitySettingsPage;
