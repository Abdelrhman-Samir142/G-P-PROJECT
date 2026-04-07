"""
Custom permission classes for admin and security.
"""
from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """
    Allows access only to admin users (is_staff=True).
    Checks both request.user.is_staff and JWT token claims.
    """
    message = "You do not have permission to access this resource. Admin access required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsSuperAdminUser(BasePermission):
    """
    Allows access only to superadmin users (is_superuser=True).
    """
    message = "You do not have permission to access this resource. Superadmin access required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)
