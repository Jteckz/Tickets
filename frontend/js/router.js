function protectPage(roles = []) {
  requireAuth();
  const user = getUser();
  if (roles.length && !roles.includes(user.role)) {
    alert("Unauthorized");
    logout();
  }
}
