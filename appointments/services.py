from datetime import datetime, timedelta, time
from .models import Appointment
from profiles.models import PsychologistProfile, Schedule

def get_available_slots(psychologist_id, date):
    """
    Obtiene los slots disponibles para un psicólogo en una fecha específica.
    
    Args:
        psychologist_id: ID del perfil del psicólogo (no del usuario)
        date: Objeto date para el cual se quieren obtener los slots
    
    Returns:
        Lista de slots disponibles con formato {start_time, end_time}
    """
    try:
        # Obtener el perfil del psicólogo
        psychologist = PsychologistProfile.objects.get(id=psychologist_id)
        print(f"Getting available slots for psychologist profile ID: {psychologist_id}")
        
        # Obtener el horario del psicólogo
        try:
            schedule = Schedule.objects.get(psychologist=psychologist)
            schedule_config = schedule.schedule_config
            print(f"Found schedule for psychologist: {schedule_config}")
        except Schedule.DoesNotExist:
            print(f"No schedule found for psychologist ID: {psychologist_id}")
            # Si no tiene horario configurado, no hay slots disponibles
            return []
        
        # Obtener el día de la semana (en inglés, en minúsculas)
        day_name = date.strftime('%A').lower()
        print(f"Day of week: {day_name}")
        
        # Mapear los nombres de días en inglés a las claves en schedule_config
        day_mapping = {
            'monday': 'monday',
            'tuesday': 'tuesday',
            'wednesday': 'wednesday',
            'thursday': 'thursday',
            'friday': 'friday',
            'saturday': 'saturday',
            'sunday': 'sunday'
        }
        
        day_key = day_mapping.get(day_name, day_name)
        print(f"Looking for day key: {day_key} in schedule_config")
        
        # Obtener la configuración para ese día
        day_schedule = schedule_config.get(day_key, {})
        print(f"Day schedule: {day_schedule}")
        
        # Si el día no está habilitado, no hay slots disponibles
        if not day_schedule.get('enabled', False):
            print(f"Day {day_key} is not enabled in schedule")
            return []
        
        # Obtener los bloques de tiempo configurados para ese día
        time_blocks = day_schedule.get('timeBlocks', [])
        print(f"Time blocks for day: {time_blocks}")
        
        if not time_blocks:
            print("No time blocks configured for this day")
            return []
        
        # Obtener las citas existentes para ese día
        existing_appointments = Appointment.objects.filter(
            psychologist_id=psychologist_id,
            date=date,
            status__in=['PENDING', 'CONFIRMED', 'PAYMENT_PENDING']
        )
        print(f"Found {existing_appointments.count()} existing appointments for this day")
        
        # Crear una lista de slots ocupados
        occupied_slots = []
        for appointment in existing_appointments:
            occupied_slots.append({
                'start': appointment.start_time,
                'end': appointment.end_time
            })
            print(f"Occupied slot: {appointment.start_time} - {appointment.end_time}")
        
        # Crear una lista de slots disponibles
        available_slots = []
        
        # Para cada bloque de tiempo configurado
        for block in time_blocks:
            start_str = block.get('startTime')
            end_str = block.get('endTime')
            
            if not start_str or not end_str:
                print(f"Invalid time block: {block}")
                continue
            
            # Convertir strings de tiempo a objetos time
            try:
                start_time = datetime.strptime(start_str, '%H:%M').time()
                end_time = datetime.strptime(end_str, '%H:%M').time()
                print(f"Processing time block: {start_time} - {end_time}")
            except ValueError as e:
                print(f"Error parsing time: {e}")
                continue
            
            # Duración de la cita en minutos (por defecto 60 minutos)
            appointment_duration = 60
            
            # Generar slots con la duración especificada
            current_start = start_time
            while True:
                # Calcular el tiempo de fin para este slot
                current_end_dt = datetime.combine(date, current_start) + timedelta(minutes=appointment_duration)
                current_end = current_end_dt.time()
                
                # Si el fin del slot es después del fin del bloque, terminar
                if current_end > end_time:
                    break
                
                # Verificar si el slot está ocupado
                is_occupied = False
                for occupied in occupied_slots:
                    occupied_start = occupied['start']
                    occupied_end = occupied['end']
                    
                    # Si hay solapamiento, el slot está ocupado
                    if (current_start < occupied_end and current_end > occupied_start):
                        is_occupied = True
                        print(f"Slot {current_start} - {current_end} is occupied")
                        break
                
                # Si el slot no está ocupado, agregarlo a la lista de disponibles
                if not is_occupied:
                    available_slots.append({
                        'start_time': current_start.strftime('%H:%M'),
                        'end_time': current_end.strftime('%H:%M')
                    })
                    print(f"Added available slot: {current_start} - {current_end}")
                
                # Avanzar al siguiente slot
                current_start = current_end_dt.time()
        
        print(f"Total available slots: {len(available_slots)}")
        return available_slots
        
    except PsychologistProfile.DoesNotExist:
        print(f"Psychologist profile with ID {psychologist_id} does not exist")
        return []
    except Exception as e:
        print(f"Error getting available slots: {e}")
        return []