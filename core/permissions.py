from rest_framework.permissions import BasePermission

class IsProvider(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "provider"

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "admin"

class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "staff"
