export const getSenderDetails = (currentUser, allUsers) => {
  return allUsers?.filter((user) => user._id !== currentUser._id)[0];
};

export const getSenderName = (currentUser, allUsers) => {
  const user = allUsers?.filter((user) => user._id !== currentUser._id)[0];
  return user?.firstName + " " + user?.lastName;
};
