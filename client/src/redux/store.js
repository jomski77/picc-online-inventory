import { configureStore, combineReducers } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import themeReducer from './theme/themeSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { baseApi } from './api/baseApi';
import { setupListeners } from '@reduxjs/toolkit/query';

const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  blacklist: [baseApi.reducerPath] // Don't persist API cache
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(baseApi.middleware),
});

// Enable API features
setupListeners(store.dispatch);

export const persistor = persistStore(store); 