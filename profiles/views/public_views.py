from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import AdminProfile

class PublicBankInfoView(APIView):
    """API endpoint para obtener información bancaria pública"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Endpoint público para obtener los datos bancarios del administrador (accesible para cualquier usuario autenticado)"""
        # Obtener el perfil del administrador (tomamos el primero)
        admin_profile = AdminProfile.objects.first()
        
        if not admin_profile:
            return Response(
                {"detail": "No se encontró ningún perfil de administrador."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Devolver solo la información bancaria
        bank_data = {
            'bank_account_number': admin_profile.bank_account_number,
            'bank_account_type': admin_profile.bank_account_type,
            'bank_account_owner': admin_profile.bank_account_owner,
            'bank_account_owner_rut': admin_profile.bank_account_owner_rut,
            'bank_account_owner_email': admin_profile.bank_account_owner_email,
            'bank_name': admin_profile.bank_name
        }
        
        return Response(bank_data)