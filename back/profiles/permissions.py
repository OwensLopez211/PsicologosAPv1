from rest_framework import permissions

class IsProfileOwner(permissions.BasePermission):
    """
    Permite acceso solo si el usuario es dueño del perfil.
    """
    def has_object_permission(self, request, view, obj):
        # El usuario debe ser el dueño del perfil
        return obj.user == request.user

class IsAdminUser(permissions.BasePermission):
    """
    Permite acceso solo a usuarios administradores.
    """
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'admin'

class IsPsychologist(permissions.BasePermission):
    """
    Permite acceso solo a usuarios psicólogos.
    """
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'psychologist'

class IsClient(permissions.BasePermission):
    """
    Permite acceso solo a usuarios clientes.
    """
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'client'

class IsAdminOrClient(permissions.BasePermission):
    """
    Permite acceso a usuarios administradores o clientes.
    """
    def has_permission(self, request, view):
        return request.user and (request.user.user_type == 'admin' or request.user.user_type == 'client')