export const getUserInfo = () => {
  const raw =
    sessionStorage.getItem("userInfo") || localStorage.getItem("userInfo");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setUserInfo = (userData) => {
  const serialized = JSON.stringify(userData);
  sessionStorage.setItem("userInfo", serialized);
  localStorage.removeItem("userInfo");
};

export const clearUserInfo = () => {
  sessionStorage.removeItem("userInfo");
  localStorage.removeItem("userInfo");
};
