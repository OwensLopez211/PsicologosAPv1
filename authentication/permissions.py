from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'admin'

class IsPsychologist(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'psychologist'

class IsClient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'client'