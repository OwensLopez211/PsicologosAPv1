# Generated by Django 4.2.7 on 2025-04-01 21:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("profiles", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="professionaldocument",
            name="rejection_reason",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="professionaldocument",
            name="verification_status",
            field=models.CharField(
                choices=[
                    ("pending", "Pendiente"),
                    ("approved", "Aprobado"),
                    ("rejected", "Rechazado"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="professionaldocument",
            name="verified_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="professionaldocument",
            name="description",
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name="professionaldocument",
            name="document_type",
            field=models.CharField(
                choices=[
                    ("presentation_video", "Video de presentación"),
                    (
                        "registration_certificate",
                        "Certificado de inscripción en Registro Nacional",
                    ),
                    ("professional_id", "Carnet profesional"),
                    ("specialty_document", "Documento de especialidad"),
                ],
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name="professionaldocument",
            name="psychologist",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="verification_documents",
                to="profiles.psychologistprofile",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="professionaldocument",
            unique_together={("psychologist", "document_type")},
        ),
    ]
