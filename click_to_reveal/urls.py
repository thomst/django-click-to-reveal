from django.urls import path

from . import views


app_name = "click_to_reveal"

urlpatterns = [
    path("email/<int:email_id>/", views.reveal_email, name="reveal_email"),
]
