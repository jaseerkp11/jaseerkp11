import type { Role } from "@prisma/client";

export const STAFF_ROLES: Role[] = ["STAFF", "ADMIN", "SUPER_ADMIN"];
export const ADMIN_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"];

export function isStaff(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

export function isAdmin(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}

export const PERMISSIONS = {
  viewProducts: "products.view",
  editProducts: "products.edit",
  deleteProducts: "products.delete",
  viewOrders: "orders.view",
  refundOrders: "orders.refund",
  manageCustomers: "customers.manage",
  manageSuppliers: "suppliers.manage",
  manageMarketing: "marketing.manage",
  manageContent: "content.manage",
  viewAnalytics: "analytics.view",
  manageSettings: "settings.manage",
} as const;

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  CUSTOMER: [],
  RESELLER: [],
  STAFF: [
    PERMISSIONS.viewProducts,
    PERMISSIONS.editProducts,
    PERMISSIONS.viewOrders,
    PERMISSIONS.viewAnalytics,
  ],
  ADMIN: Object.values(PERMISSIONS),
  SUPER_ADMIN: Object.values(PERMISSIONS),
};

export function hasPermission(role: Role, permission: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
