Profiles signals imported successfully!
# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models
# Unable to inspect table 'profiles_psychologistportfolio'
# The error was: no existe la relaci¾n ½profiles_psychologistportfolio╗
LINE 1: SELECT * FROM "profiles_psychologistportfolio" LIMIT 1
                      ^


class ProfilesProfessionalexperience(models.Model):
    id = models.BigAutoField(primary_key=True)
    experience_type = models.CharField(max_length=20)
    institution = models.CharField(max_length=200)
    role = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField()
    psychologist = models.ForeignKey('ProfilesPsychologistprofile', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'profiles_professionalexperience'


class PricingPromotionaldiscount(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    code = models.CharField(unique=True, max_length=20)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    max_uses = models.IntegerField()
    current_uses = models.IntegerField()
    is_active = models.BooleanField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pricing_promotionaldiscount'


class SchedulesSchedule(models.Model):
    id = models.BigAutoField(primary_key=True)
    day_of_week = models.CharField(max_length=10)
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    psychologist = models.ForeignKey('ProfilesPsychologistprofile', models.DO_NOTHING)
    user_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'schedules_schedule'
        unique_together = (('psychologist', 'day_of_week', 'start_time', 'end_time'),)
