from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET

from .models import Email


@require_GET
def reveal_email(request, email_id):
    email = get_object_or_404(Email, pk=email_id)
    return JsonResponse({"email": email.email})
