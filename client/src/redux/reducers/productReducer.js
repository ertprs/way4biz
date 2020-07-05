import {
  FETCH_PRODUCTS_SEARCH,
  FETCH_PRODUCTS_FAILED,
  FETCH_PRODUCTS,
  FETCH_CATEGORIES,
  SINGLE_CATEGORY
} from "../actions/types";

const INITIAL_STATE = {
  searchedProducts: [],
  productsError: null,
  products: [],
  categories: [],
  singleCategoryProducts: []
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_PRODUCTS_SEARCH:
      return { ...state, searchedProducts: action.payload };
    case FETCH_PRODUCTS:
      return { ...state, products: action.payload };
    case FETCH_PRODUCTS_FAILED:
      return { ...state, productsError: "Fetching products failed" };
    case FETCH_CATEGORIES:
      return { ...state, categories: action.payload };
    case SINGLE_CATEGORY:
      return { ...state, singleCategoryProducts: action.payload };
    default:
      return state;
  }
};
