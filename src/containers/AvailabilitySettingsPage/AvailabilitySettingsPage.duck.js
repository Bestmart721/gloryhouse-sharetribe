import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import { currentUserShowSuccess } from '../../ducks/user.duck';
import { getProcess, resolveLatestProcessName } from '../../transactions/transaction';

// ================ Action types ================ //

export const CLEAR_UPDATED_FORM = 'app/AvailabilitySettingsPage/CLEAR_UPDATED_FORM';

export const UPLOAD_IMAGE_REQUEST = 'app/AvailabilitySettingsPage/UPLOAD_IMAGE_REQUEST';
export const UPLOAD_IMAGE_SUCCESS = 'app/AvailabilitySettingsPage/UPLOAD_IMAGE_SUCCESS';
export const UPLOAD_IMAGE_ERROR = 'app/AvailabilitySettingsPage/UPLOAD_IMAGE_ERROR';

export const UPDATE_PROFILE_REQUEST = 'app/AvailabilitySettingsPage/UPDATE_PROFILE_REQUEST';
export const UPDATE_PROFILE_SUCCESS = 'app/AvailabilitySettingsPage/UPDATE_PROFILE_SUCCESS';
export const UPDATE_PROFILE_ERROR = 'app/AvailabilitySettingsPage/UPDATE_PROFILE_ERROR';

export const FETCH_ACCEPTED_TRANSACTIONS = 'app/AvailabilitySettingsPage/FETCH_ACCEPTED_TRANSACTIONS';

// ================ Reducer ================ //

const initialState = {
  image: null,
  uploadImageError: null,
  uploadInProgress: false,
  updateInProgress: false,
  updateProfileError: null,
  transactions: []
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case UPLOAD_IMAGE_REQUEST:
      // payload.params: { id: 'tempId', file }
      return {
        ...state,
        image: { ...payload.params },
        uploadInProgress: true,
        uploadImageError: null,
      };
    case UPLOAD_IMAGE_SUCCESS: {
      // payload: { id: 'tempId', uploadedImage }
      const { id, uploadedImage } = payload;
      const { file } = state.image || {};
      const image = { id, imageId: uploadedImage.id, file, uploadedImage };
      return { ...state, image, uploadInProgress: false };
    }
    case UPLOAD_IMAGE_ERROR: {
      // eslint-disable-next-line no-console
      return { ...state, image: null, uploadInProgress: false, uploadImageError: payload.error };
    }

    case UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        updateInProgress: true,
        updateProfileError: null,
      };
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        image: null,
        updateInProgress: false,
      };
    case UPDATE_PROFILE_ERROR:
      return {
        ...state,
        image: null,
        updateInProgress: false,
        updateProfileError: payload,
      };

    case CLEAR_UPDATED_FORM:
      return { ...state, updateProfileError: null, uploadImageError: null };

    case FETCH_ACCEPTED_TRANSACTIONS:
      return {...state, transactions: payload.data}

    default:
      return state;
  }
}

// ================ Selectors ================ //

// ================ Action creators ================ //

export const clearUpdatedForm = () => ({
  type: CLEAR_UPDATED_FORM,
});

// SDK method: images.upload
export const uploadImageRequest = params => ({ type: UPLOAD_IMAGE_REQUEST, payload: { params } });
export const uploadImageSuccess = result => ({ type: UPLOAD_IMAGE_SUCCESS, payload: result.data });
export const uploadImageError = error => ({
  type: UPLOAD_IMAGE_ERROR,
  payload: error,
  error: true,
});

// SDK method: sdk.currentUser.updateProfile
export const updateProfileRequest = params => ({
  type: UPDATE_PROFILE_REQUEST,
  payload: { params },
});
export const updateProfileSuccess = result => ({
  type: UPDATE_PROFILE_SUCCESS,
  payload: result.data,
});
export const updateProfileError = error => ({
  type: UPDATE_PROFILE_ERROR,
  payload: error,
  error: true,
});


export const queryAcceptedTransactions = transactions => ({
  type: FETCH_ACCEPTED_TRANSACTIONS,
  payload: { data: transactions },
});

// ================ Thunk ================ //

// Images return imageId which we need to map with previously generated temporary id
export function uploadImage(actionPayload) {
  return (dispatch, getState, sdk) => {
    const id = actionPayload.id;
    dispatch(uploadImageRequest(actionPayload));

    const bodyParams = {
      image: actionPayload.file,
    };
    const queryParams = {
      expand: true,
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    };

    return sdk.images
      .upload(bodyParams, queryParams)
      .then(resp => {
        const uploadedImage = resp.data.data;
        dispatch(uploadImageSuccess({ data: { id, uploadedImage } }));
      })
      .catch(e => dispatch(uploadImageError({ id, error: storableError(e) })));
  };
}

export const updateProfile = actionPayload => {
  return (dispatch, getState, sdk) => {
    dispatch(updateProfileRequest());

    const queryParams = {
      expand: true,
      include: ['profileImage'],
      'fields.image': ['variants.square-small', 'variants.square-small2x'],
    };

    return sdk.currentUser
      .updateProfile(actionPayload, queryParams)
      .then(response => {
        dispatch(updateProfileSuccess(response));

        const entities = denormalisedResponseEntities(response);
        if (entities.length !== 1) {
          throw new Error('Expected a resource in the sdk.currentUser.updateProfile response');
        }
        const currentUser = entities[0];

        // Update current user in state.user.currentUser through user.duck.js
        dispatch(currentUserShowSuccess(currentUser));
      })
      .catch(e => dispatch(updateProfileError(storableError(e))));
  };
};

export const loadData = (params, search, config) => {
  return (dispatch, getState, sdk) => {
    return sdk.transactions
      .query({ status: "accepted", only: "sale" })
      .then(response => {
        let transactions = response.data.data
        transactions = transactions.filter(transaction => {
          const processName = resolveLatestProcessName(transaction?.attributes?.processName);
          const process = getProcess(processName);
          const { getState } = process;
          const processState = getState(transaction);
          return processState == 'accepted'
        });
        
        // dispatch(addOwnEntities(response));
        dispatch(queryAcceptedTransactions(transactions));
        return ;
      })
      .catch(e => {
        // dispatch(queryListingsError(storableError(e)));
        throw e;
      });
  }
};