import {
  getReviews,
  getRatingLike,
  getRatings,
  postReview,
  Review,
  RatingLikeResponse,
  RatingReview,
  ReturnedNewReview,
  deleteRating,
  ReturnedDeletedRating
} from "@/redux/actions/reviews";

import { createSlice } from "@reduxjs/toolkit";
import { Status } from "@/redux/reducers/index";
import { AppState } from "@/redux/store";

// TYPES
// *****************************

// GET ALL REVIEWS FOR A MOVIE
// *****************************
// type for value of reviews variable in redux store
interface Reviews {
  status: Status;
  success: boolean | null;
  message: string;
  page: number;
  total_pages: number | null;
  data: {
    reviews?: Review[];
  };
}

// default value for reviews
const initialReviewsState: Reviews = {
  status: "idle",
  success: null,
  message: "",
  page: 0,
  total_pages: null,
  data: {}
};

// GET RATING AND LIKE FOR A MOVIE
// ********************************
// type for value of ratingLike in redux store
interface RatingLike {
  status: Status;
  success: boolean | null;
  message: string;
  code: number | null;
  data: RatingLikeResponse | null;
}

const intialRatingLikeState: RatingLike = {
  status: "idle",
  success: null,
  message: "",
  code: null,
  data: null
};

// GET ALL RATINGS FOR A USER
// ***************************
// type for value of ratings variable in redux store
interface Ratings {
  status: Status;
  success: boolean | null;
  message: string;
  page: number;
  total_pages: number | null;
  ratings: RatingReview[] | null;
}

const initialRatingsState: Ratings = {
  status: "idle",
  success: null,
  message: "",
  page: 0,
  total_pages: null,
  ratings: null
};

// CREATE A NEW REVIEW IN THE DATABASE TYPES
// ******************************************
// type for value of newReview variable in redux store
interface NewReview {
  status: Status;
  success: boolean | null;
  code: number | null;
  message: string;
  data: ReturnedNewReview | null;
}

const initialNewReviewState: NewReview = {
  status: "idle",
  success: null,
  code: null,
  message: "",
  data: null
};

// DELETE RATING
// ***************
// type for value of deletedRating in redux store
interface DeletedRating {
  status: Status;
  success: boolean | null;
  message: string;
  code: number | null;
  rating: ReturnedDeletedRating | null;
}

const initialDeletedRatingState: DeletedRating = {
  status: "idle",
  success: null,
  message: "",
  code: null,
  rating: null
};

// REDUCERS
// ****************************

// GET ALL REVIEWS FOR A MOVIE
// ****************************
// this reducer sets the value for reviews in redux store
export const reviewsSlice = createSlice({
  name: "reviews",
  initialState: initialReviewsState,
  reducers: {
    addNewReview(state, action) {
      state.data.reviews?.unshift(action.payload.newReview);
    },
    removeDeletedReview(state, action) {
      if (state.data.reviews) {
        const newReviews = state.data.reviews.filter(
          review => review.id !== action.payload.review_id
        );
        state.data.reviews = newReviews;
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getReviews.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.page = 1),
          (state.total_pages = null),
          (state.data = {});
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = true),
          (state.message = action.payload.message),
          (state.page = action.payload.page),
          (state.total_pages = action.payload.total_pages),
          (state.data = action.payload.data);
      });
  }
});

export const { addNewReview } = reviewsSlice.actions;
export const { removeDeletedReview } = reviewsSlice.actions;
export const selectReveiws = (state: AppState) => state.reviews;
export const reviewsReducer = reviewsSlice.reducer;

// GET RATING AND LIKE FOR A MOVIE
// ********************************
// this reducer sets the value for ratingLike in redux store
export const ratingLikeSlice = createSlice({
  name: "ratingLike",
  initialState: intialRatingLikeState,
  reducers: {
    unsetRatingLike(state) {
      state.status = "idle";
      state.success = null;
      state.code = null;
      state.message = "";
      state.data = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getRatingLike.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.code = null),
          (state.data = null);
      })
      .addCase(getRatingLike.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.code = action.payload.code),
          (state.data = action.payload.data);
      });
  }
});

export const { unsetRatingLike } = ratingLikeSlice.actions;
export const selectRatingLike = (state: AppState) => state.ratingLike;
export const ratingLikeReducer = ratingLikeSlice.reducer;

// GET ALL RATINGS FOR A USER
// ***************************
// this reducer sets the value for ratings in redux store
export const ratingsSlice = createSlice({
  name: "ratings",
  initialState: initialRatingsState,
  reducers: {
    removeRatingByRatingId(state, action) {
      if (state.ratings) {
        const newRatings = [];

        for (let i = 0; i < state.ratings.length; i++) {
          if (state.ratings[i] === null) {
            break;
          }

          if (state.ratings[i].rating_id !== action.payload.rating_id) {
            newRatings.push(state.ratings[i]);
          }
        }
        state.ratings = newRatings;
      }
    },
    removeRatingByReviewId(state, action) {
      if (state.ratings) {
        const newRatings = [];

        for (let i = 0; i < state.ratings.length; i++) {
          if (state.ratings[i] === null) {
            break;
          }

          if (state.ratings[i].review_id !== action.payload.review_id) {
            newRatings.push(state.ratings[i]);
          }
        }

        state.ratings = newRatings;
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getRatings.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.page = 0),
          (state.total_pages = null),
          (state.ratings = null);
      })
      .addCase(getRatings.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.page = action.payload.page),
          (state.total_pages = action.payload.total_pages),
          (state.ratings = action.payload.ratings);
      });
  }
});

export const { removeRatingByRatingId } = ratingsSlice.actions;
export const { removeRatingByReviewId } = ratingsSlice.actions;
export const selectRatings = (state: AppState) => state.ratings;
export const ratingsReducer = ratingsSlice.reducer;

// CREATE A NEW REVIEW IN THE DATABASE
// ************************************
// this reducer sets the value for newReview in redux store
export const newReviewSlice = createSlice({
  name: "newReview",
  initialState: initialNewReviewState,
  reducers: {
    resetNewReview(state) {
      (state.status = "idle"),
        (state.success = null),
        (state.code = null),
        (state.message = ""),
        (state.data = null);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(postReview.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.code = null),
          (state.message = ""),
          (state.data = null);
      })
      .addCase(postReview.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.code = action.payload.code),
          (state.message = action.payload.message),
          (state.data = action.payload.data);
      });
  }
});

export const { resetNewReview } = newReviewSlice.actions;
export const selectNewReview = (state: AppState) => state.newReview;
export const newReviewReducer = newReviewSlice.reducer;

// DELETE RATING
// ***************
// this reducer sets the value for deletedRating in redux store
export const deletedRatingSlice = createSlice({
  name: "deletedRatingItem",
  initialState: initialDeletedRatingState,
  reducers: {
    resetDeletedRating(state) {
      (state.status = "idle"),
        (state.success = null),
        (state.message = ""),
        (state.code = null),
        (state.rating = null);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(deleteRating.pending, state => {
        (state.status = "loading"),
          (state.success = null),
          (state.message = ""),
          (state.code = null),
          (state.rating = null);
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        (state.status = "fulfilled"),
          (state.success = action.payload.success),
          (state.message = action.payload.message),
          (state.code = action.payload.code),
          (state.rating = action.payload.rating);
      });
  }
});

export const { resetDeletedRating } = deletedRatingSlice.actions;
export const selectDeletedRating = (state: AppState) => state.deletedRating;
export const deletedRatingReducer = deletedRatingSlice.reducer;
