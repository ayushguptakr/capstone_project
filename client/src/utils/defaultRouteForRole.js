export function defaultRouteForRole(role) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "principal":
      return "/principal/dashboard";
    case "teacher":
      return "/teacher-dashboard";
    case "student":
    default:
      return "/dashboard";
  }
}

