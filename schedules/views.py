from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Schedule
from .serializers import ScheduleSerializer
from profiles.models import PsychologistProfile
from authentication.permissions import IsPsychologist, IsAdminUser
from django.db import IntegrityError
from django.db.models import Q

class ScheduleViewSet(viewsets.ModelViewSet):
    """API endpoint para horarios de psicólogos"""
    serializer_class = ScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'admin':
            return Schedule.objects.all()
        elif user.user_type == 'psychologist':
            try:
                psychologist = PsychologistProfile.objects.get(user=user)
                return Schedule.objects.filter(psychologist=psychologist)
            except PsychologistProfile.DoesNotExist:
                return Schedule.objects.none()
        return Schedule.objects.none()
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsPsychologist | IsAdminUser])
    def psychologist_schedule(self, request):
        """Endpoint para obtener el horario del psicólogo autenticado"""
        user = request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            psychologist = PsychologistProfile.objects.get(user=user)
            schedules = Schedule.objects.filter(psychologist=psychologist)
            
            # Format the schedule in the expected format for the frontend
            schedule_config = {}
            for schedule in schedules:
                day_key = schedule.day_of_week.lower()
                if day_key not in schedule_config:
                    schedule_config[day_key] = {
                        "enabled": True,
                        "timeBlocks": []
                    }
                
                schedule_config[day_key]["timeBlocks"].append({
                    "startTime": schedule.start_time.strftime('%H:%M'),
                    "endTime": schedule.end_time.strftime('%H:%M')
                })
            
            return Response({"schedule_config": schedule_config})
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de psicólogo."},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated, IsPsychologist | IsAdminUser])
    def update_psychologist_schedule(self, request):
        """Endpoint para actualizar el horario del psicólogo autenticado"""
        user = request.user
        if user.user_type != 'psychologist':
            return Response(
                {"detail": "Este endpoint es solo para psicólogos."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        try:
            psychologist = PsychologistProfile.objects.get(user=user)
            schedule_config = request.data.get('schedule_config', {})
            
            # Delete existing schedules
            Schedule.objects.filter(psychologist=psychologist).delete()
            
            # Track any duplicate entries
            duplicates = []
            created_schedules = []
            
            # Create new schedules
            for day, config in schedule_config.items():
                if config.get('enabled', False):
                    for time_block in config.get('timeBlocks', []):
                        try:
                            # Check if this time block overlaps with any existing ones
                            start_time = time_block['startTime']
                            end_time = time_block['endTime']
                            day_upper = day.upper()
                            
                            # Check for duplicates in the current batch
                            duplicate = False
                            for existing in created_schedules:
                                if (existing['day_of_week'] == day_upper and 
                                    existing['start_time'] == start_time and 
                                    existing['end_time'] == end_time):
                                    duplicate = True
                                    duplicates.append({
                                        'day': day,
                                        'startTime': start_time,
                                        'endTime': end_time
                                    })
                                    break
                            
                            if not duplicate:
                                # Add to our tracking list
                                created_schedules.append({
                                    'day_of_week': day_upper,
                                    'start_time': start_time,
                                    'end_time': end_time
                                })
                                
                                # Create the schedule
                                Schedule.objects.create(
                                    psychologist=psychologist,
                                    day_of_week=day_upper,
                                    start_time=start_time,
                                    end_time=end_time
                                )
                        except IntegrityError as e:
                            # Handle duplicate entries
                            duplicates.append({
                                'day': day,
                                'startTime': start_time,
                                'endTime': end_time
                            })
            
            if duplicates:
                return Response({
                    "detail": "Se encontraron horarios duplicados. Por favor revise los siguientes bloques:",
                    "duplicates": duplicates
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({"detail": "Horario actualizado correctamente."})
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de psicólogo."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({
                "detail": "Error al actualizar el horario.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def psychologist(self, request, pk=None):
        """Endpoint para obtener el horario de un psicólogo específico"""
        try:
            psychologist = PsychologistProfile.objects.get(id=pk)
            schedules = Schedule.objects.filter(psychologist=psychologist)
            
            # Format the schedule in the expected format for the frontend
            schedule_config = {}
            for schedule in schedules:
                day_key = schedule.day_of_week.lower()
                if day_key not in schedule_config:
                    schedule_config[day_key] = {
                        "enabled": True,
                        "timeBlocks": []
                    }
                
                schedule_config[day_key]["timeBlocks"].append({
                    "startTime": schedule.start_time.strftime('%H:%M'),
                    "endTime": schedule.end_time.strftime('%H:%M')
                })
            
            return Response({"schedule_config": schedule_config})
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "No se encontró el perfil de psicólogo."},
                status=status.HTTP_404_NOT_FOUND
            )
