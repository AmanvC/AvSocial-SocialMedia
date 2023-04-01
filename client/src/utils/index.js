export const getItemFromLocalStorage = (key) => {
  if (!key) {
    console.error("Cannot get value from local storage without a key!");
    return;
  }
  return localStorage.getItem(key);
};

export const removeItemFromLocalStorage = (key) => {
  if (!key) {
    console.error("Cannot remove value from local storage without a key.");
    return;
  }
  localStorage.removeItem(key);
};

export const setItemInLocalStorage = (key, value) => {
  if (!key || !value) {
    console.error("Cannot set item without a key or value");
    return;
  }
  const valueToStore =
    typeof value === "string" ? value : JSON.stringify(value);
  localStorage.setItem(key, valueToStore);
};
