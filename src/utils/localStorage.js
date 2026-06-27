// Save Data
export const saveData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Get Data
export const getData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Remove Data
export const removeData = (key) => {
  localStorage.removeItem(key);
};